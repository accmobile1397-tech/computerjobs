-- Phase 10 — DomainEventLog append-only (P10-003 · C-010-5)

CREATE TABLE `domain_event_logs` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `version` INTEGER NOT NULL,
    `occurred_at` DATETIME(3) NOT NULL,
    `aggregate_type` VARCHAR(80) NOT NULL,
    `aggregate_id` VARCHAR(120) NOT NULL,
    `correlation_id` VARCHAR(120) NULL,
    `payload` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `domain_event_logs_event_id_key`(`event_id`),
    INDEX `domain_event_logs_name_occurred_at_idx`(`name`, `occurred_at`),
    INDEX `domain_event_logs_aggregate_id_idx`(`aggregate_id`),
    INDEX `domain_event_logs_correlation_id_idx`(`correlation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
