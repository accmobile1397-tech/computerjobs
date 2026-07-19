# Security Rules

## Validation

Never trust client input — validate server-side (body, params, query).

## Authentication (Phase 1 IAM)

- JWT + refresh tokens + RBAC  
- Password hashing — never plain text (argon2/bcrypt)  

## Authorization

Authentication ≠ authorization — check permissions on every protected action.

**Module:** `src/modules/authorization/` — separate from `src/modules/auth/`.

## No Hardcoded RBAC

**Forbidden:** hardcoded role or permission strings in code (e.g. `if (role === 'admin')`).

All authorization checks must query database-backed roles/permissions via `authorization` module services.

## Secrets

Never commit `.env`, keys, tokens. Only `.env.example`.

## Rate Limiting

Required: login, registration, password reset, public APIs.

## Security Headers

CSP, HSTS (production), X-Frame-Options, X-Content-Type-Options.

## API Errors

Consistent envelope — never expose stack traces.

## Audit

Security events logged (Phase 13–14).
