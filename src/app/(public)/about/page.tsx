import type { Metadata } from "next";
import { StaticDocument } from "@/app/(public)/_components/static-document";
import {
  STATIC_PAGES,
  staticPageSeoInput,
} from "@/app/(public)/_content/static-pages";
import { buildPageMetadata } from "@/modules/seo/metadata";

const page = STATIC_PAGES.about;

/** C-012-7: generateMetadata via Phase 11 builders. */
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(staticPageSeoInput("about"));
}

export default function AboutPage() {
  return (
    <StaticDocument heading={page.heading} paragraphs={page.paragraphs} />
  );
}
