# Phase 2: Authentication, Security & Initial Wallet Grant - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-04
**Phase:** 2-Authentication, Security & Initial Wallet Grant
**Areas discussed:** Post-Registration UX & Wallet Welcome Flow, Security, Token Architecture & Session Handling

---

## Post-Registration Login Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Seamless Auto-Login | Registration response returns JWT token and wallet info, automatically signing the user in without requiring them to re-enter credentials | ✓ |
| Explicit Sign-In | Redirect to /login page with a success message ("Registration successful! Log in to claim your 5 credits") | |
| You decide | | |

**User's choice:** Seamless Auto-Login: Registration response returns JWT token and wallet info, automatically signing the user in without requiring them to re-enter credentials
**Notes:** Provides a smooth, modern signup journey directly into the app.

---

## Initial Credit Grant UX Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Welcome Modal | A celebratory modal popup with sparkling time-credit graphic, announcing "Welcome to SkillSwap! We've gifted you 5 Time Credits to start exchanging skills" with CTA to explore skills | ✓ |
| Dismissible Toast/Banner | A vibrant top banner or toast alert celebrating the 5-credit grant that stays visible until dismissed | |
| Subtle Indicator | No modal or banner; simply highlight the "5 Credits" badge in the Navbar | |
| You decide | | |

**User's choice:** Welcome Modal: A celebratory modal popup with sparkling time-credit graphic, announcing "Welcome to SkillSwap! We've gifted you 5 Time Credits to start exchanging skills" with CTA to explore skills
**Notes:** Delivers an emotional hook highlighting the time-credit value proposition immediately.

---

## First Landing Destination

| Option | Description | Selected |
|--------|-------------|----------|
| Member Dashboard | Lands on dashboard (`/dashboard`) showing 5-credit balance card, quick actions, and prompt to complete skill profile | ✓ |
| Profile Setup Onboarding | Directly guides them into setting up bio and skills (`/onboarding`) | |
| Explore Skills | Lands directly on the skills discovery catalog (`/explore`) | |
| You decide | | |

**User's choice:** Member Dashboard (`/dashboard`): Lands on dashboard showing 5-credit balance card, quick actions, and prompt to complete skill profile
**Notes:** Anchors the user on their central home hub.

---

## Registration Form Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Clean single-step form | Full Name, Email Address, Password (with show/hide eye toggle), and Location (City/State), keeping signup fast and aligned with AUTH-01 | ✓ |
| Two-step progressive card | Step 1 (Name, Email, Password) -> Step 2 (Location & short headline bio) | |
| You decide | | |

**User's choice:** Clean single-step form: Full Name, Email Address, Password (with show/hide eye toggle), and Location (City/State), keeping signup fast and aligned with AUTH-01
**Notes:** Keeps registration quick and avoids excessive friction.

---

## JWT Token Storage

| Option | Description | Selected |
|--------|-------------|----------|
| `localStorage` + Bearer header | `localStorage` + `Authorization: Bearer <token>` in Axios interceptor — standard SPA pattern, seamless session persistence across refresh (AUTH-04), and zero cookie domain issues in dev proxy | ✓ |
| HttpOnly Secure cookie | Server-managed cookie sent with credentials: include | |
| `sessionStorage` + Bearer header | Token lives only in current browser tab/window | |
| You decide | | |

**User's choice:** `localStorage` + `Authorization: Bearer <token>` in Axios interceptor
**Notes:** Pragmatic, standard pattern for Vite + Spring Boot REST APIs with clear persistence across browser refresh.

---

## Token Expiration Policy

| Option | Description | Selected |
|--------|-------------|----------|
| 24-hour access token (86,400s) | Reliable and clean for active MVP usage, avoids mid-demo expiration disruptions, without requiring complex refresh token sync | ✓ |
| 7-day access token (604,800s) | Persistent weekly session | |
| Dual token flow | 15-minute access token + 7-day refresh token | |
| You decide | | |

**User's choice:** 24-hour access token (86,400s)
**Notes:** Sufficient duration for hackathon demos and active daily evaluation without token refresh complexity.

---

## Password Policy & Validation

| Option | Description | Selected |
|--------|-------------|----------|
| Balanced security | Minimum 8 characters containing letters and at least one number, with real-time helper text and BCrypt (strength 12) hashing on backend | ✓ |
| Pragmatic minimum | Minimum 6 characters (any format) | |
| Strict security | Minimum 8 characters requiring uppercase, lowercase, digit, and special symbol with dynamic strength meter | |
| You decide | | |

**User's choice:** Balanced security: Minimum 8 characters containing letters and at least one number, with real-time helper text and BCrypt (strength 12) hashing on backend
**Notes:** Practical security standard that prevents weak passwords without frustrating users.

---

## Protected Routes & 401 Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve target redirect | `ProtectedRoute` redirects to `/login` saving `from: location.pathname`; on login user returns to intended page; Axios interceptor catches 401s, clears token, and triggers re-auth toast | ✓ |
| Direct redirect | Always navigate to `/login` on auth failure, clearing state without redirect-back navigation | |
| You decide | | |

**User's choice:** Preserve target redirect: `ProtectedRoute` redirects to `/login` saving `from: location.pathname`; on login user returns to intended page; Axios interceptor catches 401s, clears token, and triggers re-auth toast
**Notes:** Standard high-quality SPA route protection and auth expiration handling.

---

## The Agent's Discretion

- Standard JWT claims structure (`sub`, `email`, `role`, `iat`, `exp`).
- Toast notification styles and animation timing.
- HTTP error body schema (standard timestamp, status, error, message, path).

## Deferred Ideas

- Social login (OAuth2 Google/GitHub) — deferred to backlog.
- MFA / Two-Factor authentication — deferred to backlog.
