/*
  Warnings:

  - Added the required column `phone_order` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `delivery` ADD COLUMN `phone_order` VARCHAR(191) NOT NULL;
