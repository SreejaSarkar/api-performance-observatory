import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import SocialAuthButtons from "./SocialAuthButtons";
import { getAuthProviders } from "@/lib/auth-api";

jest.mock("@/lib/auth-api", () => ({
  getAuthProviders: jest.fn(),
}));

jest.mock("react-hot-toast", () => {
  const mockedToast = jest.fn();

  return {
    __esModule: true,
    __mockToast: mockedToast,
    default: mockedToast,
  };
});

const { __mockToast: toast } = jest.requireMock("react-hot-toast") as {
  __mockToast: jest.Mock;
};

describe("SocialAuthButtons", () => {
  const mockedGetAuthProviders = getAuthProviders as jest.MockedFunction<typeof getAuthProviders>;

  beforeEach(() => {
    mockedGetAuthProviders.mockReset();
    toast.mockReset();
  });

  it("renders provider links when the backend enables them", async () => {
    mockedGetAuthProviders.mockResolvedValue({
      github: true,
      google: true,
    });

    render(<SocialAuthButtons nextPath="/dashboard" />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Continue with Google" })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "Continue with Google" })).toHaveAttribute(
      "href",
      "http://localhost:3001/auth/google?next=%2Fdashboard",
    );
    expect(screen.getByRole("link", { name: "Continue with GitHub" })).toHaveAttribute(
      "href",
      "http://localhost:3001/auth/github?next=%2Fdashboard",
    );
  });

  it("sanitizes an unsafe next path to /projects", async () => {
    mockedGetAuthProviders.mockResolvedValue({
      github: false,
      google: true,
    });

    render(<SocialAuthButtons nextPath="https://example.com/phish" />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Continue with Google" })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "Continue with Google" })).toHaveAttribute(
      "href",
      "http://localhost:3001/auth/google?next=%2Fprojects",
    );
  });

  it("keeps unavailable providers as buttons and shows a toast", async () => {
    mockedGetAuthProviders.mockRejectedValue(new Error("backend unavailable"));

    render(<SocialAuthButtons />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    expect(toast).toHaveBeenCalledWith(
      "Continue with Google sign-in is not configured yet on the backend.",
      {
        icon: "i",
        id: "Continue with Google-social-auth-unavailable",
      },
    );
  });
});
