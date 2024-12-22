/*
  Warnings:

  - You are about to alter the column `status` on the `Delivery` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(2))`.
  - You are about to alter the column `status` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `Delivery` MODIFY `status` ENUM('delivering', 'delivered', 'cancelled') NOT NULL DEFAULT 'delivering';

-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('pending', 'preparing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `amount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `bank_code` VARCHAR(191) NULL,
    ADD COLUMN `card_type` VARCHAR(191) NULL,
    ADD COLUMN `order_info` VARCHAR(191) NULL,
    ADD COLUMN `pay_date` DATETIME(3) NULL,
    ADD COLUMN `response_code` VARCHAR(191) NULL,
    ADD COLUMN `secure_hash` VARCHAR(191) NULL,
    ADD COLUMN `tmn_code` VARCHAR(191) NULL,
    ADD COLUMN `transaction_no` VARCHAR(191) NULL,
    ADD COLUMN `transaction_status` VARCHAR(191) NULL,
    ADD COLUMN `txn_ref` VARCHAR(191) NOT NULL DEFAULT 'N/A',
    MODIFY `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending';
