# CTO Handoff — روش رسمی تحویل فاز

**Workflow:** commit on `main` → CTO review via commit link

---

## چرخه (از Phase 2 به بعد)

```text
Phase X Spec (در همان commit/spec package)
        ↓
CTO Review → APPROVE (ثبت در spec/README — بدون commit جداگانه فقط برای approval)
        ↓
Implementation (commitهای کوچک incremental روی main)
        ↓
CTO_REPORT + Guardian + PHASE_REVIEW_INDEX + TEST_COVERAGE
        ↓
Tag Release
```

**قانون:** Approval در مستندات فاز ثبت می‌شود — **commit جداگانه فقط برای اعلام approval لازم نیست.**

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
| 3 | ⏳ Spec review — **no implementation** |

---

## Handoff template

```text
Phase N implementation — review:
https://github.com/accmobile1397-tech/computerjobs/commit/{hash}
گزارش: docs/phase-N/CTO_REPORT.md
```
