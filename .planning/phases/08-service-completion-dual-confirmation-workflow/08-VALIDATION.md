---
phase: "8"
slug: "service-completion-dual-confirmation-workflow"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-04"
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend Framework** | JUnit 5 + MockMvc + Mockito (Spring Boot 3 Test) |
| **Frontend Framework** | Vitest + React Testing Library |
| **Config files** | `backend/pom.xml`, `frontend/vite.config.js` |
| **Quick run command (Backend)** | `mvn -f backend/pom.xml test -Dtest=ExchangeServiceTest,ExchangeControllerTest` |
| **Quick run command (Frontend)** | `npm --prefix frontend test -- DisputeExchangeModal.test.jsx ExchangeCard.test.jsx` |
| **Full suite command** | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run` |
| **Estimated runtime** | ~35 seconds |

---

## Sampling Rate

- **After every task commit:** Run corresponding quick run command
- **After plan execution:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | CMPL-01, CMPL-02, CMPL-03 | T-08-01, T-08-02 | Backend confirms completion independently, transitions on dual confirmation, records disputes | unit/integration | `mvn -f backend/pom.xml test -Dtest=ExchangeServiceTest,ExchangeControllerTest` | ✅ Yes | ⏳ pending |
| 08-01-02 | 01 | 1 | CMPL-01, CMPL-02, CMPL-03 | T-08-03, T-08-04 | Frontend shows dual confirmation status, verify triggers, and dispute modal | unit/component | `npm --prefix frontend test -- DisputeExchangeModal.test.jsx ExchangeCard.test.jsx` | ❌ W0 | ⏳ pending |
| 08-01-03 | 01 | 1 | CMPL-01, CMPL-02, CMPL-03 | T-08-05 | Full test regression and clean production bundle build | e2e/build | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run && npm --prefix frontend run build` | ✅ Yes | ⏳ pending |

---

## Threat Model

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-08-01 | Tampering | ExchangeService | high | mitigate | Caller must be requester or provider; non-participants rejected with 403 |
| T-08-02 | Tampering | ExchangeService | high | mitigate | Exchanges must be in SCHEDULED or ACCEPTED status; cannot confirm completed/cancelled/disputed |
| T-08-03 | Spoofing | DisputeExchangeModal | med | mitigate | Server verifies caller session and records caller ID as `disputedBy` |
| T-08-04 | Repudiation | ExchangeRequest | med | mitigate | Independent timestamps recorded for both provider and requester confirmations |
| T-08-05 | Denial of Service | ExchangeCard | low | mitigate | Loading states prevent duplicate click submissions; idempotent completion handling |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dual Confirmation Visual Flow | CMPL-01, CMPL-02 | Visual verification of reciprocal badges | User 1 confirms completion -> sees "Awaiting partner confirmation". User 2 opens exchange -> sees "Partner confirmed — verify now" highlighted CTA -> confirms -> exchange turns green "Completed". |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-04
