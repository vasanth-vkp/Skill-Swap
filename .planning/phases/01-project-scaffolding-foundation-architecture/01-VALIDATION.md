---
phase: "1"
slug: "project-scaffolding-foundation-architecture"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-04"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend Framework** | JUnit 5 + MockMvc (Spring Boot Test) |
| **Frontend Framework** | Vite Build + Vitest |
| **Config files** | `backend/pom.xml`, `frontend/vite.config.js` |
| **Quick run command (Backend)** | `mvn -f backend/pom.xml test -Dtest=HealthControllerTest` |
| **Quick run command (Frontend)** | `npm --prefix frontend run build` |
| **Full suite command** | `mvn -f backend/pom.xml test && npm --prefix frontend run build` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run corresponding quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | Foundational infrastructure | T-01-01 | Secure environment credentials & database connectivity | integration | `mvn -f backend/pom.xml compile` | ❌ W0 | ⏳ pending |
| 01-01-02 | 01 | 1 | Foundational infrastructure | T-01-02 | Flyway SQL migration creates schema baseline | integration | `mvn -f backend/pom.xml test -Dtest=SkillSwapApplicationTests` | ❌ W0 | ⏳ pending |
| 01-01-03 | 01 | 1 | Foundational infrastructure | T-01-03 | Health check exposes status without sensitive data | integration | `mvn -f backend/pom.xml test -Dtest=HealthControllerTest` | ❌ W0 | ⏳ pending |
| 01-02-01 | 02 | 1 | Foundational infrastructure | T-01-04 | Vite dev proxy and Tailwind theme tokens setup | unit | `npm --prefix frontend run build` | ❌ W0 | ⏳ pending |
| 01-02-02 | 02 | 1 | Foundational infrastructure | T-01-05 | Responsive Navbar, Footer, and Landing page shell render | unit/component | `npm --prefix frontend run build` | ❌ W0 | ⏳ pending |

---

## Wave 0 Requirements

- [ ] `backend/src/test/java/com/skillswap/platform/SkillSwapApplicationTests.java` — basic Spring context load test
- [ ] `backend/src/test/java/com/skillswap/platform/core/controller/HealthControllerTest.java` — test `/api/v1/health` response
- [ ] `frontend/src/App.test.jsx` — smoke test rendering App root

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive visual layout check | Foundational infrastructure | Visual aesthetics, warm cream palette, typography inspection | Open `http://localhost:5173` in browser and verify Navbar, Hero, "How It Works" cards, and Footer render cleanly |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-04
