import toast from "react-hot-toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

function getApiKey() {
  return (
    localStorage.getItem(
      "apiKey",
    ) || ""
  );
}

export type ReportFormat = "csv" | "json" | "pdf";

const formatExtensions: Record<ReportFormat, string> = {
  csv: "csv",
  json: "json",
  pdf: "pdf",
};

export async function downloadReport(
  hours: number,
  format: ReportFormat = "csv",
) {
  const toastId =
    toast.loading(
      `Generating ${hours}h ${format.toUpperCase()} report...`,
    );

  try {
    const response =
      await fetch(
        `${API_URL}/reports/export?hours=${hours}&format=${format}`,
        {
          headers: {
            "x-api-key":
              getApiKey(),
          },
        },
      );

    if (!response.ok) {
      throw new Error("Export failed");
    }

    const blob =
      await response.blob();

    const url =
      URL.createObjectURL(
        blob,
      );

    const link =
      document.createElement(
        "a",
      );

    link.href = url;

    link.download =
      `report-${hours}h.${formatExtensions[format]}`;

    link.click();

    URL.revokeObjectURL(
      url,
    );

    toast.success(
      `${hours}h ${format.toUpperCase()} report downloaded`,
      {
        id: toastId,
      },
    );
  } catch {
    toast.error(
      "Report download failed",
      {
        id: toastId,
      },
    );
  }
}

export async function getReportPreview(hours: number) {
  const response = await fetch(
    `${API_URL}/reports/export?hours=${hours}&format=json`,
    {
      headers: {
        "x-api-key": getApiKey(),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load report preview");
  }

  return response.json();
}