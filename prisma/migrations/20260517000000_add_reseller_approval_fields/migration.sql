-- Add new columns with defaults for NEW self-registered subagents
ALTER TABLE "Subagent" ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Subagent" ADD COLUMN "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing subagents to approved (they were created by admin directly)
UPDATE "Subagent" SET "approvalStatus" = 'approved', "active" = true;

-- Change active default to false for future self-registered subagents
ALTER TABLE "Subagent" ALTER COLUMN "active" SET DEFAULT false;
