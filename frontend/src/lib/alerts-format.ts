const metricConfig = {
  LATENCY: {
    label: "Latency",
    unit: "ms",
    thresholdLabel: "Threshold (milliseconds)",
    description:
      "Triggers when the 72-hour average latency rises above this number of milliseconds.",
  },
  ERROR_RATE: {
    label: "Error rate",
    unit: "%",
    thresholdLabel: "Threshold (percentage)",
    description:
      "Triggers when the 72-hour project error rate rises above this percentage.",
  },
  HEALTH_SCORE: {
    label: "Health score",
    unit: "/100",
    thresholdLabel: "Minimum health score",
    description:
      "Triggers when the 72-hour health score drops below this score out of 100.",
  },
} as const;

export function getAlertMetricConfig(metric: string) {
  return (
    metricConfig[metric as keyof typeof metricConfig] ?? {
      label: metric,
      unit: "",
      thresholdLabel: "Threshold",
      description: "Alert threshold for the selected metric.",
    }
  );
}

export function formatAlertMetricValue(
  value: number,
  unit: string,
) {
  if (unit === "%") {
    return `${Number(value.toFixed(2))}%`;
  }

  if (unit === "ms") {
    return `${Math.round(value)} ms`;
  }

  if (unit === "/100") {
    return `${Math.round(value)}/100`;
  }

  return `${value}`;
}