---
phase: "2"
slug: "authentication-security-initial-wallet-grant"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-04"
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend Framework** | JUnit 5 + MockMvc + Mockito (Spring Boot 3 Test) |
| **Frontend Framework** | Vitest + React Testing Library |
| **Config files** | `backend/pom.xml`, `frontend/vite.config.js` |
| **Quick run command (Backend)** | `mvn -f backend/pom.xml test -Dtest=AuthControllerTest,JwtServiceTest` |
| **Quick run command (Frontend)** | `npm --prefix frontend test -- AuthContext.test.jsx` |
| **Full suite command** | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run` |
| **Estimated runtime** | ~15 seconds |

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
| 02-01-01 | 01 | 1 | AUTH-01, WALL-01 | T-02-01 | Atomic user creation and 5-credit wallet grant in DB transaction | integration | `mvn -f backend/pom.xml test -Dtest=AuthServiceTest#testRegisterCreatesUserAndWallet` | ❌ W0 | ⏳ pending |
| 02-01-02 | 01 | 1 | AUTH-02, AUTH-03 | T-02-02 | BCrypt password hashing, JWT generation, 24h expiration, and 401 on bad credentials | unit/integration | `mvn -f backend/pom.xml test -Dtest=JwtServiceTest,AuthControllerTest` | ❌ W0 | ⏳ pending |
| 02-02-01 | 02 | 2 | AUTH-04, AUTH-05 | T-02-03 | AuthContext persists token to localStorage, injects Bearer header, catches 401s | unit | `npm --prefix frontend test -- AuthContext.test.jsx` | ❌ W0 | ⏳ pending |
| 02-02-02 | 02 | 2 | AUTH-01, AUTH-04 | T-02-04 | Register form validation, ProtectedRoute redirect, and 5-credit Welcome Modal rendering | component | `npm --prefix frontend test -- Register.test.jsx,ProtectedRoute.test.jsx` | ❌ W0 | ⏳ pending |

---

## Wave 0 Requirements

- [ ] `backend/src/test/java/com/skillswap/platform/auth/JwtServiceTest.java` — tests for JWT token generation, parsing, expiration
- [ ] `backend/src/test/java/com/skillswap/platform/auth/AuthControllerTest.java` — MockMvc tests for register, login, conflict, unauthorized
- [ ] `frontend/src/context/__tests__/AuthContext.test.jsx` — tests for login, logout, token persistence
- [ ] `frontend/src/components/auth/__tests__/Register.test.jsx` — tests for form fields and submit handling

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Welcome Modal visual presentation | AUTH-02 | Visual confirmation of coin/clock icon, styling, and animation | Register new account and visually confirm celebration dialog displays with 5 Time Credits announcement |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-04
