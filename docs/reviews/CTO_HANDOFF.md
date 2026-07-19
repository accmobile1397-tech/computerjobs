# CTO Handoff — روش رسمی تحویل فاز

**Effective:** 2026-07-19 (D-022)  
**Replaces:** PR-as-primary handoff (PR remains optional)

---

## خلاصه

| نقش | کار |
|-----|-----|
| **Agent** | پیاده‌سازی روی `feature/*` + `CTO_REPORT.md` + push |
| **شما (Product Owner)** | یک پیام کوتاه + لینک `CTO_REPORT.md` به CTO |
| **CTO** | خواندن `CTO_REPORT.md` + specها → APPROVE / CONDITIONS / REJECT |

**PR لازم نیست.** Compare link فقط برای دیدن diff اختیاری است.

---

## Git (بدون تغییر)

```text
main          → production
develop       → integration (بعد از تأیید CTO merge می‌شود)
feature/*     → کار هر فاز (مثلاً feature/auth)
```

---

## چرخه هر فاز

### ۱. Spec (قبل از کد)

- Agent: `docs/phase-N/*` spec
- CTO: تأیید TECHNICAL_SPEC + DATABASE + API
- **Gate:** بدون تأیید spec، کد نزنید

### ۲. Implementation

- Branch: `feature/{name}` از `develop`
- Agent: کد + tests + migration + `CTO_REPORT.md`
- Push به GitHub

### ۳. Handoff به CTO (روش رسمی)

به CTO بدهید:

1. **`docs/phase-N/CTO_REPORT.md`** — فایل اصلی
2. **`docs/reviews/PHASE_REVIEW_INDEX.md`** — فهرست artifactها
3. **Commit hash** — در header گزارش CTO

**پیام نمونه (copy-paste):**

```text
Phase N آماده review است.
گزارش CTO: docs/phase-N/CTO_REPORT.md
Commit: {hash}
Branch: feature/{name}
Compare (اختیاری): https://github.com/accmobile1397-tech/computerjobs/compare/develop...feature/{name}
```

### ۴. تصمیم CTO

CTO در `CTO_REPORT.md` یکی را انتخاب می‌کند:

- APPROVE → merge به `develop`
- APPROVE WITH CONDITIONS → Agent شرط‌ها را برطرف → handoff دوباره
- REJECT → Agent اصلاح → handoff دوباره

### ۵. Merge (بعد از APPROVE)

```powershell
git checkout develop
git pull origin develop
git merge feature/{name}
git push origin develop
```

یا merge از GitHub UI — **بدون الزام ساخت PR**.

### ۶. فاز بعد

فقط بعد از merge + تأیید صریح CTO برای Phase بعدی.

---

## PR — کی لازم است؟

| سناریو | PR |
|--------|-----|
| CTO review معمولی | ❌ — `CTO_REPORT.md` کافی است |
| CTO می‌خواهد comment خط‌به‌خط در GitHub | ✅ اختیاری |
| CI روی branch | ✅ push به `feature/*` کافی است (CI خودکار) |

---

## Local dev — کی لازم است؟

| نقش | Docker / migrate / seed |
|-----|---------------------------|
| CTO review | ❌ |
| شما یا Agent تست دستی | ✅ |
| Deploy روی VPS | روی سرور |

---

## Checklist Agent (پایان فاز)

See [`.cto/REVIEW_CHECKLIST.md`](../../.cto/REVIEW_CHECKLIST.md)

---

## Phase 1 — Handoff فعلی

| Item | Value |
|------|-------|
| Branch | `feature/auth` |
| Implementation commit | `769b6de` |
| CTO Report | [docs/phase-1/CTO_REPORT.md](../phase-1/CTO_REPORT.md) |
| Index | [PHASE_REVIEW_INDEX.md](./PHASE_REVIEW_INDEX.md) |
| Compare (optional) | https://github.com/accmobile1397-tech/computerjobs/compare/develop...feature/auth |
