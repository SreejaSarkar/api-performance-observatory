import { Injectable } from "@nestjs/common";

import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ReportsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async generateReportData(projectId: string, hours = 72) {
        const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

        const metrics = await this.prisma.apiMetric.findMany({
            where: {
                projectId,
                createdAt: { gte: startDate },
            },
            select: {
                endpoint: true,
                latency: true,
                statusCode: true,
                requests: true,
                createdAt: true,
            },
        });

        if (!metrics.length) {
            return { summary: null, endpoints: [] };
        }

        const endpointMap = new Map<
            string,
            {
                latencies: number[];
                totalRequests: number;
                errors: number;
                count: number;
            }
        >();

        let totalRequests = 0;
        let totalErrors = 0;

        for (const metric of metrics) {
            totalRequests += metric.requests;
            if (metric.statusCode >= 400) totalErrors += metric.requests;

            const existing = endpointMap.get(metric.endpoint);
            if (existing) {
                existing.latencies.push(metric.latency);
                existing.totalRequests += metric.requests;
                existing.count++;
                if (metric.statusCode >= 400) existing.errors++;
            } else {
                endpointMap.set(metric.endpoint, {
                    latencies: [metric.latency],
                    totalRequests: metric.requests,
                    count: 1,
                    errors: metric.statusCode >= 400 ? 1 : 0,
                });
            }
        }

        const endpoints = Array.from(endpointMap.entries()).map(
            ([endpoint, data]) => {
                const sorted = [...data.latencies].sort((a, b) => a - b);
                const avgLatency = Math.round(
                    sorted.reduce((a, b) => a + b, 0) / sorted.length,
                );
                const p95Latency = sorted[Math.floor(sorted.length * 0.95)] || 0;
                const p99Latency = sorted[Math.floor(sorted.length * 0.99)] || 0;
                const peakLatency = sorted[sorted.length - 1] || 0;
                const errorRate = Number(
                    ((data.errors / data.count) * 100).toFixed(2),
                );
                const successRate = Number((100 - errorRate).toFixed(2));

                return {
                    endpoint,
                    avgLatency,
                    p95Latency,
                    p99Latency,
                    peakLatency,
                    totalRequests: data.totalRequests,
                    errorRate,
                    successRate,
                };
            },
        );

        // Get anomaly count for the period
        const anomalyCount = await this.prisma.anomaly.count({
            where: {
                projectId,
                detectedAt: { gte: startDate },
            },
        });

        const allLatencies = metrics.map((m) => m.latency).sort((a, b) => a - b);
        const overallAvgLatency = Math.round(
            allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length,
        );
        const overallP95 = allLatencies[Math.floor(allLatencies.length * 0.95)] || 0;
        const overallErrorRate = Number(
            ((totalErrors / totalRequests) * 100).toFixed(2),
        );
        const availability = Number((100 - overallErrorRate).toFixed(3));

        const summary = {
            periodHours: hours,
            generatedAt: new Date().toISOString(),
            totalRequests,
            totalEndpoints: endpointMap.size,
            avgLatency: overallAvgLatency,
            p95Latency: overallP95,
            errorRate: overallErrorRate,
            availability,
            anomalyCount,
        };

        return { summary, endpoints };
    }

    async exportCsv(projectId: string, hours = 72): Promise<string> {
        const { summary, endpoints } = await this.generateReportData(projectId, hours);

        if (!summary) return "No data available for the selected period.";

        const fields = [
            "endpoint",
            "avgLatency",
            "p95Latency",
            "p99Latency",
            "peakLatency",
            "totalRequests",
            "errorRate",
            "successRate",
        ];

        const parser = new Parser({ fields });
        const csvData = parser.parse(endpoints);

        const header = [
            `# Performance Report - Last ${hours} hours`,
            `# Generated: ${summary.generatedAt}`,
            `# Total Requests: ${summary.totalRequests}`,
            `# Overall Avg Latency: ${summary.avgLatency}ms`,
            `# Overall P95 Latency: ${summary.p95Latency}ms`,
            `# Availability: ${summary.availability}%`,
            `# Error Rate: ${summary.errorRate}%`,
            `# Anomalies Detected: ${summary.anomalyCount}`,
            `# Endpoints: ${summary.totalEndpoints}`,
            "",
        ].join("\n");

        return header + csvData;
    }

    async exportJson(projectId: string, hours = 72) {
        return this.generateReportData(projectId, hours);
    }

    async exportPdf(projectId: string, hours = 72): Promise<Buffer> {
        const { summary, endpoints } = await this.generateReportData(projectId, hours);

        return new Promise((resolve) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on("data", (chunk: Buffer) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));

            // Title
            doc.fontSize(22).font("Helvetica-Bold")
                .text("API Performance Report", { align: "center" });
            doc.moveDown(0.5);
            doc.fontSize(12).font("Helvetica")
                .fillColor("#666666")
                .text(`Last ${hours} hours | Generated: ${new Date().toLocaleString()}`, { align: "center" });
            doc.moveDown(1.5);

            if (!summary) {
                doc.fontSize(14).fillColor("#000000")
                    .text("No data available for the selected period.");
                doc.end();
                return;
            }

            // Summary Section
            doc.fontSize(16).font("Helvetica-Bold").fillColor("#000000")
                .text("Summary");
            doc.moveDown(0.5);

            doc.fontSize(11).font("Helvetica").fillColor("#333333");
            const summaryItems = [
                ["Total Requests", summary.totalRequests.toLocaleString()],
                ["Availability", `${summary.availability}%`],
                ["Avg Latency", `${summary.avgLatency}ms`],
                ["P95 Latency", `${summary.p95Latency}ms`],
                ["Error Rate", `${summary.errorRate}%`],
                ["Anomalies Detected", String(summary.anomalyCount)],
                ["Endpoints Monitored", String(summary.totalEndpoints)],
            ];

            for (const [label, value] of summaryItems) {
                doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
                doc.font("Helvetica").text(value);
            }

            doc.moveDown(1.5);

            // Endpoints Section
            doc.fontSize(16).font("Helvetica-Bold").fillColor("#000000")
                .text("Endpoint Performance");
            doc.moveDown(0.5);

            // Table header
            doc.fontSize(9).font("Helvetica-Bold").fillColor("#444444");
            const tableTop = doc.y;
            doc.text("Endpoint", 50, tableTop, { width: 150 });
            doc.text("Avg", 200, tableTop, { width: 40 });
            doc.text("P95", 240, tableTop, { width: 40 });
            doc.text("P99", 280, tableTop, { width: 40 });
            doc.text("Peak", 320, tableTop, { width: 40 });
            doc.text("Requests", 360, tableTop, { width: 60 });
            doc.text("Errors", 420, tableTop, { width: 40 });
            doc.text("Success", 460, tableTop, { width: 50 });

            doc.moveDown(0.3);
            doc.moveTo(50, doc.y).lineTo(520, doc.y).stroke("#cccccc");
            doc.moveDown(0.3);

            // Table rows
            doc.fontSize(8).font("Helvetica").fillColor("#000000");
            for (const ep of endpoints) {
                if (doc.y > 700) {
                    doc.addPage();
                }

                const y = doc.y;
                doc.text(ep.endpoint.substring(0, 25), 50, y, { width: 150 });
                doc.text(`${ep.avgLatency}ms`, 200, y, { width: 40 });
                doc.text(`${ep.p95Latency}ms`, 240, y, { width: 40 });
                doc.text(`${ep.p99Latency}ms`, 280, y, { width: 40 });
                doc.text(`${ep.peakLatency}ms`, 320, y, { width: 40 });
                doc.text(String(ep.totalRequests), 360, y, { width: 60 });
                doc.text(`${ep.errorRate}%`, 420, y, { width: 40 });
                doc.text(`${ep.successRate}%`, 460, y, { width: 50 });
                doc.moveDown(0.8);
            }

            doc.end();
        });
    }

    // Keep legacy method for backward compatibility
    async exportReport(projectId: string, hours = 72) {
        return this.exportCsv(projectId, hours);
    }
}