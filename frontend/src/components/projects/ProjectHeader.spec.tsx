import { render, screen } from "@testing-library/react";

import ProjectHeader from "./ProjectHeader";

jest.mock("@/lib/selected-project", () => ({
  useSelectedProject: jest.fn(),
}));

const selectedProjectModule = jest.requireMock("@/lib/selected-project") as {
  useSelectedProject: jest.Mock;
};

describe("ProjectHeader", () => {
  beforeEach(() => {
    selectedProjectModule.useSelectedProject.mockReset();
  });

  it("prefers the selected project name over the prop", () => {
    selectedProjectModule.useSelectedProject.mockReturnValue({ name: "Selected Project" });

    render(
      <ProjectHeader
        projectName="Fallback Project"
        status="Critical"
        subtitle="Monitoring last 24 hours"
      />,
    );

    expect(screen.getByRole("heading", { name: "Selected Project" })).toBeInTheDocument();
    expect(screen.getByText("Monitoring last 24 hours")).toBeInTheDocument();
    expect(screen.getByText("● Critical")).toBeInTheDocument();
  });

  it("falls back to the prop and default name when no selected project exists", () => {
    selectedProjectModule.useSelectedProject.mockReturnValue(null);

    const { rerender } = render(<ProjectHeader projectName="Fallback Project" />);
    expect(screen.getByRole("heading", { name: "Fallback Project" })).toBeInTheDocument();

    rerender(<ProjectHeader />);

    expect(screen.getByRole("heading", { name: "Selected project" })).toBeInTheDocument();
    expect(screen.getByText("Monitoring last 72 hours")).toBeInTheDocument();
    expect(screen.getByText("● Healthy")).toBeInTheDocument();
  });
});
