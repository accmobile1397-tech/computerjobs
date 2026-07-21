/**
 * Public site footer (P12-002): links to live static pages only.
 */
import Link from "next/link";
import { DEPLOYED_PHASE } from "@/modules/shared/config/deploy-phase";

const FOOTER_NAV = [
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
  { href: "/terms", label: "قوانین" },
  { href: "/privacy", label: "حریم خصوصی" },
] as const;

export function PublicSiteFooter() {
  return (
    <footer className="border-t border-border py-6">
      <div className="container mx-auto flex flex-col items-center gap-3 px-4 text-center text-sm text-muted-foreground">
        <nav className="flex flex-wrap justify-center gap-3" aria-label="پاورقی">
          {FOOTER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p>
          © {new Date().getFullYear()} ComputerJobs.ir — Phase {DEPLOYED_PHASE}
        </p>
      </div>
    </footer>
  );
}
