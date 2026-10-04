# SkillSwap

## What This Is
SkillSwap is a full-stack web application where community members exchange skills using time credits instead of money. Users offer what they know, request what they need, get matched through an intelligent compatibility engine, complete structured service bookings, and build community reputation through reviews.

## Core Value
One complete skill exchange works reliably from discovery, request, and scheduling to two-party service completion and atomic time-credit ledger settlement.

## Business Context
- **Customer**: Students, working professionals, freelancers, homemakers, and community members seeking accessible, money-free skill sharing.
- **Revenue model**: Non-monetary time-banking economy; initial 5-credit platform grant upon registration.
- **Success metric**: 100% end-to-end reliable exchange completion rate with atomic credit balance updates and audit trail integrity.
- **Strategy notes**: Approved specification in [SKILLSWAP_SPEC.md](file:///d:/JK%20web/SKILLSWAP_SPEC.md).

## Requirements

### Validated in v1.0 (2026-10-04)
- [x] **User Authentication**: Registration with 5 free credits, login, logout, and token-based session management using JWT.
- [x] **Member Profiles**: Profile details (name, bio, location, avatar), offered skills with 3-tier experience, and wanted skills.
- [x] **Skill Catalog & Management**: 36 standard categorized skills and custom skills added dynamically.
- [x] **Skill Discovery & Search**: Multi-attribute search and filtering by category, location, and rating across responsive provider cards.
- [x] **Matching Engine**: Weighted compatibility scoring (`0.4*Skill + 0.2*Location + 0.15*Availability + 0.15*Rating + 0.1*Experience`) with domain semantic matching and reciprocal trade boost.
- [x] **Exchange Lifecycle**: State machine transitions (`PENDING` -> `ACCEPTED` -> `SCHEDULED` -> `IN_PROGRESS` -> `COMPLETED`, plus terminal `REJECTED`, `CANCELLED`, `DISPUTED`).
- [x] **Service Scheduling**: Date, time, and duration booking agreement between requester and provider with collision prevention.
- [x] **Dual Completion & Dispute Workflow**: Independent dual confirmation flags and dispute reporting.
- [x] **Atomic Time-Credit Ledger**: Server-side credit transfer upon dual completion confirmation (1 hour = 1 credit), immutable audit trail, non-negative balance enforcement, and initial 5-credit grant.
- [x] **Trust & Reputation**: 1–5 star ratings and reviews strictly restricted to verified completed exchanges with atomic rating recalculation.
- [x] **In-App Notifications & Dashboard**: Event notifications, header NotificationBell dropdown with live unread badge, and 9-page responsive dashboard.

### Active
(None currently active. Define new features during `/gsd-new-milestone`).

### Out of Scope
- Blockchain tokens / Smart contracts — PostgreSQL transactional ledger provides sufficient tamper-evident auditability and ACID guarantees without gas costs or latency.
- Microservices architecture — Modular monolith on Spring Boot is chosen for rapid hackathon delivery and simple transactional boundaries.
- Native mobile applications (iOS/Android) — Fully responsive React + Tailwind web SPA delivers desktop and mobile parity with lower maintenance.
- Real-money payment gateways — Distracts from and undermines the money-free community time-banking ethos.
- Real-time video conferencing / WebRTC — Offline or external coordination is sufficient for the MVP exchange verification.
- Advanced social feeds, following systems, or stories — Not essential to the core exchange lifecycle.
- Complex geospatial mapping — City and neighborhood text filters satisfy the discovery requirement for MVP.

## Context
- Greenfield full-stack development project initialized in `d:\JK web`.
- Designed for hackathon MVP delivery across 7 structured development phases.
- Single codebase structured as a modular monolith: Spring Boot 3 backend + React 19/Vite frontend + PostgreSQL database.

## Constraints
- **Tech Stack**: Spring Boot 3.x (Java 17/21), React 19 + Vite, Tailwind CSS, PostgreSQL, Spring Data JPA, Spring Security with JWT.
- **Economic Invariant**: 1 hour of service = 1 time credit regardless of skill type or user seniority.
- **Ledger Integrity**: Balances and transfers must be executed strictly server-side within database transactions; users cannot directly edit balances.
- **Dual User Persona**: Every user account can act as both requester and provider without switching roles.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Modular Monolith over Microservices | Eliminates network latency, deployment complexity, and distributed transactions during hackathon | ✅ Applied (Ph 1) |
| PostgreSQL Relational Ledger over Blockchain | Delivers strict ACID compliance, instant transfers, and zero cost while maintaining full auditability | ✅ Applied (Ph 1 & 9) |
| 1 Hour = 1 Credit Equality Principle | Keeps the system simple, fair, democratic, and eliminates pricing negotiations | ✅ Applied (Ph 2 & 9) |
| Rule-Based Matching + AI Extension | Guarantees deterministic, reliable recommendations even without external LLM availability or API keys | ✅ Applied (Ph 5) |
| Dual-Role Single User Model | Simplifies schema and UI since any community member can both teach and learn | ✅ Applied (Ph 2 & 3) |
| Balance Check Without Escrow (D-601) | Verifies liquidity at request creation without locking credits, executing atomic settlement upon completion | ✅ Applied (Ph 6) |
| Direct Booking Agreement (D-701) | Either participant of accepted exchange selects date/time, transitioning to SCHEDULED immediately with reschedule support | ✅ Applied (Ph 7) |
| Booking Cancel Restores Exchange (D-702) | Cancelling booking restores exchange to ACCEPTED so parties can reschedule rather than restarting request | ✅ Applied (Ph 7) |
| Server-Side Overlap Conflict Detection (D-704) | Rejects overlapping bookings for either participant to prevent double-booking conflicts | ✅ Applied (Ph 7) |
| Dual-Confirmation Completion (D-801) | Independent two-party verification triggers COMPLETED status and server-side settlement | ✅ Applied (Ph 8) |
| Atomic Transactional Settlement (D-901) | Transfer and audit ledger updates execute in single ACID transaction with idempotency guard | ✅ Applied (Ph 9) |
| Verified Participant Reviews (D-1001) | Reviews restricted to completed exchange participants with atomic average rating updates | ✅ Applied (Ph 10) |
| Real-Time Event Notifications (D-1101) | Automatic in-app notification triggers and bell dropdown with live unread badge | ✅ Applied (Ph 11) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? ➔ Move to Out of Scope with reason
2. Requirements validated? ➔ Move to Validated with phase reference
3. New requirements emerged? ➔ Add to Active
4. Decisions to log? ➔ Add to Key Decisions
5. "What This Is" still accurate? ➔ Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-04 — v1.0 Milestone Completed & Shipped*
