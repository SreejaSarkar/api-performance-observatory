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
}