import { render, screen, waitFor } from "@testing-library/react";

import AlertsPage from "./page";
import {
  getEvents,
  getRules,
  getStats,
} from "@/lib/alerts-api";
import { useRequireProject } from "@/lib/useRequireProject";

jest.mock("@/lib/alerts-api", () => ({
  acknowledge: jest.fn(),
  createRule: jest.fn(),
  deleteRule: jest.fn(),
  getEvents: jest.fn(),
  getRules: jest.fn(),
  getStats: jest.fn(),
  resolve: jest.fn(),
  updateRule: jest.fn(),
}));

jest.mock("@/lib/useRequireProject", () => ({
  useRequireProject: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/common/AlertsPageSkeleton", () => ({
  __esModule: true,
  default: () => <div>Loading alerts...</div>,
}));

jest.mock("@/components/common/ErrorState", () => ({
  __esModule: true,
  default: ({ message }: { message: string }) => <div>{message}</div>,
}));

jest.mock("@/components/layout/StickyPageHeader", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/projects/ProjectHeader", () => ({
  __esModule: true,
  default: ({ status, subtitle }: { status: string; subtitle: string }) => (
    <div>
      <span>{status}</span>
      <span>{subtitle}</span>
    </div>
  ),
}));

jest.mock("@/components/dashboard/MetricCard", () => ({
  __esModule: true,
  default: ({ title, value }: { title: string; value: number }) => (
    <div>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
}));

jest.mock("@/components/alerts/AlertRuleTable", () => ({
  __esModule: true,
  default: ({ rules }: { rules: Array<{ id: string; name: string }> }) => (
    <div>Rules: {rules.map((rule) => rule.name).join(", ")}</div>
  ),
}));

jest.mock("@/components/alerts/AlertEventTable", () => ({
  __esModule: true,
  default: ({ events }: { events: Array<{ id: string; title?: string }> }) => (
    <div>Events: {events.map((event) => event.id).join(", ")}</div>
  ),
}));

jest.mock("@/components/alerts/CreateAlertRuleModal", () => ({
  __esModule: true,
  default: () => <div>Create rule modal</div>,
}));

jest.mock("@/components/common/ConfirmDialog", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/alerts/AlertEndpointsDialog", () => ({
  __esModule: true,
  default: () => null,
}));

describe("AlertsPage", () => {
  const mockedGetStats = getStats as jest.MockedFunction<typeof getStats>;
  const mockedGetRules = getRules as jest.MockedFunction<typeof getRules>;
  const mockedGetEvents = getEvents as jest.MockedFunction<typeof getEvents>;
  const mockedUseRequireProject = useRequireProject as jest.MockedFunction<
    typeof useRequireProject
  >;

  beforeEach(() => {
    mockedUseRequireProject.mockReturnValue(true);
    mockedGetStats.mockResolvedValue({
      acknowledgedAlerts: 1,
      criticalAlerts: 1,
      openAlerts: 2,
      resolvedAlerts: 0,
      todayAlerts: 1,
      totalAlerts: 4,
      unacknowledgedAlerts: 1,
    });
    mockedGetRules.mockResolvedValue([
      {
        id: "rule-1",
        metric: "LATENCY",
        name: "Slow requests",
        severity: "HIGH",
        threshold: 500,
      },
    ] as never[]);
    mockedGetEvents.mockResolvedValue([
      {
        id: "event-1",
      },
    ] as never[]);
  });

  it("renders the alert dashboard after loading data", async () => {
    render(<AlertsPage />);

    expect(screen.getByText("Loading alerts...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Alert monitoring and incident response")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Critical")).toHaveLength(2);
    expect(screen.getByText("Total Alerts")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Rules: Slow requests")).toBeInTheDocument();
    expect(screen.getByText("Events: event-1")).toBeInTheDocument();
  });

  it("renders the error state when loading fails", async () => {
    mockedGetStats.mockRejectedValue(new Error("boom"));

    render(<AlertsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load alerts dashboard.")).toBeInTheDocument();
    });
  });

  it("renders nothing when no project is selected", () => {
    mockedUseRequireProject.mockReturnValue(false);

    const { container } = render(<AlertsPage />);

    expect(container).toBeEmptyDOMElement();
  });
});