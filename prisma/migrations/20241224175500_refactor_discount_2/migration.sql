/*
  Warnings:

  - You are about to drop the column `code` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `customer_target` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `product_target` on the `Discount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discount_code]` on the table `Discount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discount_code` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Discount_code_key` ON `Discount`;

-- AlterTable
ALTER TABLE `Discount` DROP COLUMN `code`,
    DROP COLUMN `customer_target`,
    DROP COLUMN `product_target`,
    ADD COLUMN `discount_code` VARCHAR(191) NOT NULL,
    MODIFY `start_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `Discount_discount_code_key` ON `Discount`(`discount_code`);
