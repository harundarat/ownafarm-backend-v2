/*
  Warnings:

  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('investor', 'farmer') NOT NULL DEFAULT 'investor';
ALTER TABLE `users` ALTER COLUMN `role` DROP DEFAULT;
