export interface TrendPoint {
    time: string;

    latency: number;
}

export interface TrafficPoint {
    time: string;

    requests: number;
}

export interface LatencyDistribution {
    "0-100": number;

    "100-250": number;

    "250-500": number;

    "500+": number;
}