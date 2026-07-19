# Shared Config

Application constants and typed configuration — **not secrets**.

Secrets and environment variables remain in `../env/`.

**Phase 1+:** app metadata, feature flags, plan limits constants.

```typescript
// Example (Phase 1+)
export const APP_NAME = "ComputerJobs.ir";
export const DEFAULT_LOCALE = "fa-IR";
```
