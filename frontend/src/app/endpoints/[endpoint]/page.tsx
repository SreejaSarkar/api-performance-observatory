"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEndpointDetail } from "@/lib/metrics-api";
import { useRequireProject } from "@/lib/useRequireProject";
import { useRealtimeRefresh } from "@/lib/useRealtimeRefresh";
import {
  Activity,
  Clock,
  AlertTriangle,
  Zap,
  TrendingUp,
  ArrowLeft,
  Boxes,
  Globe,
  Hash,
} from "lucide-react";
import Link from "next/link";

type EndpointDetailResponse = {
  stats: {
    avgLatency: number;
    p95Latency: number;
    totalRequests: number;
    errorRate: number;
    avgResponseSize: number | null;
  } | null;
  latencyTrend: Array<{
    time: string;
    avg: number;
    p95: number;
    p99: number;
    requests: number;
    errorRate: number;
  }>;
  errorBreakdown: Array<{
    statusCode: number;
    count: number;
  }>;
  methodBreakdown: Array<{
    method: string;
    requests: number;
  }>;
  environmentBreakdown: Array<{
    environment: string;
    requests: number;
  }>;
  recentSamples: Array<{
    method: string;
    statusCode: number;
    latency: number;
    requests: number;
    responseSize: number | null;
    requestId: string | null;
    userAgent: string | null;
    environment: string | null;
    timestamp: string;
  }>;
};

function formatBytes(bytes: number | null) {
  if (bytes == null) {
    return "N/A";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EndpointDetailPage() {
  const hasProject = useRequireProject();
  const params = useParams();
  const endpoint = decodeURIComponent(params.endpoint as string);

  const [data, setData] = useState<EndpointDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const result = (await getEndpointDetail(endpoint)) as EndpointDetailResponse;
      setData(result);
    } catch (err: any) {
      setError(err?.message || "Failed to load endpoint details.");
    } finally {
      setLoading(false);
    }
  };

  useRealtimeRefresh(load);

  useEffect(() => {
    if (!hasProject) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [endpoint, hasProject]);

  if (!hasProject) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-800 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!data?.stats) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <p className="text-slate-400">No data available for this endpoint.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold font-mono">{endpoint}</h1>
        <p className="text-slate-400 text-sm mt-1">Endpoint performance details — Last 72 hours</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            Avg Latency
          </div>
          <p className="text-2xl font-bold">{data.stats.avgLatency}ms</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Zap className="w-3.5 h-3.5" />
            P95 Latency
          </div>
          <p className="text-2xl font-bold">{data.stats.p95Latency}ms</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Activity className="w-3.5 h-3.5" />
            Total Requests
          </div>
          <p className="text-2xl font-bold">{data.stats.totalRequests.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Error Rate
          </div>
          <p className="text-2xl font-bold">{data.stats.errorRate}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Boxes className="w-3.5 h-3.5" />
            Avg Response Size
          </div>
          <p className="text-2xl font-bold">{formatBytes(data.stats.avgResponseSize)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-emerald-400" />
            HTTP Methods
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.methodBreakdown.map((item) => (
              <div
                key={item.method}
                className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2"
              >
                <div className="text-xs text-emerald-300">{item.method}</div>
                <div className="text-sm font-semibold text-white">
                  {item.requests.toLocaleString()} requests
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Environments
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.environmentBreakdown.map((item) => (
              <div
                key={item.environment}
                className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2"
              >
                <div className="text-xs text-cyan-300">{item.environment}</div>
                <div className="text-sm font-semibold text-white">
                  {item.requests.toLocaleString()} requests
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latency Trend */}
      {data.latencyTrend.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Latency Trend (Hourly)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Avg</th>
                  <th className="text-left p-2">P95</th>
                  <th className="text-left p-2">P99</th>
                  <th className="text-left p-2">Requests</th>
                  <th className="text-left p-2">Error Rate</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {data.latencyTrend.map((point: any) => (
                  <tr key={point.time} className="border-t border-slate-800">
                    <td className="p-2 text-xs">{new Date(point.time).toLocaleString()}</td>
                    <td className="p-2">{point.avg}ms</td>
                    <td className="p-2">{point.p95}ms</td>
                    <td className="p-2">{point.p99}ms</td>
                    <td className="p-2">{point.requests}</td>
                    <td className="p-2">
                      <span className={point.errorRate > 10 ? "text-red-400" : ""}>
                        {point.errorRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error Breakdown */}
      {data.errorBreakdown.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Error Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.errorBreakdown.map((item: any) => (
              <div
                key={item.statusCode}
                className="bg-slate-800/50 rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-red-400">{item.statusCode}</p>
                <p className="text-xs text-slate-400 mt-1">{item.count} occurrences</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recentSamples.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Samples</h2>
          <p className="text-sm text-slate-400 mb-4">
            Method, environment, payload size, and request IDs are the most reusable extra fields for teams operating many services.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Latency</th>
                  <th className="text-left p-2">Requests</th>
                  <th className="text-left p-2">Response Size</th>
                  <th className="text-left p-2">Environment</th>
                  <th className="text-left p-2">Request ID</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {data.recentSamples.map((sample) => (
                  <tr
                    key={`${sample.timestamp}-${sample.requestId ?? sample.method}-${sample.statusCode}`}
                    className="border-t border-slate-800 align-top"
                  >
                    <td className="p-2 text-xs whitespace-nowrap">
                      {new Date(sample.timestamp).toLocaleString()}
                    </td>
                    <td className="p-2">{sample.method}</td>
                    <td className="p-2">
                      <span className={sample.statusCode >= 500 ? "text-red-400" : sample.statusCode >= 400 ? "text-amber-400" : "text-emerald-400"}>
                        {sample.statusCode}
                      </span>
                    </td>
                    <td className="p-2">{sample.latency}ms</td>
                    <td className="p-2">{sample.requests}</td>
                    <td className="p-2">{formatBytes(sample.responseSize)}</td>
                    <td className="p-2">{sample.environment ?? "N/A"}</td>
                    <td className="p-2 font-mono text-xs text-slate-400 max-w-48 truncate">
                      {sample.requestId ?? "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
