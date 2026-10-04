# Roadmap: SkillSwap

## Overview
SkillSwap builds an end-to-end, money-free community skill-exchange platform where members exchange capabilities using time credits (1 hour = 1 credit). This roadmap follows a fine-grained Vertical MVP strategy delivering complete capabilities across 11 phases: from foundational Spring Boot 3 + React 19 architecture, secure JWT authentication with initial 5-credit wallet provisioning, profile and skill catalog management, multi-criteria discovery and AI matching, through the full exchange lifecycle (requesting, booking, dual completion confirmation, atomic transactional credit ledger settlement), reputation building, and a unified 9-page responsive dashboard.

## Phases

- [x] **Phase 1: Project Scaffolding & Foundation Architecture** - Initialize Spring Boot 3 modular monolith, React 19/Vite frontend, Tailwind CSS, and PostgreSQL schema baseline.
- [x] **Phase 2: Authentication, Security & Initial Wallet Grant** - Implement JWT auth, user registration with automatic 5 time-credits allocation, login, session persistence, and logout.
- [x] **Phase 3: Member Profiles & Skill Catalog Management** - Build user profile management, categorized skills catalog, and offered/wanted skills tracking.
- [x] **Phase 4: Skill Discovery & Search Experience** - Implement multi-filter search (category, location, rating) and provider cards on the Explore Skills page.
- [x] **Phase 5: Matching & Recommendation Engine** - Build weighted compatibility scoring (`0.4*Skill + 0.2*Location + 0.15*Availability + 0.15*Rating + 0.1*Experience`) with AI semantic matching for complementary needs.
- [x] **Phase 6: Exchange Request Lifecycle** - Implement request creation, balance checks, provider accept/reject actions, and request cancellation.
- [ ] **Phase 7: Booking & Service Scheduling** - Implement scheduling workflow for date, time, and duration coordination with calendar views.
- [ ] **Phase 8: Service Completion & Dual Confirmation Workflow** - Implement two-party completion verification, dispute initiation, and state transitions to COMPLETED.
- [ ] **Phase 9: Atomic Time-Credit Ledger & Wallet Settlement** - Implement ACID server-side credit transfer (1 hr = 1 credit), immutable audit transactions, and wallet history.
- [ ] **Phase 10: Trust & Reputation (Reviews & Ratings)** - Implement verified post-exchange review and rating submissions with aggregate reputation updates.
- [ ] **Phase 11: In-App Notifications, Dashboard & End-to-End Polish** - Wire in-app notifications, finalize unified Member Dashboard, and ensure responsive polish across all 9 pages.

## Phase Details

### Phase 1: Project Scaffolding & Foundation Architecture
**Goal**: Establish a functioning full-stack modular monolith skeleton with Spring Boot 3 backend, PostgreSQL schema, and React 19 + Vite + Tailwind CSS frontend.
**Depends on**: Nothing (first phase)
**Requirements**: Foundational infrastructure
**UI hint**: yes
**Success Criteria**:
  1. Spring Boot backend starts cleanly, connects to PostgreSQL, and exposes health check `/api/v1/health`.
  2. React 19 + Vite frontend builds and renders landing page shell with responsive Tailwind styling.
  3. Database migrations or JPA entities establish core tables for users, wallets, and skills.
**Plans**: 2 plans

Plans:
- [x] 01-01: Initialize Spring Boot 3 backend with PostgreSQL datasource, modular packages, and base config.
- [x] 01-02: Initialize React 19 + Vite + Tailwind CSS frontend with routing structure and responsive Navbar/Footer.

### Phase 2: Authentication, Security & Initial Wallet Grant
**Goal**: Enable secure member registration with automatic 5-credit wallet provisioning, JWT authentication, and session persistence.
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, WALL-01
**UI hint**: yes
**Success Criteria**:
  1. User can register with name, email, password, and location, automatically receiving a 5-credit balance in their wallet.
  2. User can log in with valid credentials, receive a signed JWT, and access protected endpoints.
  3. User session persists across browser refresh and user can log out to clear session.
**Plans**: 2 plans

Plans:
- [x] 02-01: Backend Spring Security, JWT token generation/validation, password hashing, and user registration with initial wallet grant.
- [x] 02-02: Frontend Login, Register, AuthContext, ProtectedRoute, and auth token storage.

### Phase 3: Member Profiles & Skill Catalog Management
**Goal**: Allow members to manage their profiles, browse standard skill categories, and specify skills offered and wanted.
**Depends on**: Phase 2
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05
**UI hint**: yes
**Success Criteria**:
  1. User can update bio, location, contact, and profile avatar.
  2. Predefined skill catalog (Technology, Languages, Academics, Trades, Arts, Wellness) is populated and queryable.
  3. User can add/remove offered skills with experience level and wanted skills.
  4. Public profile page renders member details, skills, and ratings.
**Plans**: 2 plans

Plans:
- [x] 03-01: Backend entities, repositories, and REST APIs for user profile updates, skill catalog seeding, and user_skills CRUD.
- [x] 03-02: Frontend Onboarding page, Profile Edit page, and Public Member Profile component.

### Phase 4: Skill Discovery & Search Experience
**Goal**: Provide a responsive Explore Skills page where members can search and filter providers by category, location, and rating.
**Depends on**: Phase 3
**Requirements**: DISC-01, DISC-02, DISC-03
**UI hint**: yes
**Success Criteria**:
  1. User can search members by keyword matching skills offered.
  2. Filters by skill category, city/location, and star rating accurately narrow results.
  3. Provider cards display skills, badges, location, rating, and direct "Request Exchange" CTA.
**Plans**: 2 plans

Plans:
- [x] 04-01: Backend search & discovery specification queries with multi-criteria filtering.
- [x] 04-02: Frontend Explore Skills page with search bar, filter sidebar, responsive provider cards, and pagination.

### Phase 5: Matching & Recommendation Engine
**Goal**: Deliver intelligent complementary skill recommendations using weighted scoring and AI semantic matching.
**Depends on**: Phase 4
**Requirements**: MATCH-01, MATCH-02, MATCH-03
**UI hint**: yes
**Success Criteria**:
  1. System calculates match scores based on `0.4*Skill + 0.2*Location + 0.15*Availability + 0.15*Rating + 0.1*Experience`.
  2. User receives personalized recommendations on their dashboard based on skills they want vs skills others offer.
  3. Semantic matching bridges synonyms and complementary domains (e.g. "Math" ↔ "Calculus").
**Plans**: 2 plans

Plans:
- [x] 05-01: Backend recommendation service implementing mathematical scoring algorithm and semantic pairing logic.
- [x] 05-02: Frontend recommendation section on Dashboard and match quality badge indicators.

### Phase 6: Exchange Request Lifecycle
**Goal**: Allow members to send, accept, reject, and cancel service exchange requests with server-enforced validation.
**Depends on**: Phase 5
**Requirements**: EXCH-01, EXCH-02, EXCH-03, EXCH-04, EXCH-05
**UI hint**: yes
**Success Criteria**:
  1. Requester can send a service request specifying skill, proposed duration, and notes.
  2. Backend validates that requester has sufficient balance and is not requesting their own service.
  3. Provider can accept or reject requests; requester can cancel pending requests.
  4. Exchange management UI clearly segments incoming and outgoing requests with status badges.
**Plans**: 2 plans

Plans:
- [x] 06-01: Backend exchange request entity, state transition validation, and REST controller endpoints.
- [x] 06-02: Frontend Exchange Management page with incoming/outgoing request lists, modals, and actions.

### Phase 7: Booking & Service Scheduling
**Goal**: Enable participants of accepted exchanges to agree upon and schedule a date, start time, and duration.
**Depends on**: Phase 6
**Requirements**: BOOK-01, BOOK-02, BOOK-03
**UI hint**: yes
**Success Criteria**:
  1. Requester or provider can submit booking details (date, time, duration) for an accepted exchange.
  2. Booking status transitions to SCHEDULED once accepted by both parties.
  3. Upcoming bookings appear on user dashboard and exchange detail views with rescheduling option.
**Plans**: 2 plans

Plans:
- [x] 07-01: Backend booking model, scheduling endpoints, conflict checks, and reschedule handler.
- [x] 07-02: Frontend booking modal/form and upcoming bookings widget with countdown/calendar badges.

### Phase 8: Service Completion & Dual Confirmation Workflow
**Goal**: Provide a tamper-proof dual-confirmation workflow to verify service delivery before initiating settlement.
**Depends on**: Phase 7
**Requirements**: CMPL-01, CMPL-02, CMPL-03
**UI hint**: yes
**Success Criteria**:
  1. Provider can click "Mark Service Completed"; requester is prompted to verify.
  2. Once both parties confirm, exchange status automatically updates to `COMPLETED`.
  3. Either party can flag an exchange as `DISPUTED` if delivery was unsatisfactory.
**Plans**: 1 plan

Plans:
- [ ] 08-01: Dual-confirmation completion state machine, dispute handling endpoints, and frontend verification prompts.

### Phase 9: Atomic Time-Credit Ledger & Wallet Settlement
**Goal**: Execute atomic, server-enforced credit transfers upon completed exchanges and record immutable transaction ledger entries.
**Depends on**: Phase 8
**Requirements**: WALL-02, WALL-03, WALL-04, WALL-05
**UI hint**: yes
**Success Criteria**:
  1. When exchange completes, backend atomically transfers agreed duration credits (1 hr = 1 credit) from receiver to provider.
  2. Ledger records immutable `credit_transactions` row with sender, receiver, exchange ID, amount, and timestamp.
  3. Duplicate settlement is strictly prevented via transactional locking and settlement status flags.
  4. User Wallet page displays live balance, total earned, total spent, and audit history.
**Plans**: 2 plans

Plans:
- [ ] 09-01: Backend transactional settlement service with `@Transactional` ACID transfer, ledger audit records, and idempotency guards.
- [ ] 09-02: Frontend Time-Credit Wallet page with balance cards, earnings/spending stats, and filterable ledger table.

### Phase 10: Trust & Reputation (Reviews & Ratings)
**Goal**: Enable verified members to leave ratings (1–5 stars) and reviews following completed exchanges to build community trust.
**Depends on**: Phase 9
**Requirements**: REV-01, REV-02, REV-03
**UI hint**: yes
**Success Criteria**:
  1. Only participants of a completed exchange can submit a review (maximum 1 review per participant per exchange).
  2. Review submission updates the reviewee's average rating and total review count.
  3. User profile and provider cards display updated star rating averages and review commentary.
**Plans**: 2 plans

Plans:
- [ ] 10-01: Backend review entity, review eligibility validation, rating recalculation, and review endpoints.
- [ ] 10-02: Frontend review submission modal, star rating selector, and profile reviews component.

### Phase 11: In-App Notifications, Dashboard & End-to-End Polish
**Goal**: Unify the entire experience with in-app event notifications, full Member Dashboard integration, and 9-page responsive UI verification.
**Depends on**: Phase 10
**Requirements**: NOTF-01, NOTF-02, DASH-01, DASH-02
**UI hint**: yes
**Success Criteria**:
  1. In-app notifications alert users about request receipt, acceptance, scheduling, and credit transfers.
  2. Member Dashboard renders real-time credit balance, quick stats, active requests, bookings, and recommendations.
  3. Complete end-to-end user journey works smoothly across all 9 pages without mock hardcoded data.
**Plans**: 2 plans

Plans:
- [ ] 11-01: Backend notification system, event listeners for exchange lifecycle transitions, and notification endpoints.
- [ ] 11-02: Frontend notification bell dropdown, comprehensive Dashboard assembly, responsive audit, and demo data seed verification.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 6 ➔ 7 ➔ 8 ➔ 9 ➔ 10 ➔ 11

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffolding & Foundation Architecture | 2/2 | Complete | 2026-10-04 |
| 2. Authentication, Security & Initial Wallet Grant | 2/2 | Complete | 2026-10-04 |
| 3. Member Profiles & Skill Catalog Management | 2/2 | Complete | 2026-10-04 |
| 4. Skill Discovery & Search Experience | 2/2 | Complete | 2026-10-04 |
| 5. Matching & Recommendation Engine | 2/2 | Complete | 2026-10-04 |
| 6. Exchange Request Lifecycle | 2/2 | Complete | 2026-10-04 |
| 7. Booking & Service Scheduling | 2/2 | Complete | 2026-10-04 |
| 8. Service Completion & Dual Confirmation Workflow | 0/1 | Not started | - |
| 9. Atomic Time-Credit Ledger & Wallet Settlement | 0/2 | Not started | - |
| 10. Trust & Reputation (Reviews & Ratings) | 0/2 | Not started | - |
| 11. In-App Notifications, Dashboard & End-to-End Polish | 0/2 | Not started | - |
