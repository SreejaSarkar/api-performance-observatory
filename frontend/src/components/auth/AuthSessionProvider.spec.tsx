import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import {
  AuthSessionProvider,
  useAuthSession,
} from "./AuthSessionProvider";
import {
  getCurrentUser,
  getCurrentUserOrNull,
  isSessionExpiredError,
} from "@/lib/auth-api";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/lib/auth-api", () => ({
  getCurrentUser: jest.fn(),
  getCurrentUserOrNull: jest.fn(),
  isSessionExpiredError: jest.fn(),
}));

const navigationModule = jest.requireMock("next/navigation") as {
  usePathname: jest.Mock;
};

function Consumer() {
  const { isAuthenticated, loading, refreshSession, user } = useAuthSession();

  return (
    <div>
      <span>{loading ? "loading" : "ready"}</span>
      <span>{isAuthenticated ? `user:${user?.name}` : "guest"}</span>
      <button type="button" onClick={() => void refreshSession()}>
        Refresh session
      </button>
      <button type="button" onClick={() => void refreshSession(true)}>
        Refresh with redirect
      </button>
    </div>
  );
}

describe("AuthSessionProvider", () => {
  const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
  const mockedGetCurrentUserOrNull = getCurrentUserOrNull as jest.MockedFunction<
    typeof getCurrentUserOrNull
  >;
  const mockedIsSessionExpiredError = isSessionExpiredError as jest.MockedFunction<
    typeof isSessionExpiredError
  >;

  beforeEach(() => {
    navigationModule.usePathname.mockReturnValue("/projects");
    mockedGetCurrentUser.mockReset();
    mockedGetCurrentUserOrNull.mockReset();
    mockedIsSessionExpiredError.mockReset();
    mockedIsSessionExpiredError.mockReturnValue(false);
  });

  it("loads the current user on mount and exposes authenticated state", async () => {
    mockedGetCurrentUserOrNull.mockResolvedValue({
      email: "jane@example.com",
      name: "Jane",
      userId: "user-1",
    });

    render(
      <AuthSessionProvider>
        <Consumer />
      </AuthSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeInTheDocument();
    });

    expect(screen.getByText("user:Jane")).toBeInTheDocument();
    expect(mockedGetCurrentUserOrNull).toHaveBeenCalledTimes(1);
  });

  it("refreshes without redirect by using getCurrentUserOrNull", async () => {
    mockedGetCurrentUserOrNull.mockResolvedValueOnce(null).mockResolvedValueOnce({
      email: "jane@example.com",
      name: "Jane",
      userId: "user-1",
    });

    render(
      <AuthSessionProvider>
        <Consumer />
      </AuthSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("guest")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Refresh session" }));

    await waitFor(() => {
      expect(screen.getByText("user:Jane")).toBeInTheDocument();
    });
  });

  it("refreshes with redirect by using getCurrentUser", async () => {
    mockedGetCurrentUserOrNull.mockResolvedValue(null);
    mockedGetCurrentUser.mockResolvedValue({
      email: "jane@example.com",
      name: "Jane",
      userId: "user-1",
    });

    render(
      <AuthSessionProvider>
        <Consumer />
      </AuthSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("guest")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Refresh with redirect" }));

    await waitFor(() => {
      expect(screen.getByText("user:Jane")).toBeInTheDocument();
    });

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("converts session-expired refresh errors into a null user", async () => {
    const expired = new Error("expired");

    mockedGetCurrentUserOrNull.mockResolvedValueOnce({
      email: "jane@example.com",
      name: "Jane",
      userId: "user-1",
    });
    mockedGetCurrentUser.mockRejectedValue(expired);
    mockedIsSessionExpiredError.mockImplementation((error) => error === expired);

    render(
      <AuthSessionProvider>
        <Consumer />
      </AuthSessionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("user:Jane")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Refresh with redirect" }));

    await waitFor(() => {
      expect(screen.getByText("guest")).toBeInTheDocument();
    });
  });

  it("throws when useAuthSession is used outside the provider", () => {
    const renderOutside = () => render(<Consumer />);

    expect(renderOutside).toThrow("useAuthSession must be used within AuthSessionProvider");
  });
});
