# Code Style

## File Naming

- Files: `kebab-case.ts`  
- Components: `PascalCase.tsx`  
- Functions: `camelCase`  

## Imports

- Use `@/modules/{feature}/...` for module code  
- Use `@/modules/shared/...` for infrastructure  
- Avoid deep relative imports across modules  

## Module Layout (per feature)

```text
modules/{feature}/
  README.md
  services/
  repositories/
  validators/
  types/
  (api handlers stay in app/api importing services)
```

## Comments

Self-documenting code preferred; comments for non-obvious business rules only.

## Documentation (per phase)

`TECHNICAL_SPEC.md`, `ARCHITECTURE.md`, `DATABASE_DESIGN.md`, `API_DESIGN.md`, `SECURITY_REVIEW.md`, `SEO_REVIEW.md`, `PHASE_SUMMARY.md`, `CTO_REPORT.md`
