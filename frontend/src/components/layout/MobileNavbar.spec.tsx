import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import MobileNavbar from "./MobileNavbar";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick, ...props }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("lucide-react", () => {
  const Icon = ({ children }: { children: string }) => <svg>{children}</svg>;

  return {
    Bell: () => <Icon>Bell</Icon>,
    FileText: () => <Icon>FileText</Icon>,
    FolderKanban: () => <Icon>FolderKanban</Icon>,
    LayoutDashboard: () => <Icon>LayoutDashboard</Icon>,
    Menu: () => <svg data-testid="menu-icon" />,
    TriangleAlert: () => <Icon>TriangleAlert</Icon>,
    Webhook: () => <Icon>Webhook</Icon>,
    X: () => <svg data-testid="close-icon" />,
  };
});

jest.mock("@/components/auth/AuthSessionProvider", () => ({
  __esModule: true,
  useAuthSession: jest.fn(),
}));

jest.mock("@/lib/auth-api", () => ({
  logout: jest.fn(),
}));

jest.mock("@/lib/selected-project", () => ({
  clearSelectedProject: jest.fn(),
  useSelectedProject: jest.fn(),
}));

jest.mock("react-hot-toast", () => {
  const toastModule = {
    error: jest.fn(),
    success: jest.fn(),
  };

  return {
    __esModule: true,
    __toast: toastModule,
    default: toastModule,
  };
});

const navigationModule = jest.requireMock("next/navigation") as {
  usePathname: jest.Mock;
};
const authSessionModule = jest.requireMock("@/components/auth/AuthSessionProvider") as {
  useAuthSession: jest.Mock;
};
const authApiModule = jest.requireMock("@/lib/auth-api") as {
  logout: jest.Mock;
};
const selectedProjectModule = jest.requireMock("@/lib/selected-project") as {
  clearSelectedProject: jest.Mock;
  useSelectedProject: jest.Mock;
};
const toastModule = jest.requireMock("react-hot-toast") as {
  __toast: {
    error: jest.Mock;
    success: jest.Mock;
  };
};

describe("MobileNavbar", () => {
  beforeEach(() => {
    navigationModule.usePathname.mockReturnValue("/dashboard");
    authSessionModule.useAuthSession.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { name: "Jane" },
    });
    authApiModule.logout.mockReset();
    selectedProjectModule.clearSelectedProject.mockReset();
    selectedProjectModule.useSelectedProject.mockReset();
    selectedProjectModule.useSelectedProject.mockReturnValue({ id: "project-1" });
    toastModule.__toast.error.mockReset();
    toastModule.__toast.success.mockReset();
  });

  it("toggles the drawer open and closed", () => {
    render(<MobileNavbar />);

    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(screen.getByTestId("close-icon")).toBeInTheDocument();
    expect(screen.getByText("Signed in as Jane. You can sign out here without switching pages.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /Projects/ }));

    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
  });

  it("blocks project-scoped links when no project is selected", () => {
    selectedProjectModule.useSelectedProject.mockReturnValue(null);

    render(<MobileNavbar />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click(screen.getByRole("button", { name: /Alerts/ }));

    expect(toastModule.__toast.error).toHaveBeenCalledWith(
      "Please select a project first to proceed.",
      { id: "require-project" },
    );
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
  });

  it("signs out and clears the selected project", async () => {
    authApiModule.logout.mockResolvedValue(undefined);

    render(<MobileNavbar />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(authApiModule.logout).toHaveBeenCalledTimes(1);
    });

    expect(selectedProjectModule.clearSelectedProject).toHaveBeenCalledTimes(1);
    expect(toastModule.__toast.success).toHaveBeenCalledWith("Signed out");
  });
});
