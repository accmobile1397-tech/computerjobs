# ComputerJobs CTO Rulebook v1.1

**Index** — read this file first, then the specialized rules below.

If any rule conflicts, **this index + specialized files take precedence** over ad-hoc instructions.

---

## Core Principles (priority order)

1. Security  
2. Data Integrity  
3. Reliability  
4. SEO  
5. Maintainability  
6. Performance  
7. Developer Experience  
8. Convenience  

Never sacrifice higher-priority principles for lower ones.

---

## Product Principles

- AI Native · Persian First · RTL First · Mobile First · SEO First · Security First  
- Audience: technology professionals, employers, recruiters, technology companies  

---

## Specialized Rules

| File | Topic |
|------|--------|
| [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md) | Feature-first modules, domain rules |
| [DATABASE_RULES.md](./DATABASE_RULES.md) | UUID, audit fields, naming |
| [PRISMA_RULES.md](./PRISMA_RULES.md) | Migrations, seeds, client usage |
| [NEXTJS_RULES.md](./NEXTJS_RULES.md) | App Router, API, UI |
| [AI_RULES.md](./AI_RULES.md) | Gateway, graceful degradation |
| [SECURITY_RULES.md](./SECURITY_RULES.md) | Auth, validation, headers |
| [SEO_RULES.md](./SEO_RULES.md) | Metadata, structured data, URLs |
| [DEPLOYMENT_RULES.md](./DEPLOYMENT_RULES.md) | Docker, OpenShip, Git workflow |
| [CODE_STYLE.md](./CODE_STYLE.md) | Naming, commits, modules |
| [REVIEW_CHECKLIST.md](./REVIEW_CHECKLIST.md) | Phase completion, CTO report |
| [TOKEN_OPTIMIZATION.md](./TOKEN_OPTIMIZATION.md) | Context load, docs scope, minimal tests |

---

## Architecture Docs

- [docs/adr/](../docs/adr/) — Architecture Decision Records  
- [docs/rfc/](../docs/rfc/) — Request for Comments (large features)  
- [docs/DECISIONS.md](../docs/DECISIONS.md) — Decision log  

---

## Before Any Task

1. Read `.cto/RULEBOOK.md` and relevant specialized files (see [TOKEN_OPTIMIZATION.md](./TOKEN_OPTIMIZATION.md))  
2. Follow all rules; document conflicts in `CTO_REPORT.md`  
3. Spec phase → `TECHNICAL_SPEC` only (unless more requested). Closeout → `CTO_REPORT` (≤300 lines)  
4. Hand off to CTO via commit link on `main` — see [docs/reviews/CTO_HANDOFF.md](../docs/reviews/CTO_HANDOFF.md)

---

## Final Rule

Quality over speed. Architecture over shortcuts. Security over convenience.  
If unsure, choose what will still be correct in three years.
