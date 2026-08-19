-- AddColumn password (nullable — OAuth accounts won't have one)
ALTER TABLE "User" ADD COLUMN "password" TEXT;

-- AddColumn phone (nullable)
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
