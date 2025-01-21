/*
  Warnings:

  - Made the column `additional_price` on table `Option` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Option` MODIFY `additional_price` DOUBLE NOT NULL;
