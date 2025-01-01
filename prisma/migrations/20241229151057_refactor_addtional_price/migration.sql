/*
  Warnings:

  - A unique constraint covering the columns `[name,value,additional_price]` on the table `Option` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `unique_name_value_price` ON `Option`(`name`, `value`, `additional_price`);
