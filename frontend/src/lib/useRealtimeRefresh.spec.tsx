import { act, renderHook } from "@testing-library/react";

import { useRealtimeRefresh } from "./useRealtimeRefresh";
import { useSelectedProject } from "./selected-project";
import { useSocket } from "./useSocket";

jest.mock("./selected-project", () => ({
  useSelectedProject: jest.fn(),
}));

jest.mock("./useSocket", () => ({
  useSocket: jest.fn(),
}));

describe("useRealtimeRefresh", () => {
  const on = jest.fn();
  const off = jest.fn();

  const mockedUseSelectedProject = useSelectedProject as jest.MockedFunction<
    typeof useSelectedProject
  >;
  const mockedUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;

  beforeEach(() => {
    jest.useFakeTimers();
    on.mockReset();
    off.mockReset();
    mockedUseSelectedProject.mockReturnValue({
      apiKey: "key-1",
      id: "project-1",
      name: "Payments",
    });
    mockedUseSocket.mockReturnValue({
      connected: true,
      socket: {
        off,
        on,
      } as never,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("subscribes to the project socket event and exposes the connection state", () => {
    const loadFn = jest.fn();

    const { result, unmount } = renderHook(() => useRealtimeRefresh(loadFn));

    expect(result.current).toEqual({ connected: true });
    expect(on).toHaveBeenCalledWith("project:project-1", expect.any(Function));

    unmount();

    expect(off).toHaveBeenCalledWith("project:project-1", expect.any(Function));
  });

  it("refreshes immediately once the debounce window has elapsed and debounces subsequent events", () => {
    const loadFn = jest.fn();
    let handler: (() => void) | undefined;

    on.mockImplementation((_, callback: () => void) => {
      handler = callback;
    });

    jest.spyOn(Date, "now")
      .mockReturnValueOnce(10_000)
      .mockReturnValueOnce(12_000)
      .mockReturnValueOnce(15_000);

    renderHook(() => useRealtimeRefresh(loadFn));

    act(() => {
      handler?.();
    });

    expect(loadFn).toHaveBeenCalledTimes(1);

    act(() => {
      handler?.();
    });

    expect(loadFn).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(loadFn).toHaveBeenCalledTimes(2);
  });

  it("does not subscribe when the socket or selected project is missing", () => {
    mockedUseSocket.mockReturnValueOnce({ connected: false, socket: null });
    mockedUseSelectedProject.mockReturnValueOnce(null);

    renderHook(() => useRealtimeRefresh(jest.fn()));

    expect(on).not.toHaveBeenCalled();
    expect(off).not.toHaveBeenCalled();
  });
});
