<!-- GSD:project-start source:PROJECT.md -->

## Project

**SkillSwap**

SkillSwap is a full-stack web application where community members exchange skills using time credits instead of money. Users offer what they know, request what they need, get matched through an intelligent compatibility engine, complete structured service bookings, and build community reputation through reviews.

**Core Value:** One complete skill exchange works reliably from discovery, request, and scheduling to two-party service completion and atomic time-credit ledger settlement.

### Constraints

- **Tech Stack**: Spring Boot 3.x (Java 17/21), React 19 + Vite, Tailwind CSS, PostgreSQL, Spring Data JPA, Spring Security with JWT.
- **Economic Invariant**: 1 hour of service = 1 time credit regardless of skill type or user seniority.
- **Ledger Integrity**: Balances and transfers must be executed strictly server-side within database transactions; users cannot directly edit balances.
- **Dual User Persona**: Every user account can act as both requester and provider without switching roles.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
