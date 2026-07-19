# CTO Handoff — روش رسمی تحویل فاز

**Effective:** 2026-07-19 (D-022, D-023)  
**Workflow:** commit روی `develop` + لینک commit به CTO (بدون PR، بدون feature branch)

---

## خلاصه

| نقش | کار |
|-----|-----|
| **Agent** | پیاده‌سازی روی `develop` + `CTO_REPORT.md` + push |
| **شما** | **فقط لینک commit** (+ در صورت نیاز `CTO_REPORT.md`) به CTO |
| **CTO** | review commit → APPROVE / CONDITIONS / REJECT |

---

## Git

```text
main     → production (بعد از تأیید CTO)
develop  → integration — همهٔ کار فازها اینجا
```

**feature branch نمی‌سازیم** — مثل Phase 0.

---

## چرخه هر فاز

### ۱. Spec → CTO تأیید spec

### ۲. Implementation

```powershell
git checkout develop
git pull origin develop
# Agent: کد + tests + CTO_REPORT.md
git push origin develop
```

### ۳. Handoff به CTO

**فقط لینک commit:**

```text
Phase N — review:
https://github.com/accmobile1397-tech/computerjobs/commit/{hash}
گزارش (اختیاری): docs/phase-N/CTO_REPORT.md
```

### ۴. بعد از APPROVE

```powershell
git checkout main
git pull origin main
git merge develop
git push origin main
```

(یا merge به `main` وقتی CTO برای production آماده اعلام کند.)

---

## Phase 1 — Handoff فعلی

| Item | Value |
|------|-------|
| Branch | `develop` |
| Latest commit | [`392310c`](https://github.com/accmobile1397-tech/computerjobs/commit/392310c) |
| IAM implementation | [`769b6de`](https://github.com/accmobile1397-tech/computerjobs/commit/769b6de) |
| CTO Report | [docs/phase-1/CTO_REPORT.md](../phase-1/CTO_REPORT.md) |
