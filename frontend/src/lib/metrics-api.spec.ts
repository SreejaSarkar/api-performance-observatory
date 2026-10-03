import {
  getComparison,
  getEndpointDetail,
  getLatencyDistribution,
  getSlowEndpoints,
  getTraffic,
  getTrend,
} from "./metrics-api";

describe("metrics-api", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    fetchMock.mockReset();
    localStorage.clear();
    localStorage.setItem("apiKey", "metrics-key");
  });

  it("loads trend, traffic, and latency distribution for the requested hours", async () => {
    fetchMock
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue([{ time: "t1" }]) } as unknown as Response)
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue([{ requests: 10 }]) } as unknown as Response)
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ fast: 3 }) } as unknown as Response);

    await expect(getTrend(24)).resolves.toEqual([{ time: "t1" }]);
    await expect(getTraffic(24)).resolves.toEqual([{ requests: 10 }]);
    await expect(getLatencyDistribution(24)).resolves.toEqual({ fast: 3 });

    expect(fetchMock.mock.calls).toEqual([
      [
        "http://localhost:3001/metrics/trend?hours=24",
        { headers: { "x-api-key": "metrics-key" } },
      ],
      [
        "http://localhost:3001/metrics/traffic?hours=24",
        { headers: { "x-api-key": "metrics-key" } },
      ],
      [
        "http://localhost:3001/metrics/latency-distribution?hours=24",
        { headers: { "x-api-key": "metrics-key" } },
      ],
    ]);
  });

  it("loads slow endpoints and comparison data", async () => {
    fetchMock
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue([{ endpoint: "/payments" }]) } as unknown as Response)
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ current: {}, previous: {} }) } as unknown as Response);

    await expect(getSlowEndpoints()).resolves.toEqual([{ endpoint: "/payments" }]);
    await expect(getComparison(48)).resolves.toEqual({ current: {}, previous: {} });

    expect(fetchMock.mock.calls).toEqual([
      [
        "http://localhost:3001/metrics/slow-endpoints",
        { headers: { "x-api-key": "metrics-key" } },
      ],
      [
        "http://localhost:3001/metrics/comparison?hours=48",
        { headers: { "x-api-key": "metrics-key" } },
      ],
    ]);
  });

  it("encodes endpoint paths when requesting endpoint detail", async () => {
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ stats: { avgLatency: 100 } }),
    } as unknown as Response);

    await expect(getEndpointDetail("/api/orders", 12)).resolves.toEqual({
      stats: { avgLatency: 100 },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/metrics/endpoint-detail/%2Fapi%2Forders?hours=12",
      { headers: { "x-api-key": "metrics-key" } },
    );
  });
});
