export interface ErrorSummary {
  totalErrors: number;
  errorRate: number;
  clientErrors: number;
  serverErrors: number;
}

export interface ErrorTrend {
  time: string;
  errors: number;
}

export interface StatusCode {
  code: string;
  count: number;
}

export interface ErrorEndpoint {
  endpoint: string;
  errors: number;
}

export interface ErrorResponse {
  summary: ErrorSummary;
  trend: ErrorTrend[];
  statusCodes: StatusCode[];
  endpoints: ErrorEndpoint[];
}