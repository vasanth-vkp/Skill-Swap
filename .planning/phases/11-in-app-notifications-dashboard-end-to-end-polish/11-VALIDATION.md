---
phase: "11"
slug: "in-app-notifications-dashboard-end-to-end-polish"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-04"
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend Framework** | JUnit 5 + MockMvc + Mockito (Spring Boot 3 Test) |
| **Frontend Framework** | Vitest + React Testing Library |
| **Config files** | `backend/pom.xml`, `frontend/vite.config.js` |
| **Quick run command (Backend)** | `mvn -f backend/pom.xml test -Dtest=NotificationServiceTest,NotificationControllerTest` |
| **Quick run command (Frontend)** | `npm --prefix frontend test -- NotificationBell.test.jsx Dashboard.test.jsx` |
| **Full suite command** | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run` |
| **Estimated runtime** | ~40 seconds |

---

## Sampling Rate

- **After every task commit:** Run corresponding quick run command
- **After plan execution:** Run full suite command
- **Before milestone sign-off:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | NOTF-01 | T-11-01 | Backend Notification entity, repository, service, and lifecycle event triggers | unit/service | `mvn -f backend/pom.xml test -Dtest=NotificationServiceTest` | ❌ W0 | ⏳ pending |
| 11-01-02 | 01 | 1 | NOTF-02 | T-11-02, T-11-03 | Authenticated notification REST endpoints with user isolation and mark-as-read | integration | `mvn -f backend/pom.xml test -Dtest=NotificationControllerTest` | ❌ W0 | ⏳ pending |
| 11-02-01 | 02 | 1 | NOTF-02 | T-11-04 | Frontend notificationService and NotificationBell dropdown with live unread badge | unit/component | `npm --prefix frontend test -- NotificationBell.test.jsx` | ❌ W0 | ⏳ pending |
| 11-02-02 | 02 | 1 | DASH-01, DASH-02 | T-11-05 | Dashboard updates with notification alerts, quick stats, and responsive navigation | unit/page | `npm --prefix frontend test -- Dashboard.test.jsx Navbar.test.jsx` | ❌ W0 | ⏳ pending |
| 11-02-03 | 02 | 1 | NOTF-01..02, DASH-01..02 | T-11-01..05 | Full stack regression across all modules and clean production bundle build | e2e/build | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run && npm --prefix frontend run build` | ✅ Yes | ⏳ pending |

---

## Threat Model

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-11-01 | Tampering | NotificationService | high | mitigate | Notifications are created strictly server-side by authenticated domain actions; users cannot inject arbitrary notifications |
| T-11-02 | Information Disclosure | NotificationController | high | mitigate | User can only query and mark as read notifications belonging to their authenticated user ID |
| T-11-03 | Denial of Service | NotificationRepository | med | mitigate | Queries are indexed by `(user_id, is_read)` and limited/ordered by creation timestamp |
| T-11-04 | XSS | NotificationBell | med | mitigate | Notification messages are sanitized text strings rendered safely via React standard text interpolation |
| T-11-05 | Data Drift | Dashboard | low | mitigate | Dashboard pulls live balances, real bookings, recommendations, and notifications with zero mock data |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Notification Bell Dropdown Click-Away | NOTF-02 | Visual verification of backdrop click dismissal and smooth flyout | Click bell in Navbar -> observe dropdown open -> click outside -> confirm clean close |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-04
