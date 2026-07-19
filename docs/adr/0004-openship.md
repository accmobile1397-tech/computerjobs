# ADR-0004: OpenShip Self-Hosted VPS Deployment

**Status:** Accepted  
**Date:** 2026-07-19  
**Deciders:** CTO, DevOps  

## Context

Initial plan considered hybrid Vercel + VPS. Product owner purchased VPS with OpenShip installed.

## Decision

Deploy **entire stack** on single VPS via **OpenShip**:

- Next.js app container  
- MySQL, Redis, MinIO via Docker Compose  
- BullMQ worker as separate service  
- SSL via OpenShip (Let's Encrypt)  

No Vercel production deployment.

## Consequences

- **Positive:** Single network, lower latency, no cross-cloud secrets  
- **Negative:** Owner maintains VPS/OS  
- **Future:** Kubernetes possible — no hard-coded OpenShip-only assumptions in app code  

See `docs/DEPLOYMENT.md` and `.cto/DEPLOYMENT_RULES.md`.
