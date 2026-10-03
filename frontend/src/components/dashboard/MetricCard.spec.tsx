import { render, screen } from "@testing-library/react";

import MetricCard from "./MetricCard";

describe("MetricCard", () => {
  it("renders its title, value, icon, and custom border color", () => {
    const { container } = render(
      <MetricCard
        title="Requests"
        value="12,345"
        borderColor="border-blue-500"
        icon={<span data-testid="metric-icon">icon</span>}
      />,
    );

    expect(screen.getByText("Requests")).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
    expect(screen.getByTestId("metric-icon")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("border-blue-500");
  });

  it("uses the default border color when none is provided", () => {
    const { container } = render(<MetricCard title="Errors" value={3} />);

    expect(container.firstChild).toHaveClass("border-slate-800");
  });
});
