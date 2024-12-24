/*
  Warnings:

  - You are about to drop the column `apply_to` on the `Discount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Discount` DROP COLUMN `apply_to`,
    ADD COLUMN `customer_target` ENUM('specific_user', 'all_users') NULL DEFAULT 'all_users',
    ADD COLUMN `product_target` ENUM('specific_product', 'all_product') NULL DEFAULT 'all_product';
