import { render, screen } from "@testing-library/react";

import ChartCard from "./ChartCard";

describe("ChartCard", () => {
  it("renders the title, description, icon, and children", () => {
    render(
      <ChartCard
        title="Latency Trend"
        description="Average request latency over time"
        icon={<span data-testid="chart-icon">icon</span>}
      >
        <div>Chart content</div>
      </ChartCard>,
    );

    expect(screen.getByRole("heading", { name: "Latency Trend" })).toBeInTheDocument();
    expect(screen.getByText("Average request latency over time")).toBeInTheDocument();
    expect(screen.getByTestId("chart-icon")).toBeInTheDocument();
    expect(screen.getByText("Chart content")).toBeInTheDocument();
  });

  it("omits the description when none is provided", () => {
    render(
      <ChartCard title="Traffic">
        <div>Body</div>
      </ChartCard>,
    );

    expect(screen.getByRole("heading", { name: "Traffic" })).toBeInTheDocument();
    expect(screen.queryByText("Average request latency over time")).not.toBeInTheDocument();
  });
});
