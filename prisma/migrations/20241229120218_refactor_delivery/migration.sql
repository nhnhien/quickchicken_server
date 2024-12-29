-- AlterTable
ALTER TABLE `Delivery` MODIFY `status` ENUM('pending', 'delivering', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending';
