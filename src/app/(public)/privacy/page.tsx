import type { Metadata } from "next";
import { JsonLdScripts } from "@/app/(public)/_components/json-ld-scripts";
import { StaticDocument } from "@/app/(public)/_components/static-document";
import {
  STATIC_PAGES,
  staticPageBreadcrumbScript,
  staticPageSeoInput,
} from "@/app/(public)/_content/static-pages";
import { buildPageMetadata } from "@/modules/seo/metadata";

const page = STATIC_PAGES.privacy;

/** C-012-7: generateMetadata via Phase 11 builders. */
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(staticPageSeoInput("privacy"));
}

export default function PrivacyPage() {
  return (
    <>
      <JsonLdScripts payloads={[staticPageBreadcrumbScript("privacy")]} />
      <StaticDocument heading={page.heading} paragraphs={page.paragraphs} />
    </>
  );
}
