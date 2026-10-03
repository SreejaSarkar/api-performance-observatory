import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import Sidebar from "./SideBar";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
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
    TriangleAlert: () => <Icon>TriangleAlert</Icon>,
    Webhook: () => <Icon>Webhook</Icon>,
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

describe("Sidebar", () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

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
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders project navigation and the authenticated helper text", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: /Projects/ })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Signed in as Jane. You can sign out from any screen here.")).toBeInTheDocument();
  });

  it("blocks project-scoped navigation until a project is selected", () => {
    selectedProjectModule.useSelectedProject.mockReturnValue(null);

    render(<Sidebar />);
    fireEvent.click(screen.getByRole("button", { name: /Alerts/ }));

    expect(toastModule.__toast.error).toHaveBeenCalledWith(
      "Please select a project first to proceed.",
      { id: "require-project" },
    );
  });

  it("signs out and clears the selected project", async () => {
    authApiModule.logout.mockResolvedValue(undefined);

    render(<Sidebar />);
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(authApiModule.logout).toHaveBeenCalledTimes(1);
    });

    expect(selectedProjectModule.clearSelectedProject).toHaveBeenCalledTimes(1);
    expect(toastModule.__toast.success).toHaveBeenCalledWith("Signed out");
  });
});
