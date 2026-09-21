ALTER TABLE "ApiMetric"
ADD COLUMN "method" TEXT,
ADD COLUMN "requestId" TEXT,
ADD COLUMN "responseSize" INTEGER,
ADD COLUMN "userAgent" TEXT,
ADD COLUMN "environment" TEXT,
ADD COLUMN "metadata" JSONB;