/*
  Warnings:

  - You are about to alter the column `status` on the `Delivery` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `status` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Delivery` MODIFY `status` ENUM('preparing', 'delivering', 'delivered', 'cancelled') NOT NULL DEFAULT 'preparing';

-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('pending', 'preparing', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `role_id` DROP DEFAULT;
