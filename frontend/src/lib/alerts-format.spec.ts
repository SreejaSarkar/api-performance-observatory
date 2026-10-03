import {
  formatAlertMetricValue,
  getAlertMetricConfig,
} from "./alerts-format";

describe("alerts-format", () => {
  it("returns the configured metadata for known metrics", () => {
    expect(getAlertMetricConfig("LATENCY")).toEqual({
      description:
        "Triggers when the 72-hour average latency rises above this number of milliseconds.",
      label: "Latency",
      thresholdLabel: "Threshold (milliseconds)",
      unit: "ms",
    });
  });

  it("returns a generic fallback for unknown metrics", () => {
    expect(getAlertMetricConfig("CUSTOM_METRIC")).toEqual({
      description: "Alert threshold for the selected metric.",
      label: "CUSTOM_METRIC",
      thresholdLabel: "Threshold",
      unit: "",
    });
  });

  it("formats percentage values with two-decimal precision", () => {
    expect(formatAlertMetricValue(12.3456, "%")).toBe("12.35%");
  });

  it("formats millisecond and health score units", () => {
    expect(formatAlertMetricValue(142.8, "ms")).toBe("143 ms");
    expect(formatAlertMetricValue(97.6, "/100")).toBe("98/100");
  });

  it("falls back to the raw numeric string for unknown units", () => {
    expect(formatAlertMetricValue(42, "req")).toBe("42");
  });
});
