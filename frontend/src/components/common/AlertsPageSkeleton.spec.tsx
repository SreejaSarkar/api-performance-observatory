import { render, screen } from "@testing-library/react";

import AlertsPageSkeleton from "./AlertsPageSkeleton";

jest.mock("@/components/common/SkeletonCard", () => ({
  __esModule: true,
  default: () => <div data-testid="skeleton-card" />,
}));

describe("AlertsPageSkeleton", () => {
  it("renders the expected number of skeleton cards and table rows", () => {
    const { container } = render(<AlertsPageSkeleton />);

    expect(screen.getAllByTestId("skeleton-card")).toHaveLength(4);
    expect(container.querySelectorAll(".h-12")).toHaveLength(5);
    expect(container.querySelectorAll(".h-14")).toHaveLength(6);
  });
});
