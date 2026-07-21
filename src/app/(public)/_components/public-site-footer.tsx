/**
 * Public site footer shell (P12-001).
 * Copyright only — static/legal links deferred to P12-002+.
 */
import { DEPLOYED_PHASE } from "@/modules/shared/config/deploy-phase";

export function PublicSiteFooter() {
  return (
    <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} ComputerJobs.ir — Phase {DEPLOYED_PHASE}
    </footer>
  );
}
