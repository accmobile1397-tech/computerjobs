# ADR-0006: Separate Authorization Module

**Status:** Accepted  
**Date:** 2026-07-19  
**Phase:** 1 IAM

## Context

CTO required authentication and authorization to remain separate for long-term policy/ACL evolution.

## Decision

- `src/modules/auth/` — login, tokens, password, verification, audit write
- `src/modules/authorization/` — permission/role checks from database only
- **No hardcoded** role/permission checks in code paths

## Consequences

- Clear boundary for Phase 13 policies
- Slightly more imports in routes
- All checks go through `authorization.service`
