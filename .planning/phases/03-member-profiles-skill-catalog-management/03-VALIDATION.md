---
phase: "3"
slug: "member-profiles-skill-catalog-management"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-04"
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend Framework** | JUnit 5 + MockMvc + Mockito (Spring Boot 3 Test) |
| **Frontend Framework** | Vitest + React Testing Library |
| **Config files** | `backend/pom.xml`, `frontend/vite.config.js` |
| **Quick run command (Backend)** | `mvn -f backend/pom.xml test -Dtest=SkillControllerTest,ProfileControllerTest` |
| **Quick run command (Frontend)** | `npm --prefix frontend test -- SkillSelector.test.jsx,Profile.test.jsx` |
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
| 03-01-01 | 01 | 1 | PROF-02 | T-03-01 | Flyway seeds 36 skills; SkillController serves catalog and allows custom skill creation | integration | `mvn -f backend/pom.xml test -Dtest=SkillControllerTest` | ❌ W0 | ⏳ pending |
| 03-01-02 | 01 | 1 | PROF-01, PROF-03, PROF-04, PROF-05 | T-03-02, T-03-03 | Profile updates, offered/wanted skills CRUD with ownership validation, and public profile sanitation | integration | `mvn -f backend/pom.xml test -Dtest=ProfileControllerTest` | ❌ W0 | ⏳ pending |
| 03-02-01 | 02 | 2 | PROF-01, PROF-02 | T-03-04 | SkillSelector category filtering and custom skill creation; AvatarPicker presets | unit/component | `npm --prefix frontend test -- SkillSelector.test.jsx` | ❌ W0 | ⏳ pending |
| 03-02-02 | 02 | 2 | PROF-01, PROF-03, PROF-04, PROF-05 | T-03-05 | Onboarding wizard, ProfileEdit page, and Public Member Profile view rendering | component | `npm --prefix frontend test -- Profile.test.jsx` | ❌ W0 | ⏳ pending |

---

## Wave 0 Requirements

- [ ] `backend/src/test/java/com/skillswap/platform/skill/SkillControllerTest.java` — tests for catalog retrieval, category filter, and skill creation
- [ ] `backend/src/test/java/com/skillswap/platform/profile/ProfileControllerTest.java` — MockMvc tests for profile me, update, skill add/delete, and public member view
- [ ] `frontend/src/components/profile/__tests__/SkillSelector.test.jsx` — tests for category filtering, searching, and selection
- [ ] `frontend/src/pages/__tests__/Profile.test.jsx` — tests for profile rendering, skills list, and edit mode

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Avatar selection preview & Onboarding flow | PROF-01, D-302 | Visual confirmation of avatar switching and 2-step onboarding UX | Navigate to `/onboarding`, pick avatar preset, add skills, and verify smooth navigation to `/dashboard` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-04
