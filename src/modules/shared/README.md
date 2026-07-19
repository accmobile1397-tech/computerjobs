# Shared Module

Cross-cutting infrastructure used by all feature modules.

| Path | Purpose |
|------|---------|
| `env/` | Environment validation (zod) |
| `config/` | App constants (non-secret) |
| `logger/` | Structured logging (pino) |
| `prisma/` | Database client |
| `redis/` | Cache & session client |
| `queue/` | BullMQ connection |
| `storage/` | S3/MinIO client |
| `api/` | API response envelope |
| `utils/` | Shared utilities (e.g. `cn`) |

**Rule:** No business logic here. Feature logic belongs in `src/modules/{feature}/`.
