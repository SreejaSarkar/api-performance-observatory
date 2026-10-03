import {
  acknowledge,
  createRule,
  deleteRule,
  getEvents,
  getRules,
  getStats,
  resolve,
  updateRule,
} from "./alerts-api";

describe("alerts-api", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    localStorage.clear();
    fetchMock.mockReset();
  });

  it("reads stats with the stored API key header", async () => {
    localStorage.setItem("apiKey", "project-key");
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ totalAlerts: 3 }),
      ok: true,
    } as unknown as Response);

    await expect(getStats()).resolves.toEqual({ totalAlerts: 3 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/alerts/stats",
      {
        headers: {
          "x-api-key": "project-key",
        },
      },
    );
  });

  it("creates a rule with JSON headers and body", async () => {
    localStorage.setItem("apiKey", "project-key");
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ id: "rule-1" }),
      ok: true,
    } as unknown as Response);

    await expect(
      createRule({
        metric: "LATENCY",
        name: "Slow requests",
        severity: "HIGH",
        threshold: 500,
      }),
    ).resolves.toEqual({ id: "rule-1" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/alerts/rules",
      {
        body: JSON.stringify({
          metric: "LATENCY",
          name: "Slow requests",
          severity: "HIGH",
          threshold: 500,
        }),
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "project-key",
        },
        method: "POST",
      },
    );
  });

  it("throws when deleting a rule fails", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    } as Response);

    await expect(deleteRule("rule-1")).rejects.toThrow(
      "Failed to delete alert rule",
    );
  });

  it("updates a rule with the patch endpoint", async () => {
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ id: "rule-1", name: "Updated" }),
      ok: true,
    } as unknown as Response);

    await expect(
      updateRule("rule-1", {
        metric: "ERROR_RATE",
        name: "Updated",
        severity: "MEDIUM",
        threshold: 10,
      }),
    ).resolves.toEqual({ id: "rule-1", name: "Updated" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/alerts/rules/rule-1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("loads rules and events from their endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue([{ id: "rule-1" }]),
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue([{ id: "event-1" }]),
      } as unknown as Response);

    await expect(getRules()).resolves.toEqual([{ id: "rule-1" }]);
    await expect(getEvents()).resolves.toEqual([{ id: "event-1" }]);

    expect(fetchMock.mock.calls).toEqual([
      [
        "http://localhost:3001/alerts/rules",
        {
          headers: {
            "x-api-key": "",
          },
        },
      ],
      [
        "http://localhost:3001/alerts/events",
        {
          headers: {
            "x-api-key": "",
          },
        },
      ],
    ]);
  });

  it("posts acknowledgement and resolve actions", async () => {
    fetchMock.mockResolvedValue({ ok: true } as Response);

    await acknowledge("event-1");
    await resolve("event-1");

    expect(fetchMock.mock.calls).toEqual([
      [
        "http://localhost:3001/alerts/events/event-1/ack",
        {
          headers: {
            "x-api-key": "",
          },
          method: "POST",
        },
      ],
      [
        "http://localhost:3001/alerts/events/event-1/resolve",
        {
          headers: {
            "x-api-key": "",
          },
          method: "POST",
        },
      ],
    ]);
  });
});
