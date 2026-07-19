-- Phase 7A billing entitlements

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
  'TAXONOMY_SUGGESTION_REJECTED', 'TAXONOMY_SUGGESTION_MERGED',
  'JOB_CREATED', 'JOB_UPDATED', 'JOB_PUBLISHED', 'JOB_PAUSED', 'JOB_CLOSED', 'JOB_DELETED',
  'JOB_APPROVED',
  'APPLICATION_SUBMITTED', 'APPLICATION_WITHDRAWN', 'APPLICATION_STATUS_CHANGED', 'APPLICATION_VIEWED',
  'RESUME_CREATED', 'RESUME_UPDATED', 'RESUME_VISIBILITY_CHANGED', 'RESUME_STATUS_CHANGED',
  'RESUME_EDUCATION_CREATED', 'RESUME_EDUCATION_UPDATED', 'RESUME_EDUCATION_DELETED',
  'RESUME_EXPERIENCE_CREATED', 'RESUME_EXPERIENCE_UPDATED', 'RESUME_EXPERIENCE_DELETED',
  'RESUME_SKILL_UPDATED', 'RESUME_TECHNOLOGY_UPDATED',
  'RESUME_LANGUAGE_CREATED', 'RESUME_LANGUAGE_UPDATED', 'RESUME_LANGUAGE_DELETED',
  'RESUME_CERTIFICATE_CREATED', 'RESUME_CERTIFICATE_UPDATED', 'RESUME_CERTIFICATE_DELETED',
  'RESUME_PROJECT_CREATED', 'RESUME_PROJECT_UPDATED', 'RESUME_PROJECT_DELETED',
  'PLAN_CREATED', 'PLAN_UPDATED', 'PLAN_FEATURE_VERSIONED', 'PLAN_PRICE_UPDATED',
  'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_CHANGED', 'SUBSCRIPTION_CANCELED', 'SUBSCRIPTION_HISTORY_RECORDED',
  'WALLET_CREDITED', 'WALLET_DEBITED',
  'AI_CREDIT_RESERVED', 'AI_CREDIT_CAPTURED', 'AI_CREDIT_RELEASED',
  'QUOTA_CONSUMED', 'CONTACT_UNLOCKED', 'SYSTEM_SETTING_UPDATED', 'BILLING_ADMIN_GRANT'
) NOT NULL;

CREATE TABLE `plan_definitions` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(80) NOT NULL,
  `audience` ENUM('SEEKER', 'EMPLOYER') NOT NULL,
  `name_fa` VARCHAR(120) NOT NULL,
  `name_en` VARCHAR(120) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `plan_definitions_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `plan_features` (
  `id` VARCHAR(191) NOT NULL,
  `plan_id` VARCHAR(191) NOT NULL,
  `feature_key` VARCHAR(120) NOT NULL,
  `limit_value` INTEGER NULL,
  `period` ENUM('NONE', 'DAY', 'MONTH', 'YEAR') NOT NULL DEFAULT 'MONTH',
  `rollover` BOOLEAN NOT NULL DEFAULT false,
  `version` INTEGER NOT NULL DEFAULT 1,
  `effective_from` DATETIME(3) NOT NULL,
  `effective_to` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `plan_features_plan_id_feature_key_effective_from_idx`(`plan_id`, `feature_key`, `effective_from`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `plan_prices` (
  `id` VARCHAR(191) NOT NULL,
  `sku` VARCHAR(80) NOT NULL,
  `plan_id` VARCHAR(191) NULL,
  `consumable_type` ENUM('JOB_POST', 'RESUME_VIEW', 'CONTACT_UNLOCK', 'FEATURED_DAY', 'AI_CREDIT') NULL,
  `pack_quantity` INTEGER NULL,
  `amount` INTEGER NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'IRR',
  `period_months` INTEGER NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `plan_prices_sku_key`(`sku`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `subscriptions` (
  `id` VARCHAR(191) NOT NULL,
  `owner_type` ENUM('USER', 'COMPANY') NOT NULL,
  `owner_id` VARCHAR(36) NOT NULL,
  `plan_id` VARCHAR(191) NOT NULL,
  `status` ENUM('ACTIVE', 'CANCELED', 'EXPIRED', 'PAST_DUE') NOT NULL DEFAULT 'ACTIVE',
  `current_period_start` DATETIME(3) NOT NULL,
  `current_period_end` DATETIME(3) NOT NULL,
  `cancel_at_period_end` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `subscriptions_owner_type_owner_id_key`(`owner_type`, `owner_id`),
  INDEX `subscriptions_plan_id_idx`(`plan_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `subscription_histories` (
  `id` VARCHAR(191) NOT NULL,
  `subscription_id` VARCHAR(191) NOT NULL,
  `event` ENUM('CREATED', 'ACTIVATED', 'PLAN_CHANGED', 'CANCELED', 'RENEWED', 'EXPIRED', 'ADMIN_OVERRIDE') NOT NULL,
  `from_plan_id` VARCHAR(36) NULL,
  `to_plan_id` VARCHAR(36) NULL,
  `note` TEXT NULL,
  `actor_user_id` VARCHAR(36) NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `subscription_histories_subscription_id_created_at_idx`(`subscription_id`, `created_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `consumable_balances` (
  `id` VARCHAR(191) NOT NULL,
  `owner_type` ENUM('USER', 'COMPANY') NOT NULL,
  `owner_id` VARCHAR(36) NOT NULL,
  `consumable_type` ENUM('JOB_POST', 'RESUME_VIEW', 'CONTACT_UNLOCK', 'FEATURED_DAY', 'AI_CREDIT') NOT NULL,
  `available` INTEGER NOT NULL DEFAULT 0,
  `reserved` INTEGER NOT NULL DEFAULT 0,
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `consumable_balances_owner_type_owner_id_consumable_type_key`(`owner_type`, `owner_id`, `consumable_type`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `consumable_transactions` (
  `id` VARCHAR(191) NOT NULL,
  `owner_type` ENUM('USER', 'COMPANY') NOT NULL,
  `owner_id` VARCHAR(36) NOT NULL,
  `consumable_type` ENUM('JOB_POST', 'RESUME_VIEW', 'CONTACT_UNLOCK', 'FEATURED_DAY', 'AI_CREDIT') NOT NULL,
  `delta` INTEGER NOT NULL,
  `kind` ENUM('CREDIT', 'DEBIT', 'RESERVE', 'CAPTURE', 'RELEASE') NOT NULL,
  `ref_type` VARCHAR(80) NULL,
  `ref_id` VARCHAR(36) NULL,
  `request_id` VARCHAR(120) NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `consumable_transactions_owner_type_owner_id_created_at_idx`(`owner_type`, `owner_id`, `created_at`),
  INDEX `consumable_transactions_request_id_idx`(`request_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `quota_usages` (
  `id` VARCHAR(191) NOT NULL,
  `owner_type` ENUM('USER', 'COMPANY') NOT NULL,
  `owner_id` VARCHAR(36) NOT NULL,
  `feature_key` VARCHAR(120) NOT NULL,
  `period_key` VARCHAR(32) NOT NULL,
  `used` INTEGER NOT NULL DEFAULT 0,
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `quota_usages_owner_type_owner_id_feature_key_period_key_key`(`owner_type`, `owner_id`, `feature_key`, `period_key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `system_settings` (
  `key` VARCHAR(120) NOT NULL,
  `value_json` JSON NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  `updated_by_id` VARCHAR(36) NULL,
  PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `contact_unlocks` (
  `id` VARCHAR(191) NOT NULL,
  `company_id` VARCHAR(191) NOT NULL,
  `target_user_id` VARCHAR(191) NOT NULL,
  `unlocked_by_user_id` VARCHAR(191) NOT NULL,
  `consumable_tx_id` VARCHAR(36) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `contact_unlocks_company_id_target_user_id_key`(`company_id`, `target_user_id`),
  INDEX `contact_unlocks_target_user_id_idx`(`target_user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `plan_features` ADD CONSTRAINT `plan_features_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plan_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `plan_prices` ADD CONSTRAINT `plan_prices_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plan_definitions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plan_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `subscription_histories` ADD CONSTRAINT `subscription_histories_subscription_id_fkey` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `contact_unlocks` ADD CONSTRAINT `contact_unlocks_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `contact_unlocks` ADD CONSTRAINT `contact_unlocks_target_user_id_fkey` FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `contact_unlocks` ADD CONSTRAINT `contact_unlocks_unlocked_by_user_id_fkey` FOREIGN KEY (`unlocked_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
