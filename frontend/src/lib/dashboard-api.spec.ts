import { getDashboard } from "./dashboard-api";

describe("dashboard-api", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    fetchMock.mockReset();
    localStorage.clear();
  });

  it("loads dashboard data with the selected project API key", async () => {
    localStorage.setItem("apiKey", "project-key");
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ summary: { requests: 1 } }),
      ok: true,
    } as unknown as Response);

    await expect(getDashboard(24)).resolves.toEqual({ summary: { requests: 1 } });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/dashboard?hours=24", {
      headers: {
        "x-api-key": "project-key",
      },
    });
  });

  it("throws when dashboard loading fails", async () => {
    fetchMock.mockResolvedValue({ ok: false } as Response);

    await expect(getDashboard()).rejects.toThrow("Failed to load dashboard");
  });
});
