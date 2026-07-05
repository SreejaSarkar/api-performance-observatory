"use client";

import { useEffect, useState } from "react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import {
    Download,
    FileSpreadsheet,
    Clock,
    FileText,
    FileJson,
    Activity,
    Shield,
    Zap,
    AlertTriangle,
} from "lucide-react";
import { downloadReport, getReportPreview, ReportFormat } from "@/lib/reports-api";
import { useRequireProject } from "@/lib/useRequireProject";

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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                {icon}
                <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            <p className="text-slate-400 mb-5">{description}</p>

            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-slate-500 mr-1">Format:</span>
                {formats.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setSelectedFormat(f.value)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
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
                className={`${color} px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm font-medium`}
            >
                <Download className="w-4 h-4" />
                Download {selectedFormat.toUpperCase()}
            </button>
        </div>
    );
}

export default function ReportsPage() {
    useRequireProject();

    const [preview, setPreview] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(true);

    useEffect(() => {
        getReportPreview(72)
            .then(setPreview)
            .catch(() => {})
            .finally(() => setPreviewLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 md:p-8 overflow-x-hidden">
            <ProjectHeader
                projectName="Project 5"
                status="Healthy"
                subtitle="Generate and download performance reports"
            />

            {/* Summary Preview */}
            {!previewLoading && preview?.summary && (
                <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
                    <h2 className="text-lg font-semibold mb-4">Report Preview (Last 72h)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                <Activity className="w-3.5 h-3.5" />
                                Total Requests
                            </div>
                            <p className="text-2xl font-bold">{preview.summary.totalRequests.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                <Shield className="w-3.5 h-3.5" />
                                Availability
                            </div>
                            <p className="text-2xl font-bold">{preview.summary.availability}%</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                <Zap className="w-3.5 h-3.5" />
                                P95 Latency
                            </div>
                            <p className="text-2xl font-bold">{preview.summary.p95Latency}ms</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Anomalies
                            </div>
                            <p className="text-2xl font-bold">{preview.summary.anomalyCount}</p>
                        </div>
                    </div>

                    {preview.endpoints.length > 0 && (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="text-slate-400 uppercase">
                                    <tr>
                                        <th className="text-left p-2">Endpoint</th>
                                        <th className="text-left p-2">Avg</th>
                                        <th className="text-left p-2">P95</th>
                                        <th className="text-left p-2">P99</th>
                                        <th className="text-left p-2">Requests</th>
                                        <th className="text-left p-2">Error Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {preview.endpoints.slice(0, 5).map((ep: any) => (
                                        <tr key={ep.endpoint} className="border-t border-slate-800">
                                            <td className="p-2 font-mono truncate max-w-[120px]">{ep.endpoint}</td>
                                            <td className="p-2">{ep.avgLatency}ms</td>
                                            <td className="p-2">{ep.p95Latency}ms</td>
                                            <td className="p-2">{ep.p99Latency}ms</td>
                                            <td className="p-2">{ep.totalRequests}</td>
                                            <td className="p-2">{ep.errorRate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {preview.endpoints.length > 5 && (
                                <p className="text-xs text-slate-500 mt-2 px-2">
                                    + {preview.endpoints.length - 5} more endpoints in full report
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Download Cards */}
            <div className="grid md:grid-cols-3 gap-6">
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