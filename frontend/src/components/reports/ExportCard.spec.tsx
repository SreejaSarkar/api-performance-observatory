import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ExportCard from "./ExportCard";
import { downloadReport } from "@/lib/reports-api";

jest.mock("@/lib/reports-api", () => ({
  downloadReport: jest.fn(),
}));

describe("ExportCard", () => {
  const mockedDownloadReport = downloadReport as jest.MockedFunction<typeof downloadReport>;

  beforeEach(() => {
    mockedDownloadReport.mockReset();
    mockedDownloadReport.mockResolvedValue(undefined);
  });

  it("renders the export content and downloads the 72-hour report", async () => {
    render(<ExportCard />);

    expect(screen.getByRole("heading", { name: "Export Metrics Report" })).toBeInTheDocument();
    expect(screen.getByText(/Download endpoint/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Download CSV" }));

    await waitFor(() => {
      expect(mockedDownloadReport).toHaveBeenCalledWith(72);
    });
  });
});