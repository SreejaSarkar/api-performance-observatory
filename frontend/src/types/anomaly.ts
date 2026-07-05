export interface Anomaly {
  id: string;

  type: string;

  endpoint: string;

  value: number;

  threshold: number;

  severity: string;

  resolved: boolean;

  resolvedAt: string | null;

  detectedAt: string;
}