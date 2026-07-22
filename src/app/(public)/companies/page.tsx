import type { Metadata } from "next";
import { PublicCompaniesList } from "@/app/(public)/companies/_components/public-companies-list";
import { companiesListSeoInput } from "@/app/(public)/companies/companies-list-seo";
import { parsePublicCompaniesQuery } from "@/app/(public)/companies/parse-public-companies-query";
import { listPublicCompanies } from "@/modules/companies/services/company.service";
import { buildPageMetadata } from "@/modules/seo/metadata";

type CompaniesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** C-012-7 + C-011-6: Phase 11 metadata · self-canonical `page`. */
export async function generateMetadata({
  searchParams,
}: CompaniesPageProps): Promise<Metadata> {
  const params = await searchParams;
  return buildPageMetadata(companiesListSeoInput(params));
}

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const params = await searchParams;
  const query = parsePublicCompaniesQuery(params);
  const { data, meta } = await listPublicCompanies(query);

  return <PublicCompaniesList companies={data} meta={meta} />;
}
