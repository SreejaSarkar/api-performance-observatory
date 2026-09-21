import axios from "axios";
import type { AxiosError } from "axios";
import {
    ObservatoryConfig,
    MetricData,
    ObservatoryStats,
} from "./types";
import { createExpressMiddleware, createNestInterceptor } from "./integrations";

const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_FLUSH_INTERVAL = 5000;
const DEFAULT_TIMEOUT = 5000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_SERVER_URL = "https://api-performance-backend-lksd.onrender.com";
const DEFAULT_MAX_QUEUE_SIZE = 1000;
const MAX_RETRY_DELAY = 10000;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

function getEnvironmentVariable(name: string): string | undefined {
    if (typeof process === "undefined") {
        return undefined;
    }

    return process.env?.[name];
}

export class Observatory {
    private config: Required<ObservatoryConfig>;
    private queue: MetricData[] = [];
    private timer: ReturnType<typeof setInterval> | null = null;
    private flushPromise: Promise<void> | null = null;
    private stats: ObservatoryStats = {
        queued: 0,
        sent: 0,
        failed: 0,
        dropped: 0,
        retries: 0,
    };

    constructor(config: ObservatoryConfig) {
        if (!config.apiKey) throw new Error("[Observatory] apiKey is required");

        this.config = {
            apiKey: config.apiKey,
            serverUrl: (config.serverUrl ?? DEFAULT_SERVER_URL).replace(/\/$/, ""),
            environment: config.environment ?? getEnvironmentVariable("NODE_ENV") ?? "production",
            batchSize: config.batchSize ?? DEFAULT_BATCH_SIZE,
            flushInterval: config.flushInterval ?? DEFAULT_FLUSH_INTERVAL,
            timeout: config.timeout ?? DEFAULT_TIMEOUT,
            maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
            maxQueueSize: config.maxQueueSize ?? DEFAULT_MAX_QUEUE_SIZE,
            debug: config.debug ?? false,
            onError: config.onError ?? (() => undefined),
            onDrop: config.onDrop ?? (() => undefined),
        };

        this.startFlushTimer();
    }

    track(metric: MetricData): void {
        if (!metric.endpoint || metric.latency == null || metric.statusCode == null) {
            this.log("Invalid metric data, skipping:", metric);
            return;
        }

        const normalizedMetric: MetricData = {
            ...metric,
            environment: metric.environment ?? this.config.environment,
            timestamp: metric.timestamp ?? new Date().toISOString(),
        };

        if (this.queue.length >= this.config.maxQueueSize) {
            this.stats.dropped += 1;
            this.log("Queue full, dropping metric", normalizedMetric.endpoint);
            this.config.onDrop(normalizedMetric, "queue_full");
            return;
        }

        this.queue.push(normalizedMetric);
        this.stats.queued = this.queue.length;

        if (this.queue.length >= this.config.batchSize) {
            void this.flush();
        }
    }

    express() {
        return createExpressMiddleware(this);
    }

    nest() {
        return createNestInterceptor(this);
    }

    async flush(): Promise<void> {
        if (this.flushPromise) {
            return this.flushPromise;
        }

        this.flushPromise = this.flushLoop();

        try {
            await this.flushPromise;
        } finally {
            this.flushPromise = null;
        }
    }

    async shutdown(): Promise<void> {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        await this.flush();
    }

    getStats(): ObservatoryStats {
        return {
            ...this.stats,
            queued: this.queue.length,
        };
    }

    private startFlushTimer(): void {
        this.timer = setInterval(() => {
            void this.flush();
        }, this.config.flushInterval);

        if (typeof this.timer.unref === "function") {
            this.timer.unref();
        }
    }

    private async flushLoop(): Promise<void> {
        while (this.queue.length > 0) {
            const batch = this.queue.slice(0, this.config.batchSize);
            const success = await this.sendWithRetry(batch);

            if (!success) {
                return;
            }

            this.queue.splice(0, batch.length);
            this.stats.queued = this.queue.length;
        }
    }

    private async sendWithRetry(batch: MetricData[]): Promise<boolean> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.config.maxRetries; attempt += 1) {
            try {
                await axios.post(
                    `${this.config.serverUrl}/ingestion/batch`,
                    {
                        metrics: batch.map((metric) => this.serializeMetric(metric)),
                    },
                    {
                        headers: { "x-api-key": this.config.apiKey },
                        timeout: this.config.timeout,
                    },
                );

                this.stats.sent += batch.length;
                this.log(`Sent batch of ${batch.length} metrics`);
                return true;
            } catch (error) {
                const normalizedError = this.normalizeError(error);
                lastError = normalizedError;

                if (!this.shouldRetry(error) || attempt >= this.config.maxRetries) {
                    break;
                }

                this.stats.retries += 1;
                const delay = this.getRetryDelayMs(error, attempt);
                this.log(`Retry ${attempt}/${this.config.maxRetries} in ${delay}ms`);
                await this.sleep(delay);
            }
        }

        this.stats.failed += batch.length;
        if (lastError) {
            this.log(`Failed to send batch after ${this.config.maxRetries} attempts:`, lastError.message);
            this.config.onError(lastError);
        }

        return false;
    }

    private serializeMetric(metric: MetricData) {
        return {
            endpoint: metric.endpoint,
            method: metric.method,
            latency: metric.latency,
            requests: 1,
            statusCode: metric.statusCode,
            timestamp: metric.timestamp,
            requestId: metric.requestId,
            responseSize: metric.responseSize,
            userAgent: metric.userAgent,
            environment: metric.environment,
            metadata: metric.metadata,
        };
    }

    private shouldRetry(error: unknown): boolean {
        if (!axios.isAxiosError(error)) {
            return false;
        }

        if (!error.response) {
            return true;
        }

        return RETRYABLE_STATUS_CODES.has(error.response.status);
    }

    private getRetryDelayMs(error: unknown, attempt: number): number {
        const retryAfterMs = this.getRetryAfterMs(error);

        if (retryAfterMs != null) {
            return retryAfterMs;
        }

        const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), MAX_RETRY_DELAY);
        const jitter = Math.floor(Math.random() * 250);
        return baseDelay + jitter;
    }

    private getRetryAfterMs(error: unknown): number | null {
        if (!axios.isAxiosError(error)) {
            return null;
        }

        const retryAfterHeader = error.response?.headers?.["retry-after"];

        if (retryAfterHeader == null) {
            return null;
        }

        const headerValue = Array.isArray(retryAfterHeader)
            ? retryAfterHeader[0]
            : retryAfterHeader;

        const seconds = Number(headerValue);
        if (Number.isFinite(seconds)) {
            return Math.max(0, seconds * 1000);
        }

        const retryAt = Date.parse(String(headerValue));
        if (!Number.isNaN(retryAt)) {
            return Math.max(0, retryAt - Date.now());
        }

        return null;
    }

    private normalizeError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            return new Error(axiosError.message);
        }

        return new Error("Unknown Observatory error");
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private log(...args: unknown[]): void {
        if (this.config.debug) {
            console.log("[Observatory]", ...args);
        }
    }
}
