import axios from "axios";
import { ObservatoryConfig, MetricData } from "./types";

const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_FLUSH_INTERVAL = 5000;
const DEFAULT_TIMEOUT = 5000;
const DEFAULT_MAX_RETRIES = 3;

export class Observatory {
    private config: Required<ObservatoryConfig>;
    private queue: MetricData[] = [];
    private timer: ReturnType<typeof setInterval> | null = null;

    constructor(config: ObservatoryConfig) {
        if (!config.apiKey) throw new Error("[Observatory] apiKey is required");
        if (!config.serverUrl) throw new Error("[Observatory] serverUrl is required");

        this.config = {
            apiKey: config.apiKey,
            serverUrl: config.serverUrl.replace(/\/$/, ""),
            batchSize: config.batchSize ?? DEFAULT_BATCH_SIZE,
            flushInterval: config.flushInterval ?? DEFAULT_FLUSH_INTERVAL,
            timeout: config.timeout ?? DEFAULT_TIMEOUT,
            maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
            debug: config.debug ?? false,
        };

        this.startFlushTimer();
    }

    track(metric: MetricData): void {
        if (!metric.endpoint || metric.latency == null || metric.statusCode == null) {
            this.log("Invalid metric data, skipping:", metric);
            return;
        }

        this.queue.push(metric);

        if (this.queue.length >= this.config.batchSize) {
            this.flush();
        }
    }

    async flush(): Promise<void> {
        if (this.queue.length === 0) return;

        const batch = this.queue.splice(0, this.config.batchSize);
        await this.sendWithRetry(batch);
    }

    async shutdown(): Promise<void> {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        await this.flush();
    }

    private startFlushTimer(): void {
        this.timer = setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }

    private async sendWithRetry(batch: MetricData[], attempt = 1): Promise<void> {
        try {
            await axios.post(
                `${this.config.serverUrl}/ingestion/batch`,
                {
                    metrics: batch.map((m) => ({
                        endpoint: m.endpoint,
                        method: m.method,
                        latency: m.latency,
                        requests: 1,
                        statusCode: m.statusCode,
                    })),
                },
                {
                    headers: { "x-api-key": this.config.apiKey },
                    timeout: this.config.timeout,
                },
            );

            this.log(`Sent batch of ${batch.length} metrics`);
        } catch (error: any) {
            if (attempt < this.config.maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                this.log(`Retry ${attempt}/${this.config.maxRetries} in ${delay}ms`);
                await this.sleep(delay);
                return this.sendWithRetry(batch, attempt + 1);
            }

            this.log(`Failed to send batch after ${this.config.maxRetries} retries:`, error.message);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private log(...args: any[]): void {
        if (this.config.debug) {
            console.log("[Observatory]", ...args);
        }
    }
}
