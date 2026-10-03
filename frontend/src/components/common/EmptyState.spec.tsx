import { render, screen } from "@testing-library/react";

import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders the icon, title, and description", () => {
    render(
      <EmptyState
        icon="📭"
        title="No alerts yet"
        description="Create your first alert rule to start monitoring endpoints."
      />,
    );

    expect(screen.getByText("📭")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No alerts yet" })).toBeInTheDocument();
    expect(
      screen.getByText("Create your first alert rule to start monitoring endpoints."),
    ).toBeInTheDocument();
  });
});
