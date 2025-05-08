/*
  Warnings:

  - Added the required column `userId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `userId` INTEGER NOT NULL DEFAULT 1;

-- Remove the default constraint now that all records have been updated
ALTER TABLE `Product` ALTER COLUMN `userId` DROP DEFAULT;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default admin user (password is 'admin123' - you should change this in production)
INSERT INTO `User` (`email`, `password`, `name`, `role`, `createdAt`, `updatedAt`)
VALUES ('admin@example.com', '$2b$10$VJvLu6KVHUg3h1KqaVXtQer/s4Xkqo4b09UQSvxV4q1Fw.yJE.WCW', 'Admin User', 'ADMIN', NOW(), NOW());

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
