-- Phase 4: Jobs Core

CREATE TABLE `jobs` (
    `id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL,
    `created_by_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(220) NOT NULL,
    `description` TEXT NOT NULL,
    `city_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `sub_category_id` VARCHAR(191) NULL,
    `employment_type` ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'HYBRID') NOT NULL,
    `experience_level` ENUM('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL') NULL,
    `salary_min` INTEGER NULL,
    `salary_max` INTEGER NULL,
    `salary_currency` VARCHAR(3) NULL DEFAULT 'IRR',
    `salary_type` ENUM('MONTHLY', 'YEARLY', 'HOURLY', 'PROJECT') NULL,
    `show_salary` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'CLOSED', 'EXPIRED', 'DELETED') NOT NULL DEFAULT 'DRAFT',
    `is_remote` BOOLEAN NULL,
    `is_urgent` BOOLEAN NULL,
    `is_featured` BOOLEAN NULL,
    `published_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `closed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `jobs_slug_key`(`slug`),
    INDEX `jobs_company_id_status_idx`(`company_id`, `status`),
    INDEX `jobs_status_published_at_idx`(`status`, `published_at`),
    INDEX `jobs_city_id_idx`(`city_id`),
    INDEX `jobs_category_id_idx`(`category_id`),
    INDEX `jobs_experience_level_idx`(`experience_level`),
    INDEX `jobs_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `jobs` ADD CONSTRAINT `jobs_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_sub_category_id_fkey` FOREIGN KEY (`sub_category_id`) REFERENCES `subcategories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `job_skills` (
    `job_id` VARCHAR(191) NOT NULL,
    `skill_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`job_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `job_skills` ADD CONSTRAINT `job_skills_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `job_skills` ADD CONSTRAINT `job_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `job_applications` (
    `id` VARCHAR(191) NOT NULL,
    `job_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `status` ENUM('SUBMITTED', 'VIEWED', 'WITHDRAWN', 'REJECTED', 'SHORTLISTED', 'HIRED') NOT NULL DEFAULT 'SUBMITTED',
    `cover_letter` TEXT NULL,
    `resume_id` VARCHAR(191) NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `viewed_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `withdrawn_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `job_applications_job_id_user_id_key`(`job_id`, `user_id`),
    INDEX `job_applications_user_id_idx`(`user_id`),
    INDEX `job_applications_job_id_status_idx`(`job_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
  'APPLICATION_SUBMITTED', 'APPLICATION_WITHDRAWN', 'APPLICATION_STATUS_CHANGED', 'APPLICATION_VIEWED'
) NOT NULL;
