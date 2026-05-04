ALTER TABLE "Subagent" ADD COLUMN "sellerLevel" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "Subagent" ADD COLUMN "whiteLabelEnabled" BOOLEAN NOT NULL DEFAULT false;
