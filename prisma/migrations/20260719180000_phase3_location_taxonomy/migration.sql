-- Phase 3: Location & Taxonomy

CREATE TABLE `provinces` (
    `id` VARCHAR(191) NOT NULL,
    `name_fa` VARCHAR(120) NOT NULL,
    `name_en` VARCHAR(120) NULL,
    `slug` VARCHAR(120) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `provinces_slug_key`(`slug`),
    INDEX `provinces_is_active_sort_order_idx`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `cities` (
    `id` VARCHAR(191) NOT NULL,
    `province_id` VARCHAR(191) NOT NULL,
    `name_fa` VARCHAR(120) NOT NULL,
    `name_en` VARCHAR(120) NULL,
    `slug` VARCHAR(120) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cities_province_id_is_active_idx`(`province_id`, `is_active`),
    UNIQUE INDEX `cities_province_id_slug_key`(`province_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `cities` ADD CONSTRAINT `cities_province_id_fkey` FOREIGN KEY (`province_id`) REFERENCES `provinces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name_fa` VARCHAR(120) NOT NULL,
    `name_en` VARCHAR(120) NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `aliases` JSON NOT NULL,
    `popularity_score` INTEGER NOT NULL DEFAULT 0,
    `is_official` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    INDEX `categories_is_active_sort_order_idx`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `subcategories` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `name_fa` VARCHAR(120) NOT NULL,
    `name_en` VARCHAR(120) NULL,
    `slug` VARCHAR(120) NOT NULL,
    `aliases` JSON NOT NULL,
    `popularity_score` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `subcategories_category_id_slug_key`(`category_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `subcategories` ADD CONSTRAINT `subcategories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `skills` (
    `id` VARCHAR(191) NOT NULL,
    `sub_category_id` VARCHAR(191) NOT NULL,
    `name_fa` VARCHAR(120) NOT NULL,
    `name_en` VARCHAR(120) NULL,
    `slug` VARCHAR(120) NOT NULL,
    `aliases` JSON NOT NULL,
    `popularity_score` INTEGER NOT NULL DEFAULT 0,
    `is_official` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `skills_slug_key`(`slug`),
    INDEX `skills_sub_category_id_is_active_idx`(`sub_category_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `skills` ADD CONSTRAINT `skills_sub_category_id_fkey` FOREIGN KEY (`sub_category_id`) REFERENCES `subcategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `technologies` (
    `id` VARCHAR(191) NOT NULL,
    `skill_id` VARCHAR(191) NOT NULL,
    `name_fa` VARCHAR(120) NOT NULL,
    `name_en` VARCHAR(120) NULL,
    `slug` VARCHAR(120) NOT NULL,
    `aliases` JSON NOT NULL,
    `popularity_score` INTEGER NOT NULL DEFAULT 0,
    `official_url` VARCHAR(512) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `technologies_slug_key`(`slug`),
    INDEX `technologies_skill_id_is_active_idx`(`skill_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `technologies` ADD CONSTRAINT `technologies_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `taxonomy_suggestions` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` ENUM('CATEGORY', 'SUBCATEGORY', 'SKILL', 'TECHNOLOGY') NOT NULL,
    `proposed_name_fa` VARCHAR(120) NOT NULL,
    `proposed_name_en` VARCHAR(120) NULL,
    `proposed_slug` VARCHAR(120) NOT NULL,
    `proposed_aliases` JSON NOT NULL,
    `parent_id` VARCHAR(36) NULL,
    `source` ENUM('AI', 'ADMIN', 'EMPLOYER', 'USER') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'MERGED') NOT NULL DEFAULT 'PENDING',
    `ai_metadata` JSON NULL,
    `review_note` TEXT NULL,
    `merged_into_id` VARCHAR(36) NULL,
    `created_by_id` VARCHAR(191) NULL,
    `reviewed_by_id` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `taxonomy_suggestions_status_entity_type_idx`(`status`, `entity_type`),
    INDEX `taxonomy_suggestions_proposed_slug_idx`(`proposed_slug`),
    INDEX `taxonomy_suggestions_source_idx`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `taxonomy_suggestions` ADD CONSTRAINT `taxonomy_suggestions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `taxonomy_suggestions` ADD CONSTRAINT `taxonomy_suggestions_reviewed_by_id_fkey` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `job_seeker_profiles` ADD COLUMN `city_id` VARCHAR(191) NULL;
CREATE INDEX `job_seeker_profiles_city_id_idx` ON `job_seeker_profiles`(`city_id`);
ALTER TABLE `job_seeker_profiles` ADD CONSTRAINT `job_seeker_profiles_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `companies` ADD COLUMN `category_id` VARCHAR(191) NULL;
CREATE INDEX `companies_category_id_idx` ON `companies`(`category_id`);
ALTER TABLE `companies` ADD CONSTRAINT `companies_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `audit_logs` MODIFY COLUMN `action` ENUM(
  'REGISTER', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'LOGOUT_ALL',
  'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET', 'PASSWORD_CHANGED', 'EMAIL_CHANGED',
  'EMAIL_VERIFIED', 'EMAIL_VERIFICATION_SENT', 'ACCOUNT_LOCKED', 'USER_LOCKED',
  'USER_UNLOCKED', 'SESSION_REVOKED', 'USER_SUSPENDED', 'USER_BANNED',
  'ROLE_CHANGED', 'ACCOUNT_DELETED',
  'PROFILE_UPDATED', 'COMPANY_CREATED', 'COMPANY_UPDATED', 'COMPANY_DELETED',
  'MEMBER_INVITED', 'MEMBER_ACCEPTED', 'MEMBER_REMOVED', 'OWNERSHIP_TRANSFERRED',
  'EMPLOYER_VERIFICATION_UPDATED', 'COMPANY_VERIFICATION_UPDATED', 'COMPANY_STATUS_CHANGED',
  'PROVINCE_UPDATED', 'CITY_UPDATED',
  'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED',
  'SUBCATEGORY_CREATED', 'SUBCATEGORY_UPDATED', 'SUBCATEGORY_DELETED',
  'SKILL_CREATED', 'SKILL_UPDATED', 'SKILL_DELETED',
  'TECHNOLOGY_CREATED', 'TECHNOLOGY_UPDATED', 'TECHNOLOGY_DELETED',
  'TAXONOMY_SUGGESTION_CREATED', 'TAXONOMY_SUGGESTION_APPROVED',
  'TAXONOMY_SUGGESTION_REJECTED', 'TAXONOMY_SUGGESTION_MERGED'
) NOT NULL;
