import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ProjectForm from "./ProjectForm";
import { createProject } from "@/lib/project-api";

jest.mock("@/lib/project-api", () => ({
  createProject: jest.fn(),
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

const toastModule = jest.requireMock("react-hot-toast") as {
  __toast: {
    error: jest.Mock;
    success: jest.Mock;
  };
};

describe("ProjectForm", () => {
  const mockedCreateProject = createProject as jest.MockedFunction<typeof createProject>;

  beforeEach(() => {
    mockedCreateProject.mockReset();
    toastModule.__toast.error.mockReset();
    toastModule.__toast.success.mockReset();
  });

  it("creates a project, clears the field, and calls onCreated", async () => {
    const onCreated = jest.fn();
    mockedCreateProject.mockResolvedValue({
      apiKey: "api-key-123",
      id: "project-1",
      name: "Payments API",
    });

    render(<ProjectForm onCreated={onCreated} />);

    const input = screen.getByPlaceholderText("Project name") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Payments API" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(mockedCreateProject).toHaveBeenCalledWith("Payments API");
    });

    expect(toastModule.__toast.success).toHaveBeenCalledWith("Project created");
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("");
  });

  it("shows an error toast when project creation fails", async () => {
    mockedCreateProject.mockRejectedValue(new Error("boom"));

    render(<ProjectForm onCreated={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Project name"), {
      target: { value: "Payments API" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(toastModule.__toast.error).toHaveBeenCalledWith("Failed to create project");
    });
  });
});
