# ADR-0001: Feature-First Module Architecture

**Status:** Accepted  
**Date:** 2026-07-19  
**Deciders:** CTO, Architecture  

## Context

Phase 0 used `src/lib/` (layer-based). CTO Rulebook requires feature-first modules for maintainability at scale.

## Decision

Adopt `src/modules/{feature}/` structure from Phase 1 onward. Move cross-cutting infra to `src/modules/shared/`.

Mandatory skeletons for `ai/`, `taxonomy/`, `location/` with subfolders defined in ARCHITECTURE_RULES.

## Consequences

- **Positive:** Clear ownership, easier Phase 7 AI work without big refactor  
- **Negative:** Short-term import path updates  
- **Neutral:** API routes remain in `app/api` but delegate to modules  

## Compliance

- [x] `src/modules/` created  
- [x] `src/lib/` removed  
- [x] `shared/` contains env, logger, prisma, redis, queue, storage  

See `.cto/ARCHITECTURE_RULES.md`.
