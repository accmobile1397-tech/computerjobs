# CTO Handoff — روش رسمی تحویل فاز

**Effective:** 2026-07-19 (D-024)  
**Workflow:** commit مستقیم روی `main` + لینک commit به CTO

---

## خلاصه

| نقش | کار |
|-----|-----|
| **Agent** | پیاده‌سازی روی `main` + `CTO_REPORT.md` + push |
| **شما** | **فقط لینک commit** به CTO |
| **CTO** | review commit → APPROVE / CONDITIONS / REJECT |

---

## Git

```text
main  → تنها branch کاری — همهٔ فازها اینجا commit می‌شوند
```

بدون `develop`، بدون feature branch، بدون PR.

---

## چرخه هر فاز

### ۱. Spec → CTO تأیید spec

### ۲. Implementation

```powershell
git checkout main
git pull origin main
# Agent: کد + tests + CTO_REPORT.md
git push origin main
```

### ۳. Handoff به CTO

```text
Phase N — review:
https://github.com/accmobile1397-tech/computerjobs/commit/{hash}
```

### ۴. بعد از APPROVE

فاز بعد — باز هم روی `main`.

---

## Phase 1 — Handoff فعلی

| Item | Value |
|------|-------|
| Branch | `main` |
| Latest commit | `66e08b9` — https://github.com/accmobile1397-tech/computerjobs/commit/66e08b9 |
| IAM implementation | `769b6de` — https://github.com/accmobile1397-tech/computerjobs/commit/769b6de |
| CTO Report | [docs/phase-1/CTO_REPORT.md](../phase-1/CTO_REPORT.md) |
