"use client";

import { useState } from "react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import {
    Download,
    FileSpreadsheet,
    Clock,
    FileText,
    FileJson,
} from "lucide-react";
import { downloadReport, ReportFormat } from "@/lib/reports-api";
import { useRequireProject } from "@/lib/useRequireProject";
import StickyPageHeader from "@/components/layout/StickyPageHeader";

interface ReportCardProps {
    title: string;
    description: string;
    hours: number;
    icon: React.ReactNode;
    color: string;
}

function ReportCard({ title, description, hours, icon, color }: ReportCardProps) {
    const [selectedFormat, setSelectedFormat] = useState<ReportFormat>("csv");

    const formats: { value: ReportFormat; label: string; icon: React.ReactNode }[] = [
        { value: "csv", label: "CSV", icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
        { value: "json", label: "JSON", icon: <FileJson className="w-3.5 h-3.5" /> },
        { value: "pdf", label: "PDF", icon: <FileText className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="mb-4 flex min-w-0 items-start gap-3">
                {icon}
                <h2 className="min-w-0 break-words text-xl font-semibold leading-tight">
                    {title}
                </h2>
            </div>
            <p className="text-slate-400 mb-5">{description}</p>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 mr-1">Format:</span>
                {formats.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setSelectedFormat(f.value)}
                        className={`flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                            selectedFormat === f.value
                                ? "bg-slate-700 text-white border border-slate-600"
                                : "text-slate-400 hover:text-slate-200 border border-slate-800"
                        }`}
                    >
                        {f.icon}
                        {f.label}
                    </button>
                ))}
            </div>

            <button
                onClick={() => downloadReport(hours, selectedFormat)}
                className={`${color} flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition sm:w-auto`}
            >
                <Download className="w-4 h-4" />
                Download {selectedFormat.toUpperCase()}
            </button>
        </div>
    );
}

export default function ReportsPage() {
    const hasProject =
        useRequireProject();

    if (!hasProject) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 md:p-8 overflow-x-hidden">
            <StickyPageHeader>
                <ProjectHeader
                    status="Healthy"
                    subtitle="Generate and download performance reports"
                />
            </StickyPageHeader>

            {/* Download Cards */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <ReportCard
                    title="24 Hour Report"
                    description="Export metrics from the last 24 hours."
                    hours={24}
                    icon={<Clock className="w-6 h-6 text-blue-400" />}
                    color="bg-blue-600 hover:bg-blue-500"
                />
                <ReportCard
                    title="72 Hour Report"
                    description="Export metrics from the last 72 hours."
                    hours={72}
                    icon={<FileSpreadsheet className="w-6 h-6 text-emerald-400" />}
                    color="bg-emerald-600 hover:bg-emerald-500"
                />
                <ReportCard
                    title="7 Day Report"
                    description="Export metrics from the last 7 days."
                    hours={168}
                    icon={<FileSpreadsheet className="w-6 h-6 text-purple-400" />}
                    color="bg-purple-600 hover:bg-purple-500"
                />
            </div>

            {/* About Section */}
            <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-3">About Reports</h2>
                <p className="text-slate-400">
                    Reports contain detailed endpoint performance metrics including
                    average latency, P95/P99 percentiles, peak latency, request counts,
                    error rates, and success rates. Available in CSV, JSON, and PDF formats.
                </p>
            </div>
        </div>
    );
}