---
phase: "10"
slug: "trust-reputation-reviews-ratings"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-04"
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend Framework** | JUnit 5 + MockMvc + Mockito (Spring Boot 3 Test) |
| **Frontend Framework** | Vitest + React Testing Library |
| **Config files** | `backend/pom.xml`, `frontend/vite.config.js` |
| **Quick run command (Backend)** | `mvn -f backend/pom.xml test -Dtest=ReviewServiceTest,ReviewControllerTest` |
| **Quick run command (Frontend)** | `npm --prefix frontend test -- SubmitReviewModal.test.jsx ProfileReviews.test.jsx` |
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
| 10-01-01 | 01 | 1 | REV-01, REV-02, REV-03 | T-10-01, T-10-02 | Backend enforces completed exchange eligibility, single review per participant, and rating recomputation | unit/integration | `mvn -f backend/pom.xml test -Dtest=ReviewServiceTest,ReviewControllerTest` | ❌ W0 | ⏳ pending |
| 10-01-02 | 01 | 1 | REV-01, REV-03 | T-10-03 | Backend exposes review submission and query endpoints with auth checks | unit/integration | `mvn -f backend/pom.xml test -Dtest=ReviewControllerTest` | ❌ W0 | ⏳ pending |
| 10-02-01 | 02 | 1 | REV-01, REV-02 | T-10-04 | Frontend SubmitReviewModal allows 1-5 star ratings and comments with client validation | unit/component | `npm --prefix frontend test -- SubmitReviewModal.test.jsx` | ❌ W0 | ⏳ pending |
| 10-02-02 | 02 | 1 | REV-03 | T-10-05 | ProfileReviews displays ratings summary and reviews list on MemberProfile | unit/component | `npm --prefix frontend test -- ProfileReviews.test.jsx MemberProfile.test.jsx` | ❌ W0 | ⏳ pending |
| 10-02-03 | 02 | 1 | REV-01..03 | T-10-01..05 | Full stack regression and clean Vite production build | e2e/build | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run && npm --prefix frontend run build` | ✅ Yes | ⏳ pending |

---

## Threat Model

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-10-01 | Tampering | ReviewService | high | mitigate | Only participants of exchanges in COMPLETED status can submit reviews; all other statuses/users rejected |
| T-10-02 | Denial of Service | ReviewRepository | high | mitigate | Max 1 review per participant per exchange enforced by service check and unique DB constraint |
| T-10-03 | Information Disclosure | ReviewController | low | mitigate | Review endpoints only expose sanitized reviewer/reviewee details and rating comments |
| T-10-04 | Input Manipulation | SubmitReviewModal | med | mitigate | Star rating bounded between 1 and 5; comments sanitized and length-capped |
| T-10-05 | Tampering | ReviewService | high | mitigate | Aggregate average rating and total review counts computed strictly server-side inside @Transactional |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Star Rating Hover & Glow | REV-01 | Visual verification of interactive rating stars | Open SubmitReviewModal -> hover over stars -> confirm gold fill and reactive label ("5 - Excellent") update smoothly. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-04
