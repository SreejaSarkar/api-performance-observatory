import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import ProjectsPage from "./page";
import { getProjects } from "@/lib/project-api";
import {
  getCurrentUser,
  isSessionExpiredError,
  logout,
} from "@/lib/auth-api";
import { clearSelectedProject } from "@/lib/selected-project";

jest.mock("@/lib/project-api", () => ({
  getProjects: jest.fn(),
}));

jest.mock("@/lib/auth-api", () => ({
  getCurrentUser: jest.fn(),
  isSessionExpiredError: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("@/lib/selected-project", () => ({
  clearSelectedProject: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/projects/ProjectPageSkeleton", () => ({
  __esModule: true,
  default: () => <div>Loading projects...</div>,
}));

jest.mock("@/components/common/ErrorState", () => ({
  __esModule: true,
  default: ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div>
      <span>{message}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Try Again
        </button>
      ) : null}
    </div>
  ),
}));

jest.mock("@/components/common/EmptyState", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock("@/components/projects/ProjectCard", () => ({
  __esModule: true,
  default: ({ project }: { project: { name: string } }) => <div>Project: {project.name}</div>,
}));

jest.mock("@/components/projects/ProjectForm", () => ({
  __esModule: true,
  default: ({ onCreated }: { onCreated: () => void }) => (
    <button type="button" onClick={onCreated}>
      Refresh Projects
    </button>
  ),
}));

const mockedToast = jest.requireMock("react-hot-toast") as {
  default: {
    error: jest.Mock;
    success: jest.Mock;
  };
};

describe("ProjectsPage", () => {
  const mockedGetProjects = getProjects as jest.MockedFunction<typeof getProjects>;
  const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
  const mockedIsSessionExpiredError =
    isSessionExpiredError as jest.MockedFunction<typeof isSessionExpiredError>;
  const mockedLogout = logout as jest.MockedFunction<typeof logout>;
  const mockedClearSelectedProject =
    clearSelectedProject as jest.MockedFunction<typeof clearSelectedProject>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    mockedGetProjects.mockReset();
    mockedGetCurrentUser.mockReset();
    mockedIsSessionExpiredError.mockReset();
    mockedLogout.mockReset();
    mockedClearSelectedProject.mockReset();
    mockedToast.default.error.mockReset();
    mockedToast.default.success.mockReset();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    mockedGetCurrentUser.mockResolvedValue({
      email: "jane@example.com",
      name: "Jane Smith",
      userId: "user-1",
    });
    mockedGetProjects.mockResolvedValue([
      {
        apiKey: "key-1",
        createdAt: "2026-09-29T00:00:00.000Z",
        id: "project-1",
        name: "Payments",
      },
    ]);
    mockedIsSessionExpiredError.mockReturnValue(false);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders the loading skeleton before initialization completes", () => {
    mockedGetCurrentUser.mockImplementation(
      () => new Promise(() => undefined) as ReturnType<typeof getCurrentUser>,
    );

    render(<ProjectsPage />);

    expect(screen.getByText("Loading projects...")).toBeInTheDocument();
  });

  it("renders the signed-in user and project cards after loading", async () => {
    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("Signed in as Jane Smith")).toBeInTheDocument();
    });

    expect(screen.getByText("Project: Payments")).toBeInTheDocument();
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(mockedGetProjects).toHaveBeenCalledTimes(1);
  });

  it("renders the empty state when the user has no projects", async () => {
    mockedGetProjects.mockResolvedValue([]);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("No Projects Yet")).toBeInTheDocument();
    });
  });

  it("ignores session-expired bootstrap errors and falls back to the default empty view", async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error("Session expired"));
    mockedIsSessionExpiredError.mockReturnValue(true);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Sign in to manage your monitored projects."),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("No Projects Yet")).toBeInTheDocument();
    expect(screen.queryByText("Session expired")).not.toBeInTheDocument();
  });

  it("shows an error and retries project loading", async () => {
    mockedGetCurrentUser.mockRejectedValueOnce(new Error("Projects unavailable"));
    mockedGetProjects.mockResolvedValueOnce([
      {
        apiKey: "key-2",
        createdAt: "2026-09-29T00:00:00.000Z",
        id: "project-2",
        name: "Checkout",
      },
    ]);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("Projects unavailable")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

    await waitFor(() => {
      expect(screen.getByText("Project: Checkout")).toBeInTheDocument();
    });

    expect(mockedGetProjects).toHaveBeenCalledTimes(1);
  });

  it("signs out, clears the selected project, and shows feedback", async () => {
    mockedLogout.mockResolvedValue({ success: true } as never);

    render(<ProjectsPage />);

    await waitFor(() => {
      expect(screen.getByText("Signed in as Jane Smith")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(mockedLogout).toHaveBeenCalledTimes(1);
    });

    expect(mockedClearSelectedProject).toHaveBeenCalledTimes(1);
    expect(mockedToast.default.success).toHaveBeenCalledWith("Signed out");
  });
});