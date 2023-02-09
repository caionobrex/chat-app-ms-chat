/*
  Warnings:

  - Added the required column `body` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "body" TEXT NOT NULL;
