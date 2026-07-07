export interface DeploymentSummary {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  rollbackCount: number;
}

export interface DeploymentImpact {
  version: string;
  latencyImpact: number;
  errorImpact: number;
}

export interface Deployment {
  version: string;
  deployedBy: string;
  deployedAt: string;
  status: "Success" | "Failed" | "Rollback";
}

export interface DeploymentResponse {
  summary: DeploymentSummary;
  impacts: DeploymentImpact[];
  deployments: Deployment[];
}