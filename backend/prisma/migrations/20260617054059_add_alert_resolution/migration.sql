-- AlterTable
ALTER TABLE "AlertEvent" ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resolvedAt" TIMESTAMP(3);
