# Modules — Feature-First Architecture

All business capabilities live under `src/modules/{feature}/`.

Each module owns: API handlers (via app routes importing services), business logic, validation, DB access, and types.

## Modules

| Module | Phase | Status |
|--------|-------|--------|
| [shared](./shared/) | 0 | Active |
| [auth](./auth/) | 1 IAM | Skeleton |
| [location](./location/) | 2 | Skeleton |
| [taxonomy](./taxonomy/) | 3 | Skeleton |
| [jobs](./jobs/) | 4 | Skeleton |
| [resumes](./resumes/) | 5 | Skeleton |
| [companies](./companies/) | 4+ | Skeleton |
| [search](./search/) | 6 | Skeleton |
| [ai](./ai/) | 7–8 | Skeleton |
| [payments](./payments/) | 9 | Skeleton |
| [notifications](./notifications/) | 10 | Skeleton |
| [advertisements](./advertisements/) | 11 | Skeleton |
| [admin](./admin/) | ongoing | Skeleton |

See `.cto/ARCHITECTURE_RULES.md` and `docs/adr/0001-feature-first.md`.
