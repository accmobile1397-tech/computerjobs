# Architecture Rules

## Feature-First Structure

```text
src/modules/
  shared/          # infra only — no business logic
  auth/            # Phase 1 IAM — sessions, JWT, RBAC
  users/           # Phase 1 IAM — user profiles, types
  location/
  taxonomy/
  jobs/
  resumes/
  companies/
  search/
  payments/
  notifications/
  advertisements/
  ai/
  admin/
```

### AI module structure (mandatory)

```text
src/modules/ai/
  gateway/
  providers/
  health/
  prompts/
  token/
  fallback/
  queue/
  matching/
```

### Taxonomy module structure

```text
src/modules/taxonomy/
  category/
  subcategory/
  skill/
  technology/
  approval/
  suggestion/
```

### Location module structure

```text
src/modules/location/
  province/
  city/
  seed/
```

## Forbidden

- Large global folders: `controllers/`, `services/`, `helpers/`, `utils/` at repo root  
- `src/lib/` for new code — use `src/modules/shared/`  
- God Service / God Controller / God Repository  

## Module Isolation

Each module owns: API (via services), business logic, validation, DB access, types.  
Modules must not reach into another module's internals — use public module APIs.

## Domain Rules

Business logic **never** in: UI components, pages, API route handlers.  
Route handlers delegate to module services.

## Queue Rules

Heavy work via BullMQ in module or `shared/queue` — never in request cycle.

## Search Rules

Search works without AI. AI may improve ranking only.

## Notification Rules

Email, SMS, in-app — admin configurable.

## Logging Rules

Log: errors, security, payment, AI events.  
Never log: passwords, tokens, sensitive PII.

## Monitoring Rules

Health checks, queue, DB, Redis monitoring required (Phase 14).

## Testing Rules

Critical business logic must be testable; avoid tight coupling.

See [docs/adr/0001-feature-first.md](../docs/adr/0001-feature-first.md).
