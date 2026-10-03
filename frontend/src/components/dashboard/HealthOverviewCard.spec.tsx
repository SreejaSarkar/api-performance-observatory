import { render, screen } from "@testing-library/react";

import HealthOverviewCard from "./HealthOverviewCard";

describe("HealthOverviewCard", () => {
  it("renders values and status indicators based on thresholds", () => {
    render(
      <HealthOverviewCard
        availability={99.9}
        latency={640}
        errorRate={6.5}
        healthScore={72}
        requests={0}
      />,
    );

    expect(screen.getByRole("heading", { name: "Health Overview" })).toBeInTheDocument();
    expect(screen.getByText("🟢 Availability")).toBeInTheDocument();
    expect(screen.getByText("🔴 Traffic")).toBeInTheDocument();
    expect(screen.getByText("🟡 Error Rate")).toBeInTheDocument();
    expect(screen.getByText("🔴 Latency")).toBeInTheDocument();
    expect(screen.getByText("99.9%")).toBeInTheDocument();
    expect(screen.getByText("640 ms")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
  });
});
