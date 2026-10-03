import { render } from "@testing-library/react";

import SkeletonCard from "./SkeletonCard";

describe("SkeletonCard", () => {
  it("renders the card shell and placeholder bars", () => {
    const { container } = render(<SkeletonCard />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(1);
    expect(container.querySelectorAll(".h-4")).toHaveLength(1);
    expect(container.querySelectorAll(".h-8")).toHaveLength(1);
  });
});
