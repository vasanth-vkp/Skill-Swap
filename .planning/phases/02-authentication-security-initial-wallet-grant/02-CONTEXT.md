# Phase 2: Authentication, Security & Initial Wallet Grant - Context

**Gathered:** 2026-10-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement secure user registration, BCrypt password hashing, automatic initial 5-credit wallet provisioning in database transactions, JWT token generation/validation (HMAC-SHA256), login endpoint, session persistence via `localStorage` and `AuthContext`, `ProtectedRoute` routing, logout functionality, and a celebratory welcome modal for newly credited members.

</domain>

<decisions>
## Implementation Decisions

### Post-Registration UX & Wallet Welcome Flow
- **D-01:** Seamless auto-login on signup: The registration endpoint (`POST /api/v1/auth/register`) returns a signed JWT token, user profile details, and wallet balance directly, signing the user in immediately without requiring a separate login step. — **Reversibility:** reversible — registration endpoint response contract and frontend AuthContext login handler.
- **D-02:** Welcome modal celebration: Newly registered members are greeted with a celebratory popup modal showcasing a sparkling time-credit graphic and the announcement: *"Welcome to SkillSwap! We've gifted you 5 Time Credits to start exchanging skills"*, featuring a CTA button to explore skills. — **Reversibility:** reversible — encapsulated in a reusable celebration modal component.
- **D-03:** First landing destination: After registration and welcome modal dismissal, the user is navigated to the Member Dashboard (`/dashboard`), prominently displaying their 5-credit balance card and quick action prompts. — **Reversibility:** reversible — default post-signup routing.
- **D-04:** Single-step registration form: Collects Full Name, Email Address, Password (with toggleable show/hide eye), and Location (City/State), keeping signup frictionless and directly fulfilling requirement AUTH-01. — **Reversibility:** reversible — form input layout in `Register.jsx`.

### Security, Token Architecture & Session Handling
- **D-05:** JWT storage & transmission: The signed JWT token is stored in `localStorage` and transmitted on authenticated requests via `Authorization: Bearer <token>` through an Axios request interceptor. React `AuthContext` provides reactive auth state across the SPA. — **Reversibility:** costly — switching from localStorage to httpOnly cookies would require backend CORS/cookie configuration, CSRF tokens, and client rewrite.
- **D-06:** Token lifetime: 24-hour access token (86,400s) signed with HMAC-SHA256 (`jwt.secret`), avoiding complex refresh token sync during hackathon evaluation while ensuring reliable sessions. — **Reversibility:** reversible — configurable via Spring Boot `application.yml` (`application.security.jwt.expiration`).
- **D-07:** Password validation & hashing: Balanced policy requiring minimum 8 characters containing letters and at least one digit; backend hashes passwords with BCrypt (strength 12) before persisting to PostgreSQL `users.password_hash`. — **Reversibility:** costly — changing password constraints after users register requires migration logic or forced resets.
- **D-08:** Protected routing & 401 recovery: `ProtectedRoute` redirects unauthenticated users to `/login` preserving target route (`state: { from: location }`); Axios response interceptor catches 401 Unauthorized responses, clears credentials, resets `AuthContext`, and displays an auth-expired toast. — **Reversibility:** reversible — client-side routing and interceptor logic.

### The Agent's Discretion
- JWT claims structure (standard claims: `sub` [user ID], `email`, `role`, `iat`, `exp`).
- Specific error response payloads for registration conflicts (duplicate email: HTTP 409) and bad credentials (HTTP 401).
- Visual animation and micro-interactions on the welcome modal and password eye toggle.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Requirements
- `SKILLSWAP_SPEC.md` § 4 (Authentication & Initial Credit Allocation: 5 credits), § 8 (Security Architecture), § 9 (Database Entities: `users`, `wallets`)
- `.planning/PROJECT.md` — Core constraints: dual-role member persona, server-side transactional balance updates, economic invariant (1 hr = 1 credit)
- `.planning/REQUIREMENTS.md` — Requirements AUTH-01 through AUTH-05, and WALL-01
- `.planning/phases/01-project-scaffolding-foundation-architecture/01-CONTEXT.md` — Foundation setup, warm cream & amber theme tokens, Maven / Spring Boot 3 / Vite React 19 structure

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Foundation architecture from Phase 1: Spring Boot modular packages (`com.skillswap.platform.auth`, `.user`, `.wallet`) and React 19 app shell with Tailwind CSS theme.

### Established Patterns
- Flyway SQL migrations for table creation (`users`, `wallets`).
- Axios client configured with base URL pointing to `/api/v1`.

### Integration Points
- Backend: `SecurityFilterChain` configuring permitAll on `/api/v1/auth/**`, `/api/v1/health`, and requiring authenticated JWT for other endpoints.
- Backend: User registration service executing `@Transactional` user insert + wallet insert with `balance = 5`.
- Frontend: `AuthContext.jsx` exposing `user`, `token`, `login()`, `register()`, `logout()`.

</code_context>

<specifics>
## Specific Ideas

- The welcome modal should make the 5 free credits feel like an immediate community gift, encouraging users to browse and exchange skills without feeling financial barrier.
- Show/hide password toggle to avoid typos during mobile/desktop registration.

</specifics>

<deferred>
## Deferred Ideas

- OAuth2 / Social Login (Google, GitHub) — deferred to backlog for post-hackathon enhancement.
- Multi-factor authentication (MFA) — not needed for MVP scope.

</deferred>

---

*Phase: 2-Authentication, Security & Initial Wallet Grant*
*Context gathered: 2026-10-04*
