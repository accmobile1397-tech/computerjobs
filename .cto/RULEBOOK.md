# ComputerJobs CTO Rulebook v1.0

## Purpose

This document defines the mandatory engineering, architecture, security, SEO, AI, database, deployment, and development standards for ComputerJobs.ir.

All contributors, AI agents, Cursor sessions, automation tools, and future developers MUST follow these rules.

If any implementation conflicts with this Rulebook, the Rulebook takes precedence.

---

# Core Principles

Priority order:

1. Security
2. Data Integrity
3. Reliability
4. SEO
5. Maintainability
6. Performance
7. Developer Experience
8. Convenience

Never sacrifice higher-priority principles for lower-priority ones.

---

# Product Principles

ComputerJobs is:

* AI Native
* Persian First
* RTL First
* Mobile First
* SEO First
* Security First

Target audience:

* Technology professionals
* Employers
* Recruiters
* Technology companies

---

# Architecture Rules

## Feature First Architecture

Required structure:

```text
src/modules

auth
users
companies
jobs
resumes
taxonomy
location
search
payments
notifications
advertisements
ai
admin
shared
```

Do not organize code by technical layer only.

Avoid:

```text
controllers
services
helpers
utils
```

as large global folders.

---

## Module Isolation

Each module owns:

* API
* Business Logic
* Validation
* Database Access
* Types

Modules must not directly manipulate another module's internal implementation.

---

## No God Objects

Forbidden:

* God Service
* God Controller
* God Repository
* Mega Utility File

If a file becomes difficult to understand, split it.

---

# Domain Rules

Business logic must never live inside:

* UI Components
* Pages
* API Routes

Business logic belongs inside domain services.

---

# AI Rules

## AI Is Enhancement

AI must never be a critical dependency.

The platform must operate when all AI providers fail.

---

## AI Gateway Only

All AI access must go through:

```text
src/modules/ai
```

Direct provider calls are forbidden.

Forbidden:

```text
OpenAI SDK directly inside business modules
Gemini SDK directly inside pages
```

---

## AI Provider Independence

Supported:

* Gemini
* OpenRouter
* Groq
* Z.AI
* Ollama
* Future Providers

No vendor lock-in.

---

## Graceful Degradation

When AI fails:

Allowed to fail:

* AI Chat
* AI Matching
* AI Suggestions

Forbidden to fail:

* Login
* Registration
* Resume Builder
* Job Posting
* Payments
* Search

---

# Database Rules

## Primary Keys

Always use UUID.

Never use incremental IDs.

---

## Audit Fields

Every table must include:

```text
id
createdAt
updatedAt
deletedAt
```

---

## Soft Delete

Never permanently remove business records.

Use:

```text
deletedAt
```

---

## Naming

Tables:

```text
snake_case
```

Models:

```text
PascalCase
```

Fields:

```text
camelCase
```

---

## Migrations

Never edit existing migrations.

Always create new migrations.

---

## Seed Data

Required:

* Provinces
* Cities
* Categories
* Roles
* Permissions

---

# Location Rules

Hierarchy:

```text
Province
    City
```

Requirements:

* All 31 provinces
* All Iranian cities

Admin may:

* Add
* Edit
* Disable

---

# Taxonomy Rules

Hierarchy:

```text
Category
    SubCategory
        Skill
            Technology
```

Required.

---

## Category Governance

AI may suggest.

AI may not publish.

Workflow:

```text
AI Suggest
→ Review
→ Approve
→ Publish
```

---

## Versioning

Taxonomy changes must be traceable.

Store:

* Created By
* Approved By
* Change History

---

# Resume Rules

Users may create:

* One free resume

External resume upload:

Forbidden.

Platform Resume Builder only.

---

# Employer Rules

One free job post.

Viewing candidate contact information requires payment.

---

# Security Rules

## Validation

Never trust client input.

Validate everything server-side.

---

## Authentication

Use:

* JWT
* Refresh Tokens
* RBAC

---

## Passwords

Hash passwords.

Never store plain text.

Use modern password hashing.

---

## Secrets

Never commit:

```text
.env
private keys
tokens
credentials
```

Only commit:

```text
.env.example
```

---

## Authorization

Authentication is not authorization.

Check permissions on every protected action.

---

## Rate Limiting

Required for:

* Login
* Registration
* Password Reset
* Public APIs

---

## Security Headers

Required:

* CSP
* HSTS
* X-Frame-Options
* X-Content-Type-Options

---

# API Rules

## Versioning

All APIs must be versioned.

Example:

```text
/api/v1
```

---

## Validation

Every endpoint must validate:

* Body
* Params
* Query

---

## Error Responses

Use consistent format.

Never expose stack traces.

---

# SEO Rules

Every public page must contain:

* Title
* Description
* Canonical
* OpenGraph

---

## Structured Data

Required:

* JobPosting
* Organization
* Breadcrumb

---

## URLs

Use readable URLs.

Example:

```text
/companies/google
/jobs/tehran
/jobs/frontend
```

Avoid IDs in URLs where possible.

---

## Performance

Core Web Vitals are mandatory.

---

# UI Rules

Persian First.

RTL by default.

Mobile First.

Accessibility required.

---

## Fonts

Use Vazirmatn.

---

## Components

Use reusable components.

Avoid duplication.

---

# Search Rules

Search must function without AI.

AI may improve ranking.

AI may not replace search.

---

# Queue Rules

Background jobs must use BullMQ.

Never execute heavy tasks in request-response cycle.

Examples:

* Emails
* SMS
* AI Processing
* Analytics

---

# Notification Rules

Supported channels:

* Email
* SMS
* In-App

Must be configurable.

---

# Logging Rules

Log:

* Errors
* Security Events
* Payment Events
* AI Events

Never log:

* Passwords
* Tokens
* Sensitive Personal Data

---

# Monitoring Rules

Required:

* Health Checks
* Queue Monitoring
* Database Monitoring
* Redis Monitoring

---

# Git Rules

Use:

```text
main
develop
feature/*
```

---

## Commits

Use Conventional Commits.

Examples:

```text
feat:
fix:
docs:
refactor:
test:
```

---

# Documentation Rules

Every phase must generate:

```text
TECHNICAL_SPEC.md
ARCHITECTURE.md
DATABASE_DESIGN.md
API_DESIGN.md
SECURITY_REVIEW.md
SEO_REVIEW.md
PHASE_SUMMARY.md
```

---

# Testing Rules

Critical business logic must be testable.

Avoid tightly coupled code.

---

# Deployment Rules

Application must run via Docker.

Health endpoints required.

---

# OpenShip Rules

Deployment target:

* OpenShip
* Docker VPS

Future:

* Kubernetes

Do not hard-code deployment assumptions.

---

# Review Rules

Before completing a phase:

Generate:

```text
CTO_REPORT.md
```

Include:

* Architecture Review
* Security Review
* Database Review
* SEO Review
* Risks
* Technical Debt
* Recommendations

---

# Final Rule

Quality over speed.

Architecture over shortcuts.

Security over convenience.

Maintainability over hacks.

If unsure:

Choose the option that will still be correct three years from now.

Before starting any task:

1. Read `/.cto/RULEBOOK.md`
2. Follow all rules
3. Explain any conflict
4. Generate `CTO_REPORT.md` before completion
