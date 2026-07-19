# ADR-0005: Taxonomy Module Structure

**Status:** Accepted  
**Date:** 2026-07-19  
**Deciders:** CTO, Architecture  

## Context

Job platform requires strict hierarchy: Category → SubCategory → Skill → Technology. AI may suggest but never publish. Changes must be auditable.

## Decision

Module `src/modules/taxonomy/` with subfolders from Phase 0 skeleton:

```text
category/
subcategory/
skill/
technology/
approval/      # admin workflow
suggestion/    # AI pending only
```

15 official categories seeded in Phase 3. Governance workflow:

```text
AI Suggest → Pending → Admin Review → Approve/Reject/Merge → Publish
```

Store: createdBy, approvedBy, change history.

## Consequences

- **Positive:** Clear separation of AI suggestions vs published taxonomy  
- **Positive:** SEO URLs map to taxonomy entities (`/categories/...`, `/skills/...`)  
- **Negative:** Four-level hierarchy adds query complexity — mitigate with indexes  

## References

- `.cto/DATABASE_RULES.md`
- `docs/SEO_STRATEGY.md`
- `docs/rfc/` (skill extraction Phase 7)
