# CTO Handoff — روش رسمی تحویل فاز

**Workflow:** commit on `main` → CTO review via commit link

---

## چرخه (از Phase 2 به بعد)

```text
Phase X TECHNICAL_SPEC
        ↓
CTO Review → APPROVE
        ↓
Implementation (incremental on main)
        ↓
CTO_REPORT (≤300 lines) → Tag
```

Extra docs (Guardian, Index, TEST_COVERAGE, DATABASE/API designs) **only if CTO requests**. See `.cto/TOKEN_OPTIMIZATION.md`.

---

## Implementation commits (پیشنهاد CTO)

هر commit یک هدف مشخص:

1. Database + migration  
2. Company CRUD  
3. User profiles  
4. Company members + invites  
5. Admin + public endpoints  
6. Tests + phase docs  

---

## Phase Status

| Phase | Status |
|-------|--------|
| 0 | 🟢 Closed |
| 1 | 🟢 Closed — `v0.2-phase-1` |
| 2 | 🟢 Closed — `v0.3-phase-2` |
| 3 | 🟢 Closed — `v0.4-phase-3` |
| 4 | 🟢 Closed — `v0.5-phase-4` |
| 5 | ⏳ Spec review — **no implementation** |

---

## Handoff template

```text
Phase N implementation — review:
https://github.com/accmobile1397-tech/computerjobs/commit/{hash}
گزارش: docs/phase-N/CTO_REPORT.md
```
