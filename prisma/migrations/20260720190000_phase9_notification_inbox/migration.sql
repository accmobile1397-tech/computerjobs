-- Phase 9 — In-app inbox (P9-010)

CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `owner_type` ENUM('USER', 'COMPANY') NOT NULL,
    `owner_id` VARCHAR(36) NOT NULL,
    `template_key` VARCHAR(120) NOT NULL,
    `template_version` INTEGER NOT NULL,
    `title` VARCHAR(500) NULL,
    `content` TEXT NOT NULL,
    `event_id` VARCHAR(36) NOT NULL,
    `correlation_id` VARCHAR(120) NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'SENT',
    `provider_message_id` VARCHAR(120) NULL,
    `delivery_id` VARCHAR(36) NULL,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `notifications_event_id_owner_type_owner_id_template_key_template_version_key`(`event_id`, `owner_type`, `owner_id`, `template_key`, `template_version`),
    INDEX `notifications_owner_type_owner_id_created_at_idx`(`owner_type`, `owner_id`, `created_at`),
    INDEX `notifications_correlation_id_idx`(`correlation_id`),
    INDEX `notifications_read_at_idx`(`read_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `notifications` ADD CONSTRAINT `notifications_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `notification_deliveries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
