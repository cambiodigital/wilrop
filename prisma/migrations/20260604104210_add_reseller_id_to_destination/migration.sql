-- AlterTable
ALTER TABLE "Destination" ADD COLUMN "resellerId" TEXT;

-- CreateIndex
CREATE INDEX "Destination_resellerId_idx" ON "Destination"("resellerId");

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "Reseller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
