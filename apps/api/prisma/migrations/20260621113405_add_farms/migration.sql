-- CreateTable
CREATE TABLE `farms` (
    `id` VARCHAR(191) NOT NULL,
    `owner_id` VARCHAR(191) NOT NULL,
    `category` ENUM('plantation', 'livestock') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('draft', 'pending_review', 'funding', 'operating', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
    `province` VARCHAR(191) NULL,
    `regency` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USDC',
    `funding_target` DECIMAL(18, 6) NOT NULL,
    `funding_raised` DECIMAL(18, 6) NOT NULL DEFAULT 0,
    `min_investment` DECIMAL(18, 6) NULL,
    `roi_estimate_pct` DECIMAL(5, 2) NULL,
    `tenor_days` INTEGER NULL,
    `funding_start_at` DATETIME(3) NULL,
    `funding_end_at` DATETIME(3) NULL,
    `chain_id` INTEGER NULL,
    `contract_address` VARCHAR(191) NULL,
    `cover_image_key` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `farms_slug_key`(`slug`),
    INDEX `farms_owner_id_idx`(`owner_id`),
    INDEX `farms_category_status_idx`(`category`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `farm_plantations` (
    `farm_id` VARCHAR(191) NOT NULL,
    `commodity` VARCHAR(191) NOT NULL,
    `varietal` VARCHAR(191) NULL,
    `area_hectares` DECIMAL(12, 2) NULL,
    `planted_at` DATETIME(3) NULL,
    `harvest_cycle_days` INTEGER NULL,

    PRIMARY KEY (`farm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `farm_livestock` (
    `farm_id` VARCHAR(191) NOT NULL,
    `animal_type` VARCHAR(191) NOT NULL,
    `breed` VARCHAR(191) NULL,
    `headcount` INTEGER NULL,
    `cycle_days` INTEGER NULL,

    PRIMARY KEY (`farm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `farm_cameras` (
    `id` VARCHAR(191) NOT NULL,
    `farm_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `stream_key` VARCHAR(191) NOT NULL,
    `protocol` VARCHAR(191) NULL,
    `status` ENUM('online', 'offline', 'maintenance') NOT NULL DEFAULT 'offline',
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `thumbnail_key` VARCHAR(191) NULL,
    `last_seen_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `farm_cameras_farm_id_idx`(`farm_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `farm_images` (
    `id` VARCHAR(191) NOT NULL,
    `farm_id` VARCHAR(191) NOT NULL,
    `storage_key` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `farm_images_farm_id_idx`(`farm_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `farms` ADD CONSTRAINT `farms_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `farm_plantations` ADD CONSTRAINT `farm_plantations_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `farm_livestock` ADD CONSTRAINT `farm_livestock_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `farm_cameras` ADD CONSTRAINT `farm_cameras_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `farm_images` ADD CONSTRAINT `farm_images_farm_id_fkey` FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
