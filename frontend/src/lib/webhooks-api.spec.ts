import {
  createWebhook,
  deleteWebhook,
  getWebhooks,
  sendTestWebhook,
} from "./webhooks-api";

describe("webhooks-api", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      value: fetchMock,
    });
    fetchMock.mockReset();
    localStorage.clear();
    localStorage.setItem("apiKey", "webhook-key");
  });

  it("loads webhooks with the selected project API key", async () => {
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue([{ id: "webhook-1" }]),
      ok: true,
    } as unknown as Response);

    await expect(getWebhooks()).resolves.toEqual([{ id: "webhook-1" }]);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/webhooks", {
      headers: {
        "x-api-key": "webhook-key",
      },
    });
  });

  it("creates a webhook and posts the request payload", async () => {
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ id: "webhook-2" }),
      ok: true,
    } as unknown as Response);

    await expect(
      createWebhook({
        name: "PagerDuty",
        provider: "SLACK" as never,
        url: "https://example.com/hook",
      }),
    ).resolves.toEqual({ id: "webhook-2" });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/webhooks", {
      body: JSON.stringify({
        name: "PagerDuty",
        provider: "SLACK",
        url: "https://example.com/hook",
      }),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "webhook-key",
      },
      method: "POST",
    });
  });

  it("deletes and tests webhooks using the correct endpoints", async () => {
    fetchMock
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ success: true }), ok: true } as unknown as Response)
      .mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({ delivered: true }), ok: true } as unknown as Response);

    await expect(deleteWebhook("webhook-1")).resolves.toBeUndefined();
    await expect(sendTestWebhook("webhook-1")).resolves.toEqual({ delivered: true });

    expect(fetchMock.mock.calls).toEqual([
      [
        "http://localhost:3001/webhooks/webhook-1",
        {
          headers: {
            "x-api-key": "webhook-key",
          },
          method: "DELETE",
        },
      ],
      [
        "http://localhost:3001/webhooks/webhook-1/test",
        {
          headers: {
            "x-api-key": "webhook-key",
          },
          method: "POST",
        },
      ],
    ]);
  });

  it("surfaces JSON and status-text errors from failed responses", async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ message: "Webhook exists" }),
        ok: false,
      } as unknown as Response)
      .mockResolvedValueOnce({
        json: jest.fn().mockRejectedValue(new Error("invalid json")),
        ok: false,
        statusText: "Bad Gateway",
      } as unknown as Response);

    await expect(getWebhooks()).rejects.toThrow("Webhook exists");
    await expect(sendTestWebhook("webhook-2")).rejects.toThrow("Bad Gateway");
  });
});
