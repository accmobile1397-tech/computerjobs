import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLdScripts } from "@/app/(public)/_components/json-ld-scripts";
import { PublicCompanyDetail } from "@/app/(public)/companies/[slug]/_components/public-company-detail";
import { loadPublicCompanyBySlug } from "@/modules/companies/ui/load-public-company";
import {
  buildPublicCompanyBreadcrumbScript,
  buildPublicCompanyPageInput,
} from "@/modules/companies/ui/public-company-seo";
import { buildPageMetadata } from "@/modules/seo/metadata";

type CompanyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

/** C-012-7: Phase 11 metadata. C-012-8: notFound for non-public. */
export async function generateMetadata({
  params,
}: CompanyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await loadPublicCompanyBySlug(slug);
  if (!company) notFound();
  return buildPageMetadata(buildPublicCompanyPageInput(company));
}

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  const { slug } = await params;
  const company = await loadPublicCompanyBySlug(slug);
  if (!company) notFound();

  return (
    <>
      <JsonLdScripts
        payloads={[buildPublicCompanyBreadcrumbScript(company)]}
      />
      <PublicCompanyDetail company={company} />
    </>
  );
}
