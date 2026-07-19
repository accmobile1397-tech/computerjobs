import { UserPrimaryType } from "@prisma/client";

/** Seed-defined role slugs — used ONLY at registration, not for authorization checks. */
export const DEFAULT_ROLE_SLUG_BY_PRIMARY_TYPE: Record<
  UserPrimaryType,
  string
> = {
  JOB_SEEKER: "job_seeker",
  EMPLOYER: "employer",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};
