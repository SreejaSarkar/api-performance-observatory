import { render, waitFor } from "@testing-library/react";

import AuthSessionWatcher from "./AuthSessionWatcher";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/components/auth/AuthSessionProvider", () => ({
  useAuthSession: jest.fn(),
}));

const navigationModule = jest.requireMock("next/navigation") as {
  usePathname: jest.Mock;
};

describe("AuthSessionWatcher", () => {
  const mockedUseAuthSession = useAuthSession as jest.MockedFunction<typeof useAuthSession>;
  let refreshSession: jest.Mock;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.useFakeTimers();
    refreshSession = jest.fn().mockResolvedValue(null);
    mockedUseAuthSession.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      refreshSession,
      user: null,
    });
    navigationModule.usePathname.mockReturnValue("/dashboard");
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleErrorSpy.mockRestore();
  });

  it("checks the session immediately and on the interval for protected paths", async () => {
    render(<AuthSessionWatcher />);

    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledWith(true);
    });

    refreshSession.mockClear();

    jest.advanceTimersByTime(60_000);

    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledWith(true);
    });
  });

  it("reacts to focus and visible document changes", async () => {
    render(<AuthSessionWatcher />);
    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledTimes(1);
    });

    refreshSession.mockClear();

    window.dispatchEvent(new Event("focus"));
    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledTimes(1);
    });

    refreshSession.mockClear();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));

    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledTimes(1);
    });
  });

  it("does nothing for public paths", () => {
    navigationModule.usePathname.mockReturnValue("/auth/login");

    render(<AuthSessionWatcher />);

    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("logs refresh errors for protected paths", async () => {
    const failure = new Error("boom");
    refreshSession.mockRejectedValue(failure);

    render(<AuthSessionWatcher />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(failure);
    });
  });
});