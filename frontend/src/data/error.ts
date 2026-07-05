import { ErrorResponse } from "@/types/error";

export const errorData: ErrorResponse = {
  summary: {
    totalErrors: 1287,
    errorRate: 1.9,
    clientErrors: 987,
    serverErrors: 300,
  },

  trend: [
    { time: "10:00", errors: 10 },
    { time: "10:05", errors: 14 },
    { time: "10:10", errors: 8 },
    { time: "10:15", errors: 22 },
    { time: "10:20", errors: 17 },
    { time: "10:25", errors: 12 },
  ],

  statusCodes: [
    {
      code: "400",
      count: 420,
    },
    {
      code: "401",
      count: 180,
    },
    {
      code: "404",
      count: 387,
    },
    {
      code: "500",
      count: 200,
    },
    {
      code: "503",
      count: 100,
    },
  ],

  endpoints: [
    {
      endpoint: "/api/payments",
      errors: 130,
    },
    {
      endpoint: "/api/orders",
      errors: 98,
    },
    {
      endpoint: "/api/users",
      errors: 77,
    },
  ],
};