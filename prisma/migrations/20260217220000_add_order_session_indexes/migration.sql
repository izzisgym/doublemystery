-- CreateIndex
CREATE INDEX "BlindboxSession_status_idx" ON "BlindboxSession"("status");

-- CreateIndex
CREATE INDEX "BlindboxSession_createdAt_idx" ON "BlindboxSession"("createdAt");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
