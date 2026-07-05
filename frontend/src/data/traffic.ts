import { TrafficResponse } from "@/types/traffic";

export const trafficData: TrafficResponse = {
  summary: {
    totalRequests: 125000,
    requestsPerMinute: 870,
    activeEndpoints: 24,
    peakTraffic: 2100,
  },

  trend: [
    { time: "10:00", requests: 400 },
    { time: "10:05", requests: 550 },
    { time: "10:10", requests: 800 },
    { time: "10:15", requests: 650 },
    { time: "10:20", requests: 900 },
    { time: "10:25", requests: 1200 },
  ],

  endpoints: [
    {
      endpoint: "/api/users",
      requests: 40000,
    },
    {
      endpoint: "/api/orders",
      requests: 35000,
    },
    {
      endpoint: "/api/payments",
      requests: 28000,
    },
    {
      endpoint: "/api/products",
      requests: 22000,
    },
  ],
};