import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLdScripts } from "@/app/(public)/_components/json-ld-scripts";
import { PublicJobDetail } from "@/app/(public)/jobs/[slug]/_components/public-job-detail";
import { loadPublicJobBySlug } from "@/modules/jobs/ui/load-public-job";
import {
  buildPublicJobBreadcrumbScript,
  buildPublicJobPageInput,
  buildPublicJobPostingScript,
} from "@/modules/jobs/ui/public-job-seo";
import { buildPageMetadata } from "@/modules/seo/metadata";

type JobDetailPageProps = {
  params: Promise<{ slug: string }>;
};

/** C-012-7: Phase 11 metadata. C-012-8: notFound for non-public. */
export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await loadPublicJobBySlug(slug);
  if (!job) notFound();
  return buildPageMetadata(buildPublicJobPageInput(job));
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = await loadPublicJobBySlug(slug);
  if (!job) notFound();

  // C-012-9 JobPosting · P12-007 Breadcrumb — Phase 11 builders only (C-012-5).
  return (
    <>
      <JsonLdScripts
        payloads={[
          buildPublicJobPostingScript(job),
          buildPublicJobBreadcrumbScript(job),
        ]}
      />
      <PublicJobDetail job={job} />
    </>
  );
}
