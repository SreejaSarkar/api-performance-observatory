"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    getDashboard,
} from "@/lib/dashboard-api";

import MetricCard
    from "@/components/dashboard/MetricCard";

import {
    DashboardData,
} from "@/types/dashboard";
import { getLatencyDistribution, getSlowEndpoints, getTraffic, getTrend, getComparison } from "@/lib/metrics-api";
import dynamic from "next/dynamic";
const LatencyDistributionChart = dynamic(() => import("@/components/charts/LatencyDistributionChart"), { ssr: false });
const TrafficChart = dynamic(() => import("@/components/charts/TrafficChart"), { ssr: false });
const LatencyTrendChart = dynamic(() => import("@/components/charts/LatencyTrendChart"), { ssr: false });
import ProjectHeader from "@/components/projects/ProjectHeader";
import ComparisonBar from "@/components/dashboard/ComparisonBar";
import {
    Activity,
    HeartPulse,
    AlertTriangle,
    Gauge,
    Server,
    Clock,
    TrendingUp,
    Shield,
    BarChart3,
    PieChart,
} from "lucide-react";
import SlowEndpointsCard from "@/components/dashboard/SlowEndpointsCard";
import { getEvents } from "@/lib/alerts-api";
import RecentAlertsCard from "@/components/dashboard/RecentAlertsCard";
import HealthOverviewCard from "@/components/dashboard/HealthOverviewCard";
import TimeRangeSelector from "@/components/dashboard/TimeRangeSelector";
import ChartCard from "@/components/charts/ChartCard";
import SkeletonCard from "@/components/common/SkeletonCard";
import ErrorState from "@/components/common/ErrorState";
import { useRequireProject } from "@/lib/useRequireProject";
import { useRealtimeRefresh } from "@/lib/useRealtimeRefresh";
import LiveIndicator from "@/components/dashboard/LiveIndicator";

export default function DashboardPage() {
    useRequireProject();
    const [
        dashboard,
        setDashboard,
    ] =
        useState<
            DashboardData | null
        >(null);
    const [
        trend,
        setTrend,
    ] = useState([]);

    const [
        traffic,
        setTraffic,
    ] = useState([]);

    const [
        distribution,
        setDistribution,
    ] = useState<any>(
        {},
    );

    const [
        slowEndpoints,
        setSlowEndpoints,
    ] = useState([]);

    const [
        recentAlerts,
        setRecentAlerts,
    ] = useState([]);

    const [
        comparison,
        setComparison,
    ] = useState<any>(null);

    const [
        hours,
        setHours,
    ] = useState(72);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    async function load() {
        try {
            if (!dashboard) setLoading(true);

            setError("");

            const [
                dashboardData,
                trendData,
                trafficData,
                distributionData,
                slowEndpointsData,
                alertEventsData,
                comparisonData,
            ] = await Promise.all([
                getDashboard(hours),
                getTrend(hours),
                getTraffic(hours),
                getLatencyDistribution(hours),
                getSlowEndpoints(),
                getEvents(),
                getComparison(hours),
            ]);

            setDashboard(
                dashboardData,
            );

            setTrend(
                trendData,
            );

            setTraffic(
                trafficData,
            );

            setDistribution(
                distributionData,
            );

            setSlowEndpoints(
                slowEndpointsData,
            );

            setRecentAlerts(
                alertEventsData.slice(
                    0,
                    5,
                ),
            );

            setComparison(comparisonData);
        } catch (err: any) {
            setError(
                err?.message ||
                "Failed to load dashboard.",
            );
        } finally {
            setLoading(false);
        }
    }


    const { connected } = useRealtimeRefresh(load);

    useEffect(() => {
        load();
    }, [hours]);

    if (loading) {
        return (
            <div
                className="
                grid
                md:grid-cols-4
                gap-4
                p-8
            "
            >
                {Array.from({
                    length: 8,
                }).map((_, i) => (
                    <SkeletonCard
                        key={i}
                    />
                ))}
            </div>
        );
    }
    if (error) {
        return (
            <div
                className="
                max-w-7xl
                mx-auto
                p-8
            "
            >
                <ErrorState
                    message={error}
                    onRetry={load}
                />
            </div>
        );
    }
    if (!dashboard) {
        return null;
    }

    return (
        <div
            className="
            max-w-7xl
            mx-auto
            p-8
        "
        >
            <div className="flex items-center justify-between mb-2">
                <ProjectHeader
                    projectName="Project 5"
                    status={
                        dashboard.health
                            .healthScore >= 80
                            ? "Healthy"
                            : "Degraded"
                    }
                    subtitle="Monitoring last 72 hours"
                />
                <LiveIndicator connected={connected} />
            </div>

            <ComparisonBar data={comparison} />

            <div
                className="
        flex
        justify-between
        items-center
        mb-8
    "
            >
                <div>
                    <h2
                        className="
                text-xl
                font-semibold
            "
                    >
                        Performance Overview
                    </h2>

                    <p
                        className="
                text-slate-400
                mt-1
            "
                    >
                        Last {hours} hours
                    </p>
                </div>

                <TimeRangeSelector
                    value={hours}
                    onChange={
                        setHours
                    }
                />
            </div>

            {/* Primary KPIs */}

            <div
                className="
                grid
                lg:grid-cols-4
                gap-4
                mb-8
            "
            >
                <MetricCard
                    title="Health Score"
                    value={
                        dashboard.health.healthScore
                    }
                    icon={
                        <HeartPulse
                            className="
                w-7
                h-7
                text-emerald-400
            "
                        />
                    }
                />

                <MetricCard
                    title="Availability"
                    value={`${dashboard.sla.availability}%`}
                    icon={
                        <Shield
                            className="
                w-7
                h-7
                text-blue-400
            "
                        />
                    }
                />

                <MetricCard
                    title="Requests"
                    value={
                        dashboard.summary.requests
                    }
                    icon={
                        <Server
                            className="
                w-7
                h-7
                text-purple-400
            "
                        />
                    }
                />

                <MetricCard
                    title="Error Rate"
                    value={`${dashboard.summary.errorRate}%`}
                    icon={
                        <AlertTriangle
                            className="
                w-7
                h-7
                text-red-400
            "
                        />
                    }
                />
            </div>

            {/* Performance KPIs */}

            <div
                className="
                grid
                lg:grid-cols-3
                gap-4
                mb-8
            "
            >
                <MetricCard
                    title="Avg Latency"
                    value={`${dashboard.summary.avgLatency} ms`}
                    icon={
                        <Gauge
                            className="
                w-7
                h-7
                text-cyan-400
            "
                        />
                    }
                />

                <MetricCard
                    title="P95 Latency"
                    value={`${dashboard.summary.p95Latency} ms`}
                    icon={
                        <Clock
                            className="
                w-7
                h-7
                text-yellow-400
            "
                        />
                    }
                />

                <MetricCard
                    title="P99 Latency"
                    value={`${dashboard.summary.p99Latency} ms`}
                    icon={
                        <TrendingUp
                            className="
                w-7
                h-7
                text-orange-400
            "
                        />
                    }
                />
            </div>

            <div
                className="
        mt-8
        mb-8
    "
            >
                <HealthOverviewCard
                    availability={
                        dashboard.sla
                            .availability
                    }
                    latency={
                        dashboard.summary
                            .avgLatency
                    }
                    errorRate={
                        dashboard.summary
                            .errorRate
                    }
                    healthScore={
                        dashboard.health
                            .healthScore
                    }
                    requests={
                        dashboard.summary
                            .requests
                    }
                />
            </div>

            {/* Charts */}

            <div
                className="
        grid
        xl:grid-cols-2
        gap-6
        mt-8
    "
            >
                <ChartCard
                    title="Latency Trend"
                    description="
                    Average API response time
                    over the selected period
                    "
                    icon={
                        <Activity
                            className="
                            w-5
                            h-5
                            text-cyan-400
                            "
                        />
                    }
                >
                    <LatencyTrendChart
                        data={trend}
                    />
                </ChartCard>

                <ChartCard
                    title="Traffic Trend"
                    description="
                    Request volume over time
                    "
                    icon={
                        <BarChart3
                            className="
                            w-5
                            h-5
                            text-cyan-400
                            "
                        />
                    }
                >
                    <TrafficChart
                        data={traffic}
                    />
                </ChartCard>
            </div>

            <div
                className="
                mt-8
            "
            >
                <ChartCard
                    title="Latency Distribution"
                    description="
                     Distribution of API
                    response times
                "
                    icon={
                        <PieChart
                            className="
                            w-5
                            h-5
                            text-cyan-400
                            "
                        />
                    }
                >
                    <LatencyDistributionChart
                        distribution={
                            distribution
                        }
                    />
                </ChartCard>
            </div>

            <div
                className="
        grid
        lg:grid-cols-2
        gap-6
        mt-8
    "
            >
                <SlowEndpointsCard
                    endpoints={
                        slowEndpoints
                    }
                />

                <RecentAlertsCard
                    events={
                        recentAlerts
                    }
                />
            </div>
        </div>
    );
}