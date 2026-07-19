-- AlterTable: extend AuditAction
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
  'RESUME_PROJECT_CREATED', 'RESUME_PROJECT_UPDATED', 'RESUME_PROJECT_DELETED'
) NOT NULL;

-- CreateTable
CREATE TABLE `resumes` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(160) NULL,
    `summary` TEXT NULL,
    `status` ENUM('DRAFT', 'ACTIVE') NOT NULL DEFAULT 'DRAFT',
    `visibility` ENUM('PUBLIC', 'EMPLOYERS_ONLY', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE',
    `completion_score` INTEGER NOT NULL DEFAULT 0,
    `profile_strength` INTEGER NULL,
    `ai_summary` TEXT NULL,
    `ai_keywords` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `resumes_user_id_key`(`user_id`),
    INDEX `resumes_status_visibility_idx`(`status`, `visibility`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_educations` (
    `id` VARCHAR(191) NOT NULL,
    `resume_id` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(200) NOT NULL,
    `degree` VARCHAR(120) NULL,
    `field_of_study` VARCHAR(120) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `resume_educations_resume_id_sort_order_idx`(`resume_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_experiences` (
    `id` VARCHAR(191) NOT NULL,
    `resume_id` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(200) NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `employment_type` ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'HYBRID') NULL,
    `city_id` VARCHAR(191) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `resume_experiences_resume_id_sort_order_idx`(`resume_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_skills` (
    `resume_id` VARCHAR(191) NOT NULL,
    `skill_id` VARCHAR(191) NOT NULL,
    `proficiency` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`resume_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_technologies` (
    `resume_id` VARCHAR(191) NOT NULL,
    `technology_id` VARCHAR(191) NOT NULL,
    `proficiency` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`resume_id`, `technology_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_languages` (
    `id` VARCHAR(191) NOT NULL,
    `resume_id` VARCHAR(191) NOT NULL,
    `language_code` VARCHAR(10) NOT NULL,
    `language_name` VARCHAR(80) NOT NULL,
    `proficiency` ENUM('NATIVE', 'FLUENT', 'ADVANCED', 'INTERMEDIATE', 'BASIC') NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `resume_languages_resume_id_sort_order_idx`(`resume_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_certificates` (
    `id` VARCHAR(191) NOT NULL,
    `resume_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `issuer` VARCHAR(200) NULL,
    `issue_date` DATE NULL,
    `expiry_date` DATE NULL,
    `credential_id` VARCHAR(120) NULL,
    `credential_url` VARCHAR(512) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `resume_certificates_resume_id_sort_order_idx`(`resume_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_projects` (
    `id` VARCHAR(191) NOT NULL,
    `resume_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `url` VARCHAR(512) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `resume_projects_resume_id_sort_order_idx`(`resume_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resume_project_technologies` (
    `project_id` VARCHAR(191) NOT NULL,
    `technology_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`project_id`, `technology_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `job_applications` ADD INDEX `job_applications_resume_id_idx`(`resume_id`);

-- AddForeignKey
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_educations` ADD CONSTRAINT `resume_educations_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_experiences` ADD CONSTRAINT `resume_experiences_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_experiences` ADD CONSTRAINT `resume_experiences_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_skills` ADD CONSTRAINT `resume_skills_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_skills` ADD CONSTRAINT `resume_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_technologies` ADD CONSTRAINT `resume_technologies_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_technologies` ADD CONSTRAINT `resume_technologies_technology_id_fkey` FOREIGN KEY (`technology_id`) REFERENCES `technologies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_languages` ADD CONSTRAINT `resume_languages_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_certificates` ADD CONSTRAINT `resume_certificates_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_projects` ADD CONSTRAINT `resume_projects_resume_id_fkey` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_project_technologies` ADD CONSTRAINT `resume_project_technologies_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `resume_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resume_project_technologies` ADD CONSTRAINT `resume_project_technologies_technology_id_fkey` FOREIGN KEY (`technology_id`) REFERENCES `technologies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
