# Database Rules

## Primary Keys

- Always **UUID** — never auto-increment IDs  

## Audit Fields (every table)

```text
id
createdAt
updatedAt
deletedAt
```

## Soft Delete

Use `deletedAt` — never hard-delete business records.

## Naming

| Layer | Convention |
|-------|------------|
| Tables | `snake_case` (`@@map`) |
| Prisma models | `PascalCase` |
| Fields | `camelCase` (`@map` to snake_case) |

## Seed Data (required)

- Provinces, cities, categories, roles, permissions  

## Location

- Hierarchy: Province → City  
- All 31 provinces + Iranian cities  
- Admin: add, edit, disable  

## Taxonomy

- Hierarchy: Category → SubCategory → Skill → Technology  
- AI suggests only; admin publishes  
- Trace: created by, approved by, change history  

## Resume

- One free resume per user  
- No external upload — builder only  

## Employer

- One free job post  
- Paid contact access  

See [docs/adr/0002-prisma.md](../docs/adr/0002-prisma.md).
