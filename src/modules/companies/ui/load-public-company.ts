/**
 * Load a public company for SSR pages (P12-006).
 * Returns null when not found / not public (C-012-8) — caller uses notFound().
 */
import { cache } from "react";
import {
  CompanyError,
  getPublicCompanyBySlug,
} from "@/modules/companies/services/company.service";

export type PublicCompany = Awaited<ReturnType<typeof getPublicCompanyBySlug>>;

export const loadPublicCompanyBySlug = cache(
  async (slug: string): Promise<PublicCompany | null> => {
    try {
      return await getPublicCompanyBySlug(slug);
    } catch (error) {
      if (error instanceof CompanyError && error.code === "NOT_FOUND") {
        return null;
      }
      throw error;
    }
  },
);
