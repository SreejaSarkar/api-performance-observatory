import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import RegisterPage from "./page";
import { register } from "@/lib/auth-api";

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
  register: jest.fn(),
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

describe("RegisterPage", () => {
  const mockedRegister = register as jest.MockedFunction<typeof register>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    mockedRegister.mockReset();
    mockedNavigation.useSearchParams.mockReset();
    mockedToast.default.error.mockReset();
    mockedToast.default.success.mockReset();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    mockedNavigation.useSearchParams.mockReturnValue({
      get: jest.fn((key: string) => (key === "next" ? "/reports" : null)),
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("passes the next path through to social auth buttons", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Social next path: /reports")).toBeInTheDocument();
  });

  it("submits the registration payload and shows a success toast", async () => {
    mockedRegister.mockResolvedValue({
      user: {
        email: "jane@example.com",
        id: "user-1",
        name: "Jane Smith",
      },
    } as never);

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Jane Smith"), {
      target: { value: "Jane Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create a strong password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({
        email: "jane@example.com",
        name: "Jane Smith",
        password: "password123",
      });
    });

    expect(mockedToast.default.success).toHaveBeenCalledWith("Account created");
  });

  it("forwards an unsafe next param to the social auth section boundary", () => {
    mockedNavigation.useSearchParams.mockReturnValue({
      get: jest.fn(() => "https://malicious.example"),
    });

    render(<RegisterPage />);

    expect(screen.getByText("Social next path: https://malicious.example")).toBeInTheDocument();
  });

  it("shows the submitting state and reports registration failures", async () => {
    let rejectRegister: ((reason?: unknown) => void) | undefined;

    mockedRegister.mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectRegister = reject;
        }) as ReturnType<typeof register>,
    );

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Jane Smith"), {
      target: { value: "Jane Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create a strong password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByRole("button", { name: "Creating account..." })).toBeDisabled();

    rejectRegister?.(new Error("Email already exists"));

    await waitFor(() => {
      expect(mockedToast.default.error).toHaveBeenCalledWith("Email already exists");
    });

    expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled();
  });
});