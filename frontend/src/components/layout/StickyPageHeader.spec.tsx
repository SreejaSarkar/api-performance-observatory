import { render, screen } from "@testing-library/react";

import StickyPageHeader from "./StickyPageHeader";

describe("StickyPageHeader", () => {
  it("renders its children", () => {
    render(
      <StickyPageHeader>
        <div>Header content</div>
      </StickyPageHeader>,
    );

    expect(screen.getByText("Header content")).toBeInTheDocument();
  });
});