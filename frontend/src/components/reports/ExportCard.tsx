"use client";

import {
  downloadReport,
} from "@/lib/reports-api";

export default function ExportCard() {
  const handleDownload =
    async () => {
      const blob =
        await downloadReport();

      const url =
        window.URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          "a",
        );

      link.href = url;

      link.download =
        "metrics-report.csv";

      document.body.appendChild(
        link,
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url,
      );
    };

  return (
    <div
      className="
        bg-white
        rounded-xl
        border
        shadow-sm
        p-8
      "
    >
      <h2
        className="
          text-2xl
          font-bold
          mb-4
        "
      >
        Export Metrics Report
      </h2>

      <p
        className="
          text-gray-600
          mb-6
        "
      >
        Download endpoint
        performance metrics as
        CSV.
      </p>

      <button
        onClick={
          handleDownload
        }
        className="
          bg-blue-600
          text-white
          px-5
          py-3
          rounded
        "
      >
        Download CSV
      </button>
    </div>
  );
}