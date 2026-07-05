import { LatencyResponse } from "@/types/latency";

export const latencyData: LatencyResponse = {
  summary: {
    avgLatency: 180,
    p95Latency: 450,
    p99Latency: 900,
    requests: 125000,
  },

  trend: [
    { time: "10:00", latency: 120 },
    { time: "10:05", latency: 150 },
    { time: "10:10", latency: 200 },
    { time: "10:15", latency: 240 },
    { time: "10:20", latency: 170 },
    { time: "10:25", latency: 130 },
  ],

  endpoints: [
    {
      endpoint: "/api/users",
      p50: 100,
      p95: 420,
      p99: 820,
    },
    {
      endpoint: "/api/orders",
      p50: 120,
      p95: 480,
      p99: 920,
    },
    {
      endpoint: "/api/payments",
      p50: 140,
      p95: 550,
      p99: 1100,
    },
  ],
};