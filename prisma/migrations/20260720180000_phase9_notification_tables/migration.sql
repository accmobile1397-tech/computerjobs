-- Phase 9 Notifications — persistence layer (RFC-004)

-- CreateTable
CREATE TABLE `notification_templates` (
    `id` VARCHAR(191) NOT NULL,
    `template_key` VARCHAR(120) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `channel` ENUM('EMAIL', 'SMS', 'IN_APP', 'PUSH', 'WEBHOOK') NOT NULL,
    `locale` VARCHAR(16) NOT NULL DEFAULT 'fa-IR',
    `subject` VARCHAR(500) NULL,
    `body` TEXT NOT NULL,
    `variables_schema` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `notification_templates_template_key_version_channel_locale_key`(`template_key`, `version`, `channel`, `locale`),
    INDEX `notification_templates_template_key_is_active_idx`(`template_key`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `owner_type` ENUM('USER', 'COMPANY') NOT NULL,
    `owner_id` VARCHAR(36) NOT NULL,
    `channel` ENUM('EMAIL', 'SMS', 'IN_APP', 'PUSH', 'WEBHOOK') NOT NULL,
    `category` ENUM('TRANSACTIONAL', 'BILLING', 'JOB_ALERTS', 'MARKETING') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `notification_preferences_owner_type_owner_id_channel_category_key`(`owner_type`, `owner_id`, `channel`, `category`),
    INDEX `notification_preferences_owner_type_owner_id_idx`(`owner_type`, `owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_deliveries` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(36) NOT NULL,
    `event_name` VARCHAR(120) NULL,
    `correlation_id` VARCHAR(120) NOT NULL,
    `channel` ENUM('EMAIL', 'SMS', 'IN_APP', 'PUSH', 'WEBHOOK') NOT NULL,
    `recipient_type` ENUM('USER', 'COMPANY', 'EMAIL', 'PHONE') NOT NULL,
    `recipient_id` VARCHAR(120) NOT NULL,
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
    `template_key` VARCHAR(120) NOT NULL,
    `template_version` INTEGER NOT NULL,
    `provider` VARCHAR(40) NULL,
    `status` ENUM('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `skip_reason` ENUM('OPT_OUT', 'RATE_LIMIT', 'INVALID_RECIPIENT', 'TEMPLATE_DISABLED', 'OTHER') NULL,
    `attempt_count` INTEGER NOT NULL DEFAULT 0,
    `last_error_code` VARCHAR(80) NULL,
    `last_error_message` VARCHAR(500) NULL,
    `template_id` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_deliveries_event_id_channel_recipient_id_template_key_template_version_key`(`event_id`, `channel`, `recipient_id`, `template_key`, `template_version`),
    INDEX `notification_deliveries_correlation_id_idx`(`correlation_id`),
    INDEX `notification_deliveries_event_name_idx`(`event_name`),
    INDEX `notification_deliveries_status_created_at_idx`(`status`, `created_at`),
    INDEX `notification_deliveries_template_key_channel_idx`(`template_key`, `channel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_event_mappings` (
    `id` VARCHAR(191) NOT NULL,
    `config_version` INTEGER NOT NULL DEFAULT 1,
    `event_name` VARCHAR(120) NOT NULL,
    `template_key` VARCHAR(120) NOT NULL,
    `channel` ENUM('EMAIL', 'SMS', 'IN_APP', 'PUSH', 'WEBHOOK') NOT NULL,
    `recipient_rule` VARCHAR(120) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `notification_event_mappings_config_version_event_name_template_key_channel_recipient_rule_key`(`config_version`, `event_name`, `template_key`, `channel`, `recipient_rule`),
    INDEX `notification_event_mappings_config_version_event_name_is_active_idx`(`config_version`, `event_name`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notification_deliveries` ADD CONSTRAINT `notification_deliveries_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `notification_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
