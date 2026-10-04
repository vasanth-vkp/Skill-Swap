---
phase: "4"
slug: "skill-discovery-search-experience"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-04"
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend Framework** | JUnit 5 + MockMvc + Mockito (Spring Boot 3 Test) |
| **Frontend Framework** | Vitest + React Testing Library |
| **Config files** | `backend/pom.xml`, `frontend/vite.config.js` |
| **Quick run command (Backend)** | `mvn -f backend/pom.xml test -Dtest=DiscoveryControllerTest` |
| **Quick run command (Frontend)** | `npm --prefix frontend test -- ExploreSkills.test.jsx,ProviderCard.test.jsx` |
| **Full suite command** | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run` |
| **Estimated runtime** | ~18 seconds |

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
| 04-01-01 | 01 | 1 | DISC-01, DISC-02 | T-04-01, T-04-02 | Flyway migration V3 adds rating columns; UserRepository search query filters by category, location, rating, keyword | integration | `mvn -f backend/pom.xml test -Dtest=DiscoveryControllerTest` | ❌ W0 | ⏳ pending |
| 04-01-02 | 01 | 1 | DISC-01, DISC-02, DISC-03 | T-04-02, T-04-03 | DiscoveryController exposes `/api/v1/members/search` returning sanitized `MemberCardDto` with pagination | integration | `mvn -f backend/pom.xml test -Dtest=DiscoveryControllerTest` | ❌ W0 | ⏳ pending |
| 04-02-01 | 02 | 2 | DISC-02, DISC-03 | T-04-02 | ProviderCard and FilterSidebar components render provider info, experience badges, and filter controls | unit/component | `npm --prefix frontend test -- ProviderCard.test.jsx` | ❌ W0 | ⏳ pending |
| 04-02-02 | 02 | 2 | DISC-01, DISC-02, DISC-03 | T-04-02 | ExploreSkills page integrates search bar, filter sidebar, responsive grid, pagination, and empty state | component | `npm --prefix frontend test -- ExploreSkills.test.jsx` | ❌ W0 | ⏳ pending |

---

## Wave 0 Requirements

- [ ] `backend/src/test/java/com/skillswap/platform/discovery/DiscoveryControllerTest.java` — MockMvc tests for multi-criteria search, pagination, and privacy sanitization
- [ ] `frontend/src/components/discovery/__tests__/ProviderCard.test.jsx` — tests for card details, experience badges, and profile navigation link
- [ ] `frontend/src/pages/__tests__/ExploreSkills.test.jsx` — tests for explore page rendering, filtering, active filter dismissal, and pagination

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive Filter Drawer on Mobile | DISC-02, DISC-03 | Mobile viewport styling and slide-over transition | Resize viewport to mobile width (<768px), click "Filters" button, select category, verify drawer opens and updates cards |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-04
