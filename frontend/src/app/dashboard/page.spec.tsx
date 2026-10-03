import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import DashboardPage from "./page";
import { getDashboard } from "@/lib/dashboard-api";
import { useRealtimeRefresh } from "@/lib/useRealtimeRefresh";
import { useRequireProject } from "@/lib/useRequireProject";

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (
    loader: () => Promise<{ default: React.ComponentType<unknown> }> | React.ComponentType<unknown>,
  ) => {
    const LoadedComponent = () => <div>Dynamic chart</div>;

    return LoadedComponent;
  },
}));

jest.mock("@/lib/dashboard-api", () => ({
  getDashboard: jest.fn(),
}));

jest.mock("@/lib/useRequireProject", () => ({
  useRequireProject: jest.fn(),
}));

jest.mock("@/lib/useRealtimeRefresh", () => ({
  useRealtimeRefresh: jest.fn(),
}));

jest.mock("@/components/common/SkeletonCard", () => ({
  __esModule: true,
  default: () => <div>Loading dashboard...</div>,
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

jest.mock("@/components/dashboard/LiveIndicator", () => ({
  __esModule: true,
  default: ({ connected }: { connected: boolean }) => (
    <div>Live: {connected ? "connected" : "disconnected"}</div>
  ),
}));

jest.mock("@/components/dashboard/ComparisonBar", () => ({
  __esModule: true,
  default: () => <div>Comparison bar</div>,
}));

jest.mock("@/components/dashboard/MetricCard", () => ({
  __esModule: true,
  default: ({ title, value }: { title: string; value: number | string }) => (
    <div>
      <span>{title}</span>
      <span>{value}</span>
    </div>
  ),
}));

jest.mock("@/components/dashboard/HealthOverviewCard", () => ({
  __esModule: true,
  default: ({ healthScore }: { healthScore: number }) => <div>Health overview: {healthScore}</div>,
}));

jest.mock("@/components/dashboard/SlowEndpointsCard", () => ({
  __esModule: true,
  default: ({ endpoints }: { endpoints: Array<{ endpoint: string }> }) => (
    <div>Slow endpoints: {endpoints.map((item) => item.endpoint).join(", ")}</div>
  ),
}));

jest.mock("@/components/dashboard/RecentAlertsCard", () => ({
  __esModule: true,
  default: ({ events }: { events: Array<{ id: string }> }) => (
    <div>Recent alerts: {events.map((event) => event.id).join(", ")}</div>
  ),
}));

jest.mock("@/components/charts/ChartCard", () => ({
  __esModule: true,
  default: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <span>{title}</span>
      {children}
    </div>
  ),
}));

jest.mock("@/components/dashboard/TimeRangeSelector", () => ({
  __esModule: true,
  default: ({ value, onChange }: { value: number; onChange: (value: number) => void }) => (
    <button type="button" onClick={() => onChange(24)}>
      Time range: {value}
    </button>
  ),
}));

describe("DashboardPage", () => {
  const mockedGetDashboard = getDashboard as jest.MockedFunction<typeof getDashboard>;
  const mockedUseRealtimeRefresh =
    useRealtimeRefresh as jest.MockedFunction<typeof useRealtimeRefresh>;
  const mockedUseRequireProject =
    useRequireProject as jest.MockedFunction<typeof useRequireProject>;

  beforeEach(() => {
    mockedUseRequireProject.mockReturnValue(true);
    mockedUseRealtimeRefresh.mockReturnValue({
      connected: true,
    });
    mockedGetDashboard.mockResolvedValue({
      comparison: {
        changes: {
          availability: 1,
          avgLatency: -10,
          errorRate: -0.5,
          p95Latency: -20,
          totalRequests: 25,
        },
        current: {
          availability: 99.9,
          avgLatency: 140,
          errorRate: 0.6,
          p95Latency: 220,
          totalRequests: 12000,
        },
        periodHours: 72,
        previous: {
          availability: 98.9,
          avgLatency: 150,
          errorRate: 1.1,
          p95Latency: 240,
          totalRequests: 9600,
        },
      },
      health: {
        healthScore: 91,
        status: "HEALTHY",
      },
      latencyDistribution: {
        fast: 40,
        slow: 8,
      },
      recentAlerts: [
        {
          id: "alert-1",
          rule: "High latency",
          severity: "HIGH",
          threshold: 500,
          triggeredAt: "2026-09-29T00:00:00.000Z",
          value: 780,
        },
      ],
      sla: {
        availability: 99.9,
        breached: false,
        target: 99.5,
      },
      slowEndpoints: [
        {
          avgLatency: 420,
          endpoint: "/payments",
          requests: 320,
        },
      ],
      summary: {
        avgLatency: 142,
        errorRate: 0.6,
        p95Latency: 220,
        p99Latency: 310,
        requests: 12000,
      },
      traffic: [
        {
          requests: 500,
          time: "2026-09-29T00:00:00.000Z",
        },
      ],
      trend: [
        {
          latency: 142,
          time: "2026-09-29T00:00:00.000Z",
        },
      ],
    });
  });

  it("renders the dashboard after loading data", async () => {
    render(<DashboardPage />);

    expect(screen.getAllByText("Loading dashboard...")).toHaveLength(8);

    await waitFor(() => {
      expect(screen.getByText("Monitoring last 72 hours")).toBeInTheDocument();
    });

    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Live: connected")).toBeInTheDocument();
    expect(screen.getByText("Comparison bar")).toBeInTheDocument();
    expect(screen.getByText("Health Score")).toBeInTheDocument();
    expect(screen.getByText("91")).toBeInTheDocument();
    expect(screen.getByText("Performance Overview")).toBeInTheDocument();
    expect(screen.getByText("Last 72 hours")).toBeInTheDocument();
    expect(screen.getByText("Health overview: 91")).toBeInTheDocument();
    expect(screen.getByText("Slow endpoints: /payments")).toBeInTheDocument();
    expect(screen.getByText("Recent alerts: alert-1")).toBeInTheDocument();
    expect(screen.getByText("Latency Trend")).toBeInTheDocument();
    expect(mockedUseRealtimeRefresh).toHaveBeenCalledWith(expect.any(Function));
  });

  it("renders the error message from a failed dashboard load", async () => {
    mockedGetDashboard.mockRejectedValue(new Error("Dashboard unavailable"));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard unavailable")).toBeInTheDocument();
    });
  });

  it("renders nothing when no project is selected", () => {
    mockedUseRequireProject.mockReturnValue(false);

    const { container } = render(<DashboardPage />);

    expect(container).toBeEmptyDOMElement();
  });

  it("reloads the dashboard when the time range changes", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockedGetDashboard).toHaveBeenCalledWith(72);
    });

    fireEvent.click(screen.getByRole("button", { name: "Time range: 72" }));

    await waitFor(() => {
      expect(mockedGetDashboard).toHaveBeenLastCalledWith(24);
    });

    expect(screen.getByText("Last 24 hours")).toBeInTheDocument();
  });
});