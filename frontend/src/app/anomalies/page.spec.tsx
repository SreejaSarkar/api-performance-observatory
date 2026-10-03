import { render, screen, waitFor } from "@testing-library/react";

import AnomaliesPage from "./page";
import { getAnomalies } from "@/lib/anomaly-api";
import { useRealtimeRefresh } from "@/lib/useRealtimeRefresh";
import { useRequireProject } from "@/lib/useRequireProject";

jest.mock("@/lib/anomaly-api", () => ({
  getAnomalies: jest.fn(),
}));

jest.mock("@/lib/useRequireProject", () => ({
  useRequireProject: jest.fn(),
}));

jest.mock("@/lib/useRealtimeRefresh", () => ({
  useRealtimeRefresh: jest.fn(),
}));

jest.mock("@/components/anomalies/AnomaliesPageSkeleton", () => ({
  __esModule: true,
  default: () => <div>Loading anomalies...</div>,
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

jest.mock("@/components/anomalies/AnomalyTable", () => ({
  __esModule: true,
  default: ({ anomalies }: { anomalies: Array<{ id: string; endpoint: string }> }) => (
    <div>Anomalies: {anomalies.map((anomaly) => anomaly.endpoint).join(", ")}</div>
  ),
}));

describe("AnomaliesPage", () => {
  const mockedGetAnomalies = getAnomalies as jest.MockedFunction<typeof getAnomalies>;
  const mockedUseRealtimeRefresh =
    useRealtimeRefresh as jest.MockedFunction<typeof useRealtimeRefresh>;
  const mockedUseRequireProject =
    useRequireProject as jest.MockedFunction<typeof useRequireProject>;

  beforeEach(() => {
    mockedUseRequireProject.mockReturnValue(true);
    mockedUseRealtimeRefresh.mockReturnValue({
      connected: true,
    });
    mockedGetAnomalies.mockResolvedValue([
      {
        detectedAt: "2026-09-29T00:00:00.000Z",
        endpoint: "/payments",
        id: "anomaly-1",
        resolved: false,
        resolvedAt: null,
        severity: "HIGH",
        threshold: 500,
        type: "LATENCY",
        value: 820,
      },
    ]);
  });

  it("renders the anomaly dashboard after loading data", async () => {
    render(<AnomaliesPage />);

    expect(screen.getByText("Loading anomalies...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Anomaly monitoring and incident response")).toBeInTheDocument();
    });

    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("Anomalies: /payments")).toBeInTheDocument();
    expect(mockedUseRealtimeRefresh).toHaveBeenCalledWith(expect.any(Function));
  });

  it("renders the error message from a failed anomaly load", async () => {
    mockedGetAnomalies.mockRejectedValue(new Error("Backend unavailable"));

    render(<AnomaliesPage />);

    await waitFor(() => {
      expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
    });
  });

  it("renders nothing when no project is selected", () => {
    mockedUseRequireProject.mockReturnValue(false);

    const { container } = render(<AnomaliesPage />);

    expect(container).toBeEmptyDOMElement();
  });
});