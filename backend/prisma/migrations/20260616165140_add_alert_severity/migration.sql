/*
  Warnings:

  - Added the required column `severity` to the `AlertRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AlertRule" ADD COLUMN     "severity" TEXT NOT NULL;
