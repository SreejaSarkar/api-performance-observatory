import { DeploymentResponse } from "@/types/deployment";

export const deploymentData: DeploymentResponse = {
  summary: {
    totalDeployments: 45,
    successfulDeployments: 40,
    failedDeployments: 3,
    rollbackCount: 2,
  },

  impacts: [
    {
      version: "v1.4.1",
      latencyImpact: 20,
      errorImpact: 2,
    },
    {
      version: "v1.4.2",
      latencyImpact: 45,
      errorImpact: 8,
    },
    {
      version: "v1.4.3",
      latencyImpact: 12,
      errorImpact: 1,
    },
    {
      version: "v1.4.4",
      latencyImpact: 80,
      errorImpact: 15,
    },
  ],

  deployments: [
    {
      version: "v1.4.4",
      deployedBy: "Platform Team",
      deployedAt: "2026-06-01",
      status: "Rollback",
    },
    {
      version: "v1.4.3",
      deployedBy: "Platform Team",
      deployedAt: "2026-05-20",
      status: "Success",
    },
    {
      version: "v1.4.2",
      deployedBy: "Platform Team",
      deployedAt: "2026-05-10",
      status: "Success",
    },
  ],
};