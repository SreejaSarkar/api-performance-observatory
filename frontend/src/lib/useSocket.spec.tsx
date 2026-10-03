import { act, renderHook, waitFor } from "@testing-library/react";

import { useSocket } from "./useSocket";

jest.mock("socket.io-client", () => {
  const io = jest.fn();

  return {
    __ioMock: io,
    io,
  };
});

const { __ioMock: ioMock } = jest.requireMock("socket.io-client") as {
  __ioMock: jest.Mock;
};

describe("useSocket", () => {
  const listeners = new Map<string, Set<() => void>>();
  const disconnect = jest.fn();
  const socket = {
    connected: false,
    disconnect,
    off: jest.fn((event: string, handler: () => void) => {
      listeners.get(event)?.delete(handler);
    }),
    on: jest.fn((event: string, handler: () => void) => {
      const existing = listeners.get(event) ?? new Set<() => void>();
      existing.add(handler);
      listeners.set(event, existing);
    }),
  };
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    listeners.clear();
    disconnect.mockReset();
    socket.off.mockClear();
    socket.on.mockClear();
    socket.connected = false;
    ioMock.mockReset();
    ioMock.mockReturnValue(socket);
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  it("creates a shared socket, tracks connection events, and disconnects after the last subscriber unmounts", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://api.example.com";

    const first = renderHook(() => useSocket());
    const second = renderHook(() => useSocket());

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(ioMock).toHaveBeenCalledWith("http://api.example.com", {
      autoConnect: true,
      transports: ["websocket"],
      withCredentials: true,
    });

    await waitFor(() => {
      expect(first.result.current.socket).toBe(socket);
      expect(second.result.current.socket).toBe(socket);
    });

    act(() => {
      socket.connected = true;
      listeners.get("connect")?.forEach((handler) => handler());
    });

    expect(first.result.current.connected).toBe(true);
    expect(second.result.current.connected).toBe(true);

    act(() => {
      socket.connected = false;
      listeners.get("disconnect")?.forEach((handler) => handler());
    });

    expect(first.result.current.connected).toBe(false);

    first.unmount();
    expect(disconnect).not.toHaveBeenCalled();

    second.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("falls back to the localhost backend URL in local development", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    const { result, unmount } = renderHook(() => useSocket());

    await waitFor(() => {
      expect(result.current.socket).toBe(socket);
    });

    expect(ioMock).toHaveBeenCalledWith("http://localhost:3001", {
      autoConnect: true,
      transports: ["websocket"],
      withCredentials: true,
    });

    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});