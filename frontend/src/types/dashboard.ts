export interface DashboardData {
    summary: {
        avgLatency: number;
        p95Latency: number;
        p99Latency: number;
        requests: number;
        errorRate: number;
    };

    health: {
        healthScore: number;
        status: string;
    };

    sla: {
        availability: number;
        target: number;
        breached: boolean;
    };

    trend: {
        time: string;
        latency: number;
    }[];

    traffic: {
        time: string;
        requests: number;
    }[];

    latencyDistribution: Record<string, number>;

    slowEndpoints: {
        endpoint: string;
        avgLatency: number;
        requests: number;
    }[];

    recentAlerts: {
        id: string;
        rule: string;
        severity: string;
        value: number;
        threshold: number;
        triggeredAt: string;
    }[];

    comparison: {
        current: {
            avgLatency: number;
            p95Latency: number;
            errorRate: number;
            totalRequests: number;
            availability: number;
        };
        previous: {
            avgLatency: number;
            p95Latency: number;
            errorRate: number;
            totalRequests: number;
            availability: number;
        };
        changes: {
            avgLatency: number;
            p95Latency: number;
            errorRate: number;
            totalRequests: number;
            availability: number;
        };
        periodHours: number;
    };
}