import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import ReportsPage from "./page";
import { downloadReport } from "@/lib/reports-api";
import { useRequireProject } from "@/lib/useRequireProject";

jest.mock("@/lib/reports-api", () => ({
  downloadReport: jest.fn(),
}));

jest.mock("@/lib/useRequireProject", () => ({
  useRequireProject: jest.fn(),
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

describe("ReportsPage", () => {
  const mockedDownloadReport = downloadReport as jest.MockedFunction<
    typeof downloadReport
  >;
  const mockedUseRequireProject = useRequireProject as jest.MockedFunction<
    typeof useRequireProject
  >;

  beforeEach(() => {
    mockedDownloadReport.mockReset();
    mockedUseRequireProject.mockReturnValue(true);
  });

  it("renders nothing when no project is selected", () => {
    mockedUseRequireProject.mockReturnValue(false);

    const { container } = render(<ReportsPage />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the report cards and page copy", () => {
    render(<ReportsPage />);

    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Generate and download performance reports")).toBeInTheDocument();
    expect(screen.getByText("24 Hour Report")).toBeInTheDocument();
    expect(screen.getByText("72 Hour Report")).toBeInTheDocument();
    expect(screen.getByText("7 Day Report")).toBeInTheDocument();
    expect(screen.getByText("About Reports")).toBeInTheDocument();
  });

  it("downloads the default CSV report for each card", () => {
    render(<ReportsPage />);

    const downloadButtons = screen.getAllByRole("button", { name: "Download CSV" });

    fireEvent.click(downloadButtons[0]);
    fireEvent.click(downloadButtons[1]);
    fireEvent.click(downloadButtons[2]);

    expect(mockedDownloadReport.mock.calls).toEqual([
      [24, "csv"],
      [72, "csv"],
      [168, "csv"],
    ]);
  });

  it("switches format selection per card before downloading", () => {
    render(<ReportsPage />);

    const jsonButtons = screen.getAllByRole("button", { name: /JSON/i });
    const pdfButtons = screen.getAllByRole("button", { name: /PDF/i });

    fireEvent.click(jsonButtons[0]);
    fireEvent.click(pdfButtons[1]);

    expect(screen.getByRole("button", { name: "Download JSON" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download PDF" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Download JSON" }));
    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));

    expect(mockedDownloadReport.mock.calls).toEqual([
      [24, "json"],
      [72, "pdf"],
    ]);
  });
});