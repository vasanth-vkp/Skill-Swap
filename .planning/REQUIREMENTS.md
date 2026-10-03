# Requirements: SkillSwap

**Defined:** 2026-10-04
**Core Value:** One complete skill exchange works reliably from discovery, request, and scheduling to two-party service completion and atomic time-credit ledger settlement.
**Structure Mode:** Vertical MVP

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Authorization

- [ ] **AUTH-01**: User can register an account with name, email, password, and location
- [ ] **AUTH-02**: User receives an initial platform grant of 5 time credits upon registration
- [ ] **AUTH-03**: User can log in with email and password and receive a JWT authentication token
- [ ] **AUTH-04**: User session persists across page reloads and browser refresh
- [ ] **AUTH-05**: User can log out and invalidate their active session

### User Profiles & Skill Catalog

- [ ] **PROF-01**: User can view and edit their profile (bio, location, contact, avatar URL)
- [ ] **PROF-02**: System provides a categorized catalog of skills (Technology, Languages, Academics, Trades, Arts, Wellness)
- [ ] **PROF-03**: User can add and remove skills they offer, specifying proficiency / experience level
- [ ] **PROF-04**: User can add and remove skills they want to learn or receive
- [ ] **PROF-05**: User can view public profile of any member showing offered/wanted skills, bio, and reviews

### Skill Discovery & Search

- [ ] **DISC-01**: User can search available skills by keyword and title
- [ ] **DISC-02**: User can filter providers by skill category, location, and minimum rating
- [ ] **DISC-03**: User can browse member cards on the Explore Skills page with clear skill tags and badges

### Matching & Recommendations

- [ ] **MATCH-01**: System calculates compatibility scores between complementary member needs (`0.4*Skill + 0.2*Location + 0.15*Availability + 0.15*Rating + 0.1*Experience`)
- [ ] **MATCH-02**: User can view personalized recommendations on their dashboard
- [ ] **MATCH-03**: System supports AI-assisted semantic matching for skill synonyms and complementary pairings

### Exchange Request Lifecycle

- [ ] **EXCH-01**: User can create an exchange request to a provider specifying skill, proposed duration in hours, and details
- [ ] **EXCH-02**: System prevents self-requests and enforces sufficient credit balance before sending
- [ ] **EXCH-03**: Provider can accept or reject an incoming exchange request
- [ ] **EXCH-04**: Requester can cancel a pending exchange request
- [ ] **EXCH-05**: User can view and filter incoming and outgoing exchange requests on the Exchanges page

### Booking & Scheduling

- [ ] **BOOK-01**: Requester and provider can schedule a date, start time, and end time for accepted exchanges
- [ ] **BOOK-02**: System tracks upcoming bookings and displays them on user dashboard and exchange management
- [ ] **BOOK-03**: Users can reschedule or cancel an existing booking prior to service commencement

### Service Completion & Dual Confirmation

- [ ] **CMPL-01**: Requester and provider can both independently confirm service completion
- [ ] **CMPL-02**: System transitions exchange state to `COMPLETED` when dual confirmation is received
- [ ] **CMPL-03**: Participants can report an exchange as disputed if service was not delivered

### Time-Credit Wallet & Transaction Ledger

- [ ] **WALL-01**: System maintains a secure wallet for each member with current credit balance
- [ ] **WALL-02**: System automatically executes an atomic transaction transferring credits (1 hour = 1 credit) from receiver to provider upon completion
- [ ] **WALL-03**: System records every credit movement in an immutable audit ledger (`credit_transactions`)
- [ ] **WALL-04**: System prevents duplicate settlement and strictly enforces non-negative credit balances
- [ ] **WALL-05**: User can view their current balance, total credits earned, total credits spent, and complete transaction history

### Trust & Reputation

- [ ] **REV-01**: User can submit a star rating (1–5) and written feedback for a completed exchange
- [ ] **REV-02**: System restricts reviews so only participants of a completed exchange can submit (max 1 review per participant per exchange)
- [ ] **REV-03**: System computes and updates aggregate member ratings displayed on profile cards and pages

### In-App Notifications

- [ ] **NOTF-01**: System generates in-app notifications for request events (received, accepted, scheduled, completed, credits transferred)
- [ ] **NOTF-02**: User can view notifications and mark them as read

### Dashboard & Page Experience

- [ ] **DASH-01**: Dashboard aggregates credit balance, active requests, upcoming bookings, and recommendations
- [ ] **DASH-02**: Complete responsive frontend across 9 main pages (Landing, Login, Register, Onboarding, Dashboard, Explore Skills, User Profile, Exchanges, Wallet) with clear empty and loading states

## v2 Requirements

Deferred to future releases.

### Advanced Community & Intelligence

- **V2-01**: Google Calendar two-way sync for scheduling
- **V2-02**: AI skill-description auto-generator for user profile onboarding
- **V2-03**: Admin analytics dashboard with platform exchange volume and user growth metrics
- **V2-04**: Admin content moderation queue for reported users and disputed exchanges
- **V2-05**: Community interest groups and localized skill circles
- **V2-06**: Gamification badges (e.g., "Master Tutor", "Community Pillar")
- **V2-07**: Multilingual interface support for regional languages

## Out of Scope

| Feature | Reason |
|---------|--------|
| Blockchain tokens / Smart contracts | A relational PostgreSQL transactional ledger provides strict ACID compliance, zero gas fees, and immediate settlement. |
| Microservices architecture | Single modular monolith eliminates network hops, distributed transaction complexity, and multi-service deployment hurdles. |
| Native mobile apps (iOS/Android) | Responsive React + Tailwind web application offers full mobile parity with a single unified codebase. |
| Fiat / Real-money payments | The core value proposition is an equitable, money-free time bank (1 hour = 1 credit). |
| Real-time video conferencing (WebRTC) | Service delivery can occur in person or via external meeting links; MVP does not require integrated video streaming. |
| Advanced social networking feeds | Social feeds, followers, and public posts are peripheral to the core skill exchange transaction. |
| Complex GIS / geospatial mapping | City and neighborhood text filters adequately solve local discovery for MVP. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| PROF-01 | Phase 2 | Pending |
| PROF-02 | Phase 2 | Pending |
| PROF-03 | Phase 2 | Pending |
| PROF-04 | Phase 2 | Pending |
| PROF-05 | Phase 2 | Pending |
| DISC-01 | Phase 3 | Pending |
| DISC-02 | Phase 3 | Pending |
| DISC-03 | Phase 3 | Pending |
| MATCH-01 | Phase 4 | Pending |
| MATCH-02 | Phase 4 | Pending |
| MATCH-03 | Phase 4 | Pending |
| EXCH-01 | Phase 5 | Pending |
| EXCH-02 | Phase 5 | Pending |
| EXCH-03 | Phase 5 | Pending |
| EXCH-04 | Phase 5 | Pending |
| EXCH-05 | Phase 5 | Pending |
| BOOK-01 | Phase 6 | Pending |
| BOOK-02 | Phase 6 | Pending |
| BOOK-03 | Phase 6 | Pending |
| CMPL-01 | Phase 7 | Pending |
| CMPL-02 | Phase 7 | Pending |
| CMPL-03 | Phase 7 | Pending |
| WALL-01 | Phase 8 | Pending |
| WALL-02 | Phase 8 | Pending |
| WALL-03 | Phase 8 | Pending |
| WALL-04 | Phase 8 | Pending |
| WALL-05 | Phase 8 | Pending |
| REV-01 | Phase 9 | Pending |
| REV-02 | Phase 9 | Pending |
| REV-03 | Phase 9 | Pending |
| NOTF-01 | Phase 10 | Pending |
| NOTF-02 | Phase 10 | Pending |
| DASH-01 | Phase 11 | Pending |
| DASH-02 | Phase 11 | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-04*
*Last updated: 2026-10-04 after initial definition*
