-- Phase 2: Profiles & Companies

-- User slug
ALTER TABLE `users` ADD COLUMN `slug` VARCHAR(220) NULL;
CREATE UNIQUE INDEX `users_slug_key` ON `users`(`slug`);
CREATE INDEX `users_slug_idx` ON `users`(`slug`);

-- Job seeker profile extensions
ALTER TABLE `job_seeker_profiles`
  ADD COLUMN `headline` VARCHAR(160) NULL,
  ADD COLUMN `bio` TEXT NULL,
  ADD COLUMN `avatar_url` VARCHAR(512) NULL,
  ADD COLUMN `city_label` VARCHAR(120) NULL,
  ADD COLUMN `profile_visibility` ENUM('PUBLIC', 'EMPLOYERS_ONLY', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE',
  ADD COLUMN `completion_score` INTEGER NOT NULL DEFAULT 0;

-- Employer profile extensions + verification enum migration
ALTER TABLE `employer_profiles`
  ADD COLUMN `job_title` VARCHAR(120) NULL,
  ADD COLUMN `bio` TEXT NULL;

ALTER TABLE `employer_profiles`
  MODIFY COLUMN `verification_status` ENUM('PENDING_REVIEW', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING_REVIEW';

UPDATE `employer_profiles` SET `verification_status` = 'PENDING' WHERE `verification_status` = 'PENDING_REVIEW';

ALTER TABLE `employer_profiles`
  MODIFY COLUMN `verification_status` ENUM('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- Company extensions (backfill slug for existing rows)
ALTER TABLE `companies`
  ADD COLUMN `slug` VARCHAR(220) NULL,
  ADD COLUMN `description` TEXT NULL,
  ADD COLUMN `logo_url` VARCHAR(512) NULL,
  ADD COLUMN `website_url` VARCHAR(512) NULL,
  ADD COLUMN `employee_count_range` ENUM('SIZE_1_10', 'SIZE_11_50', 'SIZE_51_200', 'SIZE_201_500', 'SIZE_501_1000', 'SIZE_1000_PLUS') NULL,
  ADD COLUMN `industry_label` VARCHAR(200) NULL,
  ADD COLUMN `verification_status` ENUM('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  ADD COLUMN `status` ENUM('ACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN `verified_at` DATETIME(3) NULL;

UPDATE `companies` SET `slug` = LOWER(REPLACE(SUBSTRING(`id`, 1, 8), '-', '')) WHERE `slug` IS NULL;

ALTER TABLE `companies` MODIFY COLUMN `slug` VARCHAR(220) NOT NULL;
CREATE UNIQUE INDEX `companies_slug_key` ON `companies`(`slug`);
CREATE INDEX `companies_verification_status_idx` ON `companies`(`verification_status`);
CREATE INDEX `companies_status_idx` ON `companies`(`status`);

-- Company invites
CREATE TABLE `company_invites` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `token_hash` VARCHAR(64) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
    `invited_by` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `accepted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `company_invites_company_id_idx`(`company_id`),
    INDEX `company_invites_token_hash_idx`(`token_hash`),
    INDEX `company_invites_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `company_invites` ADD CONSTRAINT `company_invites_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `company_invites` ADD CONSTRAINT `company_invites_invited_by_fkey` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AuditAction enum extensions (MySQL: recreate enum on audit_logs)
ALTER TABLE `audit_logs` MODIFY COLUMN `action` ENUM(
  'REGISTER', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'LOGOUT_ALL',
  'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET', 'PASSWORD_CHANGED', 'EMAIL_CHANGED',
  'EMAIL_VERIFIED', 'EMAIL_VERIFICATION_SENT', 'ACCOUNT_LOCKED', 'USER_LOCKED',
  'USER_UNLOCKED', 'SESSION_REVOKED', 'USER_SUSPENDED', 'USER_BANNED',
  'ROLE_CHANGED', 'ACCOUNT_DELETED',
  'PROFILE_UPDATED', 'COMPANY_CREATED', 'COMPANY_UPDATED', 'COMPANY_DELETED',
  'MEMBER_INVITED', 'MEMBER_ACCEPTED', 'MEMBER_REMOVED', 'OWNERSHIP_TRANSFERRED',
  'EMPLOYER_VERIFICATION_UPDATED', 'COMPANY_VERIFICATION_UPDATED', 'COMPANY_STATUS_CHANGED'
) NOT NULL;
