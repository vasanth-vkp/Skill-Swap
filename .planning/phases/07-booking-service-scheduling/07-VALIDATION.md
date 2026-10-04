---
phase: "7"
slug: "booking-service-scheduling"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-04"
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend Framework** | JUnit 5 + MockMvc + Mockito (Spring Boot 3 Test) |
| **Frontend Framework** | Vitest + React Testing Library |
| **Config files** | `backend/pom.xml`, `frontend/vite.config.js` |
| **Quick run command (Backend)** | `mvn -f backend/pom.xml test -Dtest=BookingServiceTest,BookingControllerTest` |
| **Quick run command (Frontend)** | `npm --prefix frontend test -- ScheduleBookingModal.test.jsx UpcomingBookingsWidget.test.jsx` |
| **Full suite command** | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run corresponding quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | BOOK-01 | T-07-04 | Booking entity, DTOs, and repository compile with constraints | compile | `mvn -f backend/pom.xml compile` | ❌ W0 | ⏳ pending |
| 07-01-02 | 01 | 1 | BOOK-01, BOOK-03 | T-07-01, T-07-02, T-07-03 | BookingService computes duration, checks conflicts, allows reschedule/cancel | unit | `mvn -f backend/pom.xml test -Dtest=BookingServiceTest` | ❌ W0 | ⏳ pending |
| 07-01-03 | 01 | 1 | BOOK-01, BOOK-02, BOOK-03 | T-07-01, T-07-02 | BookingController secures REST endpoints with JWT authorization and conflict handling | integration | `mvn -f backend/pom.xml test -Dtest=BookingControllerTest` | ❌ W0 | ⏳ pending |
| 07-02-01 | 02 | 2 | BOOK-01, BOOK-03 | T-07-05 | ScheduleBookingModal computes end time, submits bookings, handles conflicts | unit/component | `npm --prefix frontend test -- ScheduleBookingModal.test.jsx` | ❌ W0 | ⏳ pending |
| 07-02-02 | 02 | 2 | BOOK-02, BOOK-03 | T-07-06 | UpcomingBookingsWidget renders countdowns and triggers reschedule/cancel | component | `npm --prefix frontend test -- UpcomingBookingsWidget.test.jsx` | ❌ W0 | ⏳ pending |
| 07-02-03 | 02 | 2 | BOOK-02 | T-07-06 | Full frontend suite and production build succeed cleanly | e2e/build | `npm --prefix frontend test -- --run && npm --prefix frontend run build` | ✅ Yes | ⏳ pending |

---

## Wave 0 Requirements

- [ ] `backend/src/test/java/com/skillswap/platform/booking/BookingServiceTest.java` — unit tests for participant check, duration math, conflict detection, rescheduling, and cancellation
- [ ] `backend/src/test/java/com/skillswap/platform/booking/BookingControllerTest.java` — MockMvc tests for authenticated booking endpoints and conflict handling
- [ ] `frontend/src/components/booking/__tests__/ScheduleBookingModal.test.jsx` — tests for scheduling/rescheduling modal and calculated end time
- [ ] `frontend/src/components/dashboard/__tests__/UpcomingBookingsWidget.test.jsx` — tests for upcoming sessions list and countdowns

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Calendar Experience & Local Time Display | BOOK-01, BOOK-02 | Visual check of datetime picker in browser and formatted local timezone display | Open accepted exchange, click "Schedule Session", pick date/time, verify card updates and dashboard widget appears with countdown |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-04
