import { render, screen } from "@testing-library/react";

import ComparisonBar from "./ComparisonBar";

jest.mock("lucide-react", () => ({
  Minus: () => <svg data-testid="minus-icon" />,
  TrendingDown: () => <svg data-testid="trending-down-icon" />,
  TrendingUp: () => <svg data-testid="trending-up-icon" />,
}));

describe("ComparisonBar", () => {
  const data = {
    changes: {
      availability: 4,
      avgLatency: -12,
      errorRate: 3,
      p95Latency: 0,
      totalRequests: 15,
    },
    current: {
      availability: 99.7,
      avgLatency: 210,
      errorRate: 1.2,
      p95Latency: 330,
      totalRequests: 12345,
    },
    periodHours: 24,
    previous: {
      availability: 95.7,
      avgLatency: 238,
      errorRate: 1.1,
      p95Latency: 330,
      totalRequests: 10735,
    },
  };

  it("returns null when no comparison data is available", () => {
    const { container } = render(<ComparisonBar data={null} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders metric values and directional indicators", () => {
    render(<ComparisonBar data={data} />);

    expect(screen.getByText("vs Previous 24h")).toBeInTheDocument();
    expect(screen.getByText("210ms")).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === "+15%")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === "+3%")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getAllByTestId("trending-down-icon").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("trending-up-icon").length).toBeGreaterThan(0);
    expect(screen.getByTestId("minus-icon")).toBeInTheDocument();
  });
});
