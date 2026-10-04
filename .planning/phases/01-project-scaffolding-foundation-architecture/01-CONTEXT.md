# Phase 1: Project Scaffolding & Foundation Architecture - Context

**Gathered:** 2026-10-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish a functioning full-stack modular monolith skeleton with Spring Boot 3 backend, PostgreSQL schema baseline, and React 19 + Vite + Tailwind CSS frontend. Exposes clean health check endpoint, validates database connectivity, and renders responsive landing page shell with global navigation and theme design system.

</domain>

<decisions>
## Implementation Decisions

### Frontend Shell & Visual Design Theme
- **D-01:** Warm community aesthetic with soft cream backgrounds (`#FAF8F5` / `#FFFDF9`), warm amber/coral accents, and friendly rounded components. — **Reversibility:** costly — brand colors, background neutrals, and theme tokens are set at the root CSS/Tailwind level.
- **D-02:** Rich landing page shell featuring a prominent Hero banner with search bar, 3-step "How It Works" card flow, "Popular Skill Exchanges" showcase grid, and a dedicated Time-Credit value explainer section. — **Reversibility:** reversible — sections are modular components in the frontend.
- **D-03:** Comprehensive persistent top navigation bar featuring the SkillSwap brand logo with time-credit icon, core navigation links (Explore Skills, How It Works, Community), "Sign In" button, and a prominent "Get 5 Free Credits" registration CTA button; full footer with platform manifesto and community links. — **Reversibility:** reversible — encapsulated in `Navbar` and `Footer` components.
- **D-04:** Google Fonts pairing with "Plus Jakarta Sans" for warm, modern headings and "Inter" for crisp readable body text, paired with generous rounded corners (`rounded-2xl`), soft warm shadows, and Lucide React icons with amber/coral accents. — **Reversibility:** costly — typography imports and Tailwind configuration affect all subsequent pages.

### Backend & Repository Foundation Architecture
- **D-05:** Maven (`pom.xml` with Spring Boot 3.3.x and Java 21) in `/backend` and Vite React 19 in `/frontend` monorepo layout. Standard, widely compatible, zero Gradle daemon quirks on Windows. — **Reversibility:** one-way — build system and repository directory structure define project build scripts and workspace config.
- **D-06:** Flyway SQL versioned migrations (`src/main/resources/db/migration/V1__init_schema.sql`) paired with JPA `ddl-auto: validate` — deterministic, audit-ready, enforces foreign keys, indexes, and precision for credit ledger. — **Reversibility:** one-way — database migrations establish immutable baseline for PostgreSQL tables; rollbacks require forward-migrating scripts.
- **D-07:** Root `docker-compose.yml` provisioning PostgreSQL 16 on port 5432 with standard dev credentials (`skillswap`/`password`), with configurable `application.yml` environment variable overrides allowing seamless connection to either Docker or a locally running PostgreSQL service. — **Reversibility:** reversible — docker configuration and connection URLs can be adapted without altering application code.
- **D-08:** Base API path `/api/v1`, Spring Web CORS allowing frontend dev origin (`http://localhost:5173`), dedicated `/api/v1/health` REST endpoint checking PostgreSQL connectivity status, plus Vite dev server reverse proxy (`/api` -> `http://localhost:8080`) for seamless local requests. — **Reversibility:** costly — API paths and dev proxy configuration establish the integration contract between frontend and backend.

### The Agent's Discretion
- Package naming convention for Spring Boot modular packages (`com.skillswap.platform.core`, `.user`, `.wallet`, `.skill`, etc.).
- Specific Tailwind CSS token color scales matching warm cream and amber/coral palette.
- Default PostgreSQL pool sizing (HikariCP) and actuator endpoint exposures.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Constraints
- `SKILLSWAP_SPEC.md` § 4, § 8, § 9 — Core MVP requirements, tech stack specs, and database entities
- `.planning/PROJECT.md` — Core value, technical constraints, economic invariants (1 hr = 1 credit, 5-credit signup grant)
- `.planning/REQUIREMENTS.md` — System requirement IDs and traceability
- `.planning/ROADMAP.md` § Phase 1 — Phase 1 goals, success criteria, and plans

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Greenfield setup: No legacy code. Phase 1 scaffolds the repository structure and base patterns for all subsequent phases.

### Established Patterns
- Monorepo directory structure: `/backend` (Spring Boot 3, Java 21, Maven) and `/frontend` (React 19, Vite, Tailwind CSS).
- Database migrations: Flyway SQL migrations in `backend/src/main/resources/db/migration/`.

### Integration Points
- Frontend to Backend API: `/api/v1/health` health endpoint, with Vite dev proxy routing `/api` to `http://localhost:8080`.
- Docker Compose: PostgreSQL 16 service for containerized or local database connection.

</code_context>

<specifics>
## Specific Ideas

- Warm, welcoming community vibe rather than generic sterile corporate tech. Cream backgrounds with warm amber/coral accents evoke human collaboration and time-sharing.
- The "+5 Free Credits" initial grant highlighted on the landing page CTA buttons to reinforce the core economic model from the first user interaction.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 1 foundation boundaries.

</deferred>

---

*Phase: 1-Project Scaffolding & Foundation Architecture*
*Context gathered: 2026-10-04*
