-- AlterTable
ALTER TABLE `order` ADD COLUMN `address` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `phone_order` VARCHAR(191) NOT NULL DEFAULT '';
