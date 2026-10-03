import { render, screen } from "@testing-library/react";

import SeverityBadge from "./SeverityBadge";

describe("SeverityBadge", () => {
  it("renders a high-severity badge with the matching style", () => {
    render(<SeverityBadge severity="HIGH" />);

    const badge = screen.getByText("HIGH");

    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-orange-500/20");
    expect(badge.className).toContain("text-orange-400");
  });

  it("falls back to the low-severity style for unknown severities", () => {
    render(<SeverityBadge severity="CUSTOM" />);

    const badge = screen.getByText("CUSTOM");

    expect(badge.className).toContain("bg-slate-700");
    expect(badge.className).toContain("text-slate-200");
  });
});
