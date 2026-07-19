# Deployment Rules

## Target

- **OpenShip** self-hosted on VPS  
- **Docker** for app + data services  
- Future: Kubernetes — no hard-coded vendor assumptions  

See [docs/adr/0004-openship.md](../docs/adr/0004-openship.md).

## Requirements

- Application runs via Docker  
- Health endpoints: `/api/v1/health`, `/api/v1/health/deep`  
- MySQL, Redis, MinIO on internal Docker network  

## Git Workflow

```text
main     # production-ready
develop  # integration — all phase commits here
```

## Commits

Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

## Environment

- Production secrets in OpenShip env vars only  
- `APP_URL=https://computerjobs.ir` for metadata  

## Documentation

Every phase: specs + `CTO_REPORT.md` before merge to `develop`.

## CTO Handoff

Official delivery: **commit link** on `develop`. See [docs/reviews/CTO_HANDOFF.md](../docs/reviews/CTO_HANDOFF.md).
