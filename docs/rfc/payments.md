# RFC: Payments

**Status:** Draft  
**Phase:** 9  
**Author:** Product / CTO  

> Alias: see also legacy filename `payment.md` (same scope).

## Summary

Monetization: subscriptions + usage-based limits.

## Plans

Free, Basic, Professional, Gold, Platinum

## Track Usage

- Job posts  
- Resume views  
- Applications  
- AI tokens  

## Employer Rules

- One free job post  
- Paid contact access  
- Paid premium visibility  

## Requirements

- Payment provider abstraction (no lock-in)  
- Audit log for payment events — see `docs/SECURITY_DECISIONS.md`  
- Must not block free tier core flows  

## Open Questions

- [ ] Iranian payment gateway selection  
- [ ] Currency (IRR vs USDT)  
