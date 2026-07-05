-- CreateIndex
CREATE INDEX "ApiMetric_projectId_createdAt_idx" ON "ApiMetric"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ApiMetric_projectId_endpoint_createdAt_idx" ON "ApiMetric"("projectId", "endpoint", "createdAt");

-- CreateIndex
CREATE INDEX "ApiMetric_projectId_statusCode_createdAt_idx" ON "ApiMetric"("projectId", "statusCode", "createdAt");
