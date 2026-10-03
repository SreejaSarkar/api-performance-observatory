import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import LoginPage from "./page";
import { login } from "@/lib/auth-api";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("@/lib/auth-api", () => ({
  login: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/auth/SocialAuthButtons", () => ({
  __esModule: true,
  default: ({ nextPath }: { nextPath?: string }) => (
    <div>Social next path: {nextPath}</div>
  ),
}));

const mockedNavigation = jest.requireMock("next/navigation") as {
  useSearchParams: jest.Mock;
};

const mockedToast = jest.requireMock("react-hot-toast") as {
  default: {
    error: jest.Mock;
    success: jest.Mock;
  };
};

describe("LoginPage", () => {
  const mockedLogin = login as jest.MockedFunction<typeof login>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    mockedLogin.mockReset();
    mockedNavigation.useSearchParams.mockReset();
    mockedToast.default.error.mockReset();
    mockedToast.default.success.mockReset();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    mockedNavigation.useSearchParams.mockReturnValue({
      get: jest.fn((key: string) => (key === "next" ? "/dashboard" : null)),
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("passes the next path through to social auth buttons", () => {
    render(<LoginPage />);

    expect(screen.getByText("Social next path: /dashboard")).toBeInTheDocument();
  });

  it("submits credentials and shows a success toast", async () => {
    mockedLogin.mockResolvedValue({
      user: {
        email: "user@example.com",
        id: "user-1",
        name: "User",
      },
    } as never);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });

    expect(mockedToast.default.success).toHaveBeenCalledWith("Signed in successfully");
  });

  it("forwards the raw next param to the social auth section", () => {
    mockedNavigation.useSearchParams.mockReturnValue({
      get: jest.fn(() => "https://malicious.example"),
    });

    render(<LoginPage />);

    expect(screen.getByText("Social next path: https://malicious.example")).toBeInTheDocument();
  });

  it("shows the submitting state and reports login failures", async () => {
    let rejectLogin: ((reason?: unknown) => void) | undefined;

    mockedLogin.mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectLogin = reject;
        }) as ReturnType<typeof login>,
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByRole("button", { name: "Signing in..." })).toBeDisabled();

    rejectLogin?.(new Error("Invalid credentials"));

    await waitFor(() => {
      expect(mockedToast.default.error).toHaveBeenCalledWith("Invalid credentials");
    });

    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });
});