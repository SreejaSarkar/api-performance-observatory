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

  severity: string;

  value: number;

  threshold: number;

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