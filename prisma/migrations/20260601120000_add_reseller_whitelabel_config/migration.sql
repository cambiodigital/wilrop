-- AlterTable: Add whiteLabelConfig JSON blob to Reseller
ALTER TABLE "Reseller" ADD COLUMN "whiteLabelConfig" TEXT NOT NULL DEFAULT '{}';
