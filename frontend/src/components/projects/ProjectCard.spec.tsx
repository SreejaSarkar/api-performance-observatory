import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ProjectCard from "./ProjectCard";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/selected-project", () => ({
  setSelectedProject: jest.fn(),
}));

jest.mock("react-hot-toast", () => {
  const toastModule = {
    success: jest.fn(),
  };

  return {
    __esModule: true,
    __toast: toastModule,
    default: toastModule,
  };
});

const navigationModule = jest.requireMock("next/navigation") as {
  useRouter: jest.Mock;
};
const selectedProjectModule = jest.requireMock("@/lib/selected-project") as {
  setSelectedProject: jest.Mock;
};
const toastModule = jest.requireMock("react-hot-toast") as {
  __toast: {
    success: jest.Mock;
  };
};

describe("ProjectCard", () => {
  const push = jest.fn();

  beforeEach(() => {
    navigationModule.useRouter.mockReturnValue({ push });
    push.mockReset();
    selectedProjectModule.setSelectedProject.mockReset();
    toastModule.__toast.success.mockReset();

    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders project details and copies the API key", async () => {
    render(
      <ProjectCard
        project={{
          apiKey: "api-key-123",
          id: "project-1",
          name: "Payments API",
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Payments API" })).toBeInTheDocument();
    expect(screen.getByText("api-key-123")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("api-key-123");
    });

    expect(toastModule.__toast.success).toHaveBeenCalledWith("API key copied to clipboard.");
  });

  it("selects the project and routes to the dashboard", () => {
    render(
      <ProjectCard
        project={{
          apiKey: "api-key-123",
          id: "project-1",
          name: "Payments API",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Select Project" }));

    expect(selectedProjectModule.setSelectedProject).toHaveBeenCalledWith({
      apiKey: "api-key-123",
      id: "project-1",
      name: "Payments API",
    });
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
