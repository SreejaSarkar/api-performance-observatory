export interface AlertRule {
    id: string;

    name: string;

    metric: string;

    threshold: number;

    severity: string;
}

export interface AlertEvent {
  id: string;

  rule: string;

  metric: string;

  severity: string;

  value: number;

  threshold: number;

  unit: string;

  breachDirection: "above" | "below";

  triggerSource: string | null;

  triggerSourceLabel: string;

  triggerSourceValue: number | null;

  breachEndpoints: Array<{
    endpoint: string;
    value: number;
    unit: string;
  }>;

  acknowledged: boolean;

  resolved: boolean;

  triggeredAt: string;
}

export interface AlertStats {
  totalAlerts: number;

  todayAlerts: number;

  criticalAlerts: number;

  acknowledgedAlerts: number;

  unacknowledgedAlerts: number;

  resolvedAlerts: number;

  openAlerts: number;
}