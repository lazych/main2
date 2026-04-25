/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isFakeMaintenance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShadowBanned" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Game";
