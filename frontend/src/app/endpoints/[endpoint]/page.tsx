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
} from "lucide-react";
import Link from "next/link";

export default function EndpointDetailPage() {
  useRequireProject();
  const params = useParams();
  const endpoint = decodeURIComponent(params.endpoint as string);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getEndpointDetail(endpoint);
      setData(result);
    } catch (err: any) {
      setError(err?.message || "Failed to load endpoint details.");
    } finally {
      setLoading(false);
    }
  };

  useRealtimeRefresh(load);

  useEffect(() => {
    load();
  }, [endpoint]);

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
    </div>
  );
}
