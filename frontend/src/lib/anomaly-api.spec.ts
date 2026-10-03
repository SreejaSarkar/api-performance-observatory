import { getAnomalies } from "./anomaly-api";

describe("anomaly-api", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    fetchMock.mockReset();
    localStorage.clear();
  });

  it("loads anomalies with the stored API key header", async () => {
    localStorage.setItem("apiKey", "project-key");
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue([{ id: "anomaly-1" }]),
      ok: true,
    } as unknown as Response);

    await expect(getAnomalies()).resolves.toEqual([{ id: "anomaly-1" }]);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/anomalies/history", {
      headers: {
        "x-api-key": "project-key",
      },
    });
  });

  it("throws when the anomaly request fails", async () => {
    fetchMock.mockResolvedValue({ ok: false } as Response);

    await expect(getAnomalies()).rejects.toThrow("Failed to load anomalies");
  });
});
