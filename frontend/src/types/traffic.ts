export interface TrafficSummary {
  totalRequests: number;
  requestsPerMinute: number;
  activeEndpoints: number;
  peakTraffic: number;
}

export interface TrafficTrend {
  time: string;
  requests: number;
}

export interface TrafficEndpoint {
  endpoint: string;
  requests: number;
}

export interface TrafficResponse {
  summary: TrafficSummary;
  trend: TrafficTrend[];
  endpoints: TrafficEndpoint[];
}