import type { Metadata } from "next";
import { PublicJobsList } from "@/app/(public)/jobs/_components/public-jobs-list";
import { jobsListSeoInput } from "@/app/(public)/jobs/jobs-list-seo";
import { parsePublicJobsQuery } from "@/app/(public)/jobs/parse-public-jobs-query";
import { listPublicJobs } from "@/modules/jobs/services/job.service";
import { buildPageMetadata } from "@/modules/seo/metadata";

type JobsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** C-012-7 + C-011-6: Phase 11 metadata · self-canonical `page`. */
export async function generateMetadata({
  searchParams,
}: JobsPageProps): Promise<Metadata> {
  const params = await searchParams;
  return buildPageMetadata(jobsListSeoInput(params));
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const query = parsePublicJobsQuery(params);
  const { data, meta } = await listPublicJobs(query);

  return <PublicJobsList jobs={data} meta={meta} />;
}
