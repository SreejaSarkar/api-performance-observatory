import { render, screen, waitFor } from "@testing-library/react";

import EndpointDetailPage from "./page";
import { getEndpointDetail } from "@/lib/metrics-api";
import { useRequireProject } from "@/lib/useRequireProject";
import { useRealtimeRefresh } from "@/lib/useRealtimeRefresh";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/lib/metrics-api", () => ({
  getEndpointDetail: jest.fn(),
}));

jest.mock("@/lib/useRequireProject", () => ({
  useRequireProject: jest.fn(),
}));

jest.mock("@/lib/useRealtimeRefresh", () => ({
  useRealtimeRefresh: jest.fn(),
}));

const mockedNavigation = jest.requireMock("next/navigation") as {
  useParams: jest.Mock;
};

describe("EndpointDetailPage", () => {
  const mockedGetEndpointDetail = getEndpointDetail as jest.MockedFunction<
    typeof getEndpointDetail
  >;
  const mockedUseRequireProject = useRequireProject as jest.MockedFunction<
    typeof useRequireProject
  >;
  const mockedUseRealtimeRefresh =
    useRealtimeRefresh as jest.MockedFunction<typeof useRealtimeRefresh>;

  beforeEach(() => {
    mockedUseRequireProject.mockReturnValue(true);
    mockedUseRealtimeRefresh.mockReturnValue({
      connected: true,
    });
    mockedNavigation.useParams.mockReturnValue({
      endpoint: "%2Fapi%2Forders",
    });
    mockedGetEndpointDetail.mockResolvedValue({
      environmentBreakdown: [
        {
          environment: "production",
          requests: 80,
        },
      ],
      errorBreakdown: [
        {
          count: 5,
          statusCode: 500,
        },
      ],
      latencyTrend: [
        {
          avg: 142,
          errorRate: 12,
          p95: 220,
          p99: 310,
          requests: 90,
          time: "2026-09-29T00:00:00.000Z",
        },
      ],
      methodBreakdown: [
        {
          method: "GET",
          requests: 120,
        },
      ],
      recentSamples: [
        {
          environment: "production",
          latency: 180,
          method: "GET",
          requestId: "req-1",
          requests: 3,
          responseSize: 1536,
          statusCode: 500,
          timestamp: "2026-09-29T01:00:00.000Z",
          userAgent: "Mozilla/5.0",
        },
      ],
      stats: {
        avgLatency: 142,
        avgResponseSize: 1536,
        errorRate: 3.1,
        p95Latency: 220,
        totalRequests: 1200,
      },
    } as never);
  });

  it("renders the loading shell before endpoint details resolve", () => {
    mockedGetEndpointDetail.mockImplementation(
      () => new Promise(() => undefined) as ReturnType<typeof getEndpointDetail>,
    );

    const { container } = render(<EndpointDetailPage />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("renders the endpoint details after loading data", async () => {
    render(<EndpointDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
    });

    expect(mockedGetEndpointDetail).toHaveBeenCalledWith("/api/orders");
    expect(mockedUseRealtimeRefresh).toHaveBeenCalledWith(expect.any(Function));
    expect(screen.getByText("/api/orders")).toBeInTheDocument();
    expect(screen.getByText("Avg Latency")).toBeInTheDocument();
    expect(screen.getAllByText("142ms")).toHaveLength(2);
    expect(screen.getAllByText("1.5 KB")).toHaveLength(2);
    expect(screen.getByText("HTTP Methods")).toBeInTheDocument();
    expect(screen.getAllByText("GET")).toHaveLength(2);
    expect(screen.getAllByText("production")).toHaveLength(2);
    expect(screen.getByText("Latency Trend (Hourly)")).toBeInTheDocument();
    expect(screen.getByText("Error Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Recent Samples")).toBeInTheDocument();
    expect(screen.getByText("req-1")).toBeInTheDocument();
  });

  it("renders the backend error message when loading fails", async () => {
    mockedGetEndpointDetail.mockRejectedValue(new Error("Endpoint unavailable"));

    render(<EndpointDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Endpoint unavailable")).toBeInTheDocument();
    });
  });

  it("renders the empty state when endpoint stats are missing", async () => {
    mockedGetEndpointDetail.mockResolvedValue({
      environmentBreakdown: [],
      errorBreakdown: [],
      latencyTrend: [],
      methodBreakdown: [],
      recentSamples: [],
      stats: null,
    } as never);

    render(<EndpointDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("No data available for this endpoint.")).toBeInTheDocument();
    });
  });

  it("renders nothing when no project is selected", () => {
    mockedUseRequireProject.mockReturnValue(false);

    const { container } = render(<EndpointDetailPage />);

    expect(container).toBeEmptyDOMElement();
  });
});