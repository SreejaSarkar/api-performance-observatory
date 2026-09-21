export interface ObservatoryConfig {
    apiKey: string;
    serverUrl?: string;
    environment?: string;
    batchSize?: number;
    flushInterval?: number;
    timeout?: number;
    maxRetries?: number;
    maxQueueSize?: number;
    debug?: boolean;
    onError?: (error: Error) => void;
    onDrop?: (metric: MetricData, reason: "queue_full") => void;
}

export interface MetricData {
    endpoint: string;
    method: string;
    latency: number;
    statusCode: number;
    timestamp?: string;
    requestId?: string;
    responseSize?: number;
    userAgent?: string;
    environment?: string;
    metadata?: Record<string, unknown>;
}

export interface ObservatoryStats {
    queued: number;
    sent: number;
    failed: number;
    dropped: number;
    retries: number;
}

export interface TrackMetricOptions extends MetricData {
    apiKey: string;
    serverUrl?: string;
    environment?: string;
    timeout?: number;
}