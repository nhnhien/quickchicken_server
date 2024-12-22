-- AlterTable
ALTER TABLE `Payment` MODIFY `status` ENUM('pending', 'completed', 'cancelled', 'failed', 'refunded') NOT NULL DEFAULT 'pending';
