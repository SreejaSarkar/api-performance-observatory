export interface ObservatoryConfig {
    apiKey: string;
    serverUrl: string;
    batchSize?: number;
    flushInterval?: number;
    timeout?: number;
    maxRetries?: number;
    debug?: boolean;
}

export interface MetricData {
    endpoint: string;
    method: string;
    latency: number;
    statusCode: number;
}

export interface TrackMetricOptions extends MetricData {
    apiKey: string;
    serverUrl: string;
}