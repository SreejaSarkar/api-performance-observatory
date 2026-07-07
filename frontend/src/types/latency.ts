export interface LatencySummary {
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  requests: number;
}

export interface LatencyTrend {
  time: string;
  latency: number;
}

export interface LatencyEndpoint {
  endpoint: string;
  p50: number;
  p95: number;
  p99: number;
}

export interface LatencyResponse {
  summary: LatencySummary;
  trend: LatencyTrend[];
  endpoints: LatencyEndpoint[];
}