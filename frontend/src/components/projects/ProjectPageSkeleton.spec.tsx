import { render, screen } from "@testing-library/react";

import ProjectsPageSkeleton from "./ProjectPageSkeleton";

jest.mock("@/components/common/SkeletonCard", () => ({
  __esModule: true,
  default: () => <div data-testid="skeleton-card" />,
}));

describe("ProjectsPageSkeleton", () => {
  it("renders the header, form shell, and project card placeholders", () => {
    const { container } = render(<ProjectsPageSkeleton />);

    expect(screen.getAllByTestId("skeleton-card")).toHaveLength(4);
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(2);
  });
});