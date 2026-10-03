import { render, screen } from "@testing-library/react";

import RecentAlertsCard from "./RecentAlertsCard";

jest.mock("@/components/common/SeverityBadge", () => ({
  __esModule: true,
  default: ({ severity }: { severity: string }) => <div data-testid="severity-badge">{severity}</div>,
}));

jest.mock("../common/EmptyState", () => ({
  __esModule: true,
  default: ({ title, description, icon }: { title: string; description: string; icon: string }) => (
    <div data-testid="empty-state">
      <span>{icon}</span>
      <span>{title}</span>
      <span>{description}</span>
    </div>
  ),
}));

describe("RecentAlertsCard", () => {
  it("renders the empty state when there are no recent alerts", () => {
    render(<RecentAlertsCard events={[]} />);

    expect(screen.getByRole("heading", { name: "Recent Alerts" })).toBeInTheDocument();
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No Recent Alerts")).toBeInTheDocument();
  });

  it("renders recent alert details when events exist", () => {
    render(
      <RecentAlertsCard
        events={[
          {
            id: "alert-1",
            rule: "P95 latency threshold",
            severity: "HIGH",
            threshold: 350,
            triggeredAt: "2026-09-28T10:15:00.000Z",
            value: 420,
          },
        ]}
      />,
    );

    expect(screen.getByText("P95 latency threshold")).toBeInTheDocument();
    expect(screen.getByTestId("severity-badge")).toHaveTextContent("HIGH");
    expect(screen.getByText("420 > 350")).toBeInTheDocument();
  });
});
