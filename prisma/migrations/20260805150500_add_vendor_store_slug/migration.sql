-- AlterTable
ALTER TABLE "vendor_applications" ADD COLUMN "storeSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "vendor_applications_storeSlug_key" ON "vendor_applications"("storeSlug");
