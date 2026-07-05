-- AlterTable
ALTER TABLE "Anomaly" ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'WARNING';

-- CreateTable
CREATE TABLE "EndpointBaseline" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "avgLatency" DOUBLE PRECISION NOT NULL,
    "stdDevLatency" DOUBLE PRECISION NOT NULL,
    "avgErrorRate" DOUBLE PRECISION NOT NULL,
    "avgRequests" DOUBLE PRECISION NOT NULL,
    "sampleCount" INTEGER NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EndpointBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EndpointBaseline_projectId_endpoint_key" ON "EndpointBaseline"("projectId", "endpoint");

-- AddForeignKey
ALTER TABLE "EndpointBaseline" ADD CONSTRAINT "EndpointBaseline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
