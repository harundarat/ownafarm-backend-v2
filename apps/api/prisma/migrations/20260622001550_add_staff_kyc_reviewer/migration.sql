-- AlterTable
ALTER TABLE `user_documents` ADD COLUMN `reviewed_by_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `staff` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'kyc_reviewer') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `staff_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `user_documents_reviewed_by_id_idx` ON `user_documents`(`reviewed_by_id`);

-- AddForeignKey
ALTER TABLE `user_documents` ADD CONSTRAINT `user_documents_reviewed_by_id_fkey` FOREIGN KEY (`reviewed_by_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
