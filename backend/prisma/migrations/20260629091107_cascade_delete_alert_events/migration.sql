-- DropForeignKey
ALTER TABLE "AlertEvent" DROP CONSTRAINT "AlertEvent_ruleId_fkey";

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AlertRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
