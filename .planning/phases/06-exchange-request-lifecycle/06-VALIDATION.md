---
phase: "6"
slug: "exchange-request-lifecycle"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-04"
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend Framework** | JUnit 5 + MockMvc + Mockito (Spring Boot 3 Test) |
| **Frontend Framework** | Vitest + React Testing Library |
| **Config files** | `backend/pom.xml`, `frontend/vite.config.js` |
| **Quick run command (Backend)** | `mvn -f backend/pom.xml test -Dtest=ExchangeServiceTest,ExchangeControllerTest` |
| **Quick run command (Frontend)** | `npm --prefix frontend test -- RequestExchangeModal.test.jsx ExchangeCard.test.jsx Exchanges.test.jsx` |
| **Full suite command** | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run` |
| **Estimated runtime** | ~28 seconds |

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
| 06-01-01 | 01 | 1 | EXCH-01 | T-06-03 | Exchange entity, DTOs, and repository compile with constraints | compile | `mvn -f backend/pom.xml compile` | ❌ W0 | ⏳ pending |
| 06-01-02 | 01 | 1 | EXCH-01, EXCH-02, EXCH-03, EXCH-04 | T-06-01, T-06-02, T-06-04 | ExchangeService verifies balance, prevents self-requests, and enforces state machine | unit | `mvn -f backend/pom.xml test -Dtest=ExchangeServiceTest` | ❌ W0 | ⏳ pending |
| 06-01-03 | 01 | 1 | EXCH-01, EXCH-03, EXCH-04, EXCH-05 | T-06-01, T-06-02 | ExchangeController secures REST endpoints with JWT authorization | integration | `mvn -f backend/pom.xml test -Dtest=ExchangeControllerTest` | ❌ W0 | ⏳ pending |
| 06-02-01 | 02 | 2 | EXCH-01, EXCH-02 | T-06-05 | RequestExchangeModal renders skill options, duration picker, and verifies balance | unit/component | `npm --prefix frontend test -- RequestExchangeModal.test.jsx` | ❌ W0 | ⏳ pending |
| 06-02-02 | 02 | 2 | EXCH-03, EXCH-04, EXCH-05 | T-06-01, T-06-06 | Exchanges page renders incoming/outgoing tabs, status filters, and triggers actions | component | `npm --prefix frontend test -- ExchangeCard.test.jsx Exchanges.test.jsx` | ❌ W0 | ⏳ pending |
| 06-02-03 | 02 | 2 | EXCH-05 | T-06-06 | Full frontend suite and production build succeed cleanly | e2e/build | `npm --prefix frontend test -- --run && npm --prefix frontend run build` | ✅ Yes | ⏳ pending |

---

## Wave 0 Requirements

- [ ] `backend/src/test/java/com/skillswap/platform/exchange/ExchangeServiceTest.java` — unit tests for balance check, self-request rejection, provider skill validation, and transitions
- [ ] `backend/src/test/java/com/skillswap/platform/exchange/ExchangeControllerTest.java` — MockMvc tests for authenticated create, accept, reject, cancel, and access control
- [ ] `frontend/src/components/exchange/__tests__/RequestExchangeModal.test.jsx` — tests for modal form inputs, duration cost calculation, and API submission
- [ ] `frontend/src/components/exchange/__tests__/ExchangeCard.test.jsx` — tests for card presentation and action buttons
- [ ] `frontend/src/pages/__tests__/Exchanges.test.jsx` — tests for tab switching, status filters, and request lists

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Modal & Tab Transitions | EXCH-01, EXCH-05 | Visual check of smooth modal opening and tab switching | Open `/members/:id`, click "Request Skill Exchange", verify modal animation and layout balance |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-04
