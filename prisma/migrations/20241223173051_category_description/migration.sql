/*
  Warnings:

  - A unique constraint covering the columns `[description]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Category` ADD COLUMN `description` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Category_description_key` ON `Category`(`description`);
