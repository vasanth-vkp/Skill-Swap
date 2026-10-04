# Phase 1: Project Scaffolding & Foundation Architecture - Research

**Researched:** 2026-10-04
**Domain:** Spring Boot 3.3.x (Java 21) + PostgreSQL 16 + React 19 / Vite + Tailwind CSS Foundation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Warm community aesthetic with soft cream backgrounds (`#FAF8F5` / `#FFFDF9`), warm amber/coral accents, and friendly rounded components.
- **D-02:** Rich landing page shell featuring a prominent Hero banner with search bar, 3-step "How It Works" card flow, "Popular Skill Exchanges" showcase grid, and a dedicated Time-Credit value explainer section.
- **D-03:** Comprehensive persistent top navigation bar featuring the SkillSwap brand logo with time-credit icon, core navigation links (Explore Skills, How It Works, Community), "Sign In" button, and a prominent "Get 5 Free Credits" registration CTA button; full footer with platform manifesto and community links.
- **D-04:** Google Fonts pairing with "Plus Jakarta Sans" for warm, modern headings and "Inter" for crisp readable body text, paired with generous rounded corners (`rounded-2xl`), soft warm shadows, and Lucide React icons with amber/coral accents.
- **D-05:** Maven (`pom.xml` with Spring Boot 3.3.x and Java 21) in `/backend` and Vite React 19 in `/frontend` monorepo layout. Standard, widely compatible, zero Gradle daemon quirks on Windows.
- **D-06:** Flyway SQL versioned migrations (`src/main/resources/db/migration/V1__init_schema.sql`) paired with JPA `ddl-auto: validate` — deterministic, audit-ready, enforces foreign keys, indexes, and precision for credit ledger.
- **D-07:** Root `docker-compose.yml` provisioning PostgreSQL 16 on port 5432 with standard dev credentials (`skillswap`/`password`), with configurable `application.yml` environment variable overrides allowing seamless connection to either Docker or a locally running PostgreSQL service.
- **D-08:** Base API path `/api/v1`, Spring Web CORS allowing frontend dev origin (`http://localhost:5173`), dedicated `/api/v1/health` REST endpoint checking PostgreSQL connectivity status, plus Vite dev server reverse proxy (`/api` -> `http://localhost:8080`) for seamless local requests.

### The Agent's Discretion
- Package naming convention for Spring Boot modular packages (`com.skillswap.platform.core`, `.user`, `.wallet`, `.skill`, etc.).
- Specific Tailwind CSS token color scales matching warm cream and amber/coral palette.
- Default PostgreSQL pool sizing (HikariCP) and actuator endpoint exposures.

### Deferred Ideas (OUT OF SCOPE)
- None — all decisions strictly within Phase 1 foundation scope.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Monorepo & Build Tooling | Root Directory | — | Root directory coordinates `/backend` (Maven) and `/frontend` (Vite) |
| Backend Application & Modular Packages | API/Backend | — | Spring Boot 3.3.x modular monolith architecture in `com.skillswap.platform` |
| Database Schema Baseline | Database/Storage | API/Backend | Flyway SQL migrations establish PostgreSQL tables (`users`, `wallets`, `skills`, `user_skills`, `exchange_requests`, `bookings`, `credit_transactions`, `reviews`, `notifications`) |
| System Health Monitoring | API/Backend | — | Dedicated REST endpoint `/api/v1/health` exposes database readiness |
| Frontend Design System & Theme Tokens | Browser/Client | — | Tailwind CSS theme extension configuring cream backgrounds, amber/coral accents, Plus Jakarta Sans, and rounded-2xl utilities |
| Global Navigation & Landing Shell | Browser/Client | — | React 19 SPA shell featuring Navbar, Footer, and modular landing sections |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 1 establishes the bedrock of SkillSwap: a robust Spring Boot 3.3.x backend running on Java 21, version-controlled Flyway schema migrations on PostgreSQL 16, and a responsive React 19 + Vite frontend styled with Tailwind CSS.

On the backend, Spring Boot 3 with Spring Web, Spring Data JPA, and PostgreSQL JDBC driver provides the REST API skeleton. Flyway executes `V1__init_schema.sql` on startup, creating all core tables specified in `SKILLSWAP_SPEC.md` § 9. A dedicated `HealthController` at `/api/v1/health` queries PostgreSQL and reports system readiness, timestamp, and version status.

On the frontend, Vite creates a fast React 19 SPA. Tailwind CSS is configured with the warm community color tokens (soft cream `#FAF8F5`, warm amber `#F59E0B` and coral `#F43F5E`, slate neutrals), typography ("Plus Jakarta Sans" for headings and "Inter" for body), and `rounded-2xl` defaults. Global components `Navbar` and `Footer` frame the application, and the landing page presents a hero with search bar, 3-step "How It Works" card flow, "Popular Skill Exchanges" showcase grid, and a Time-Credit value explainer section.

**Primary recommendation:** Initialize `/backend` as a clean Maven Spring Boot 3 project and `/frontend` as a Vite React 19 project, linking them via a root `docker-compose.yml` for PostgreSQL and Vite proxy for seamless local development.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library / Tool | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| Spring Boot | 3.3.x | Backend application framework | Current stable Spring Boot standard for Java 21 |
| Flyway Core + Flyway Database PostgreSQL | 10.x | Database schema migrations | Deterministic SQL migrations integrated directly into Spring Boot lifecycle |
| PostgreSQL JDBC | 42.7.x | Database driver | Standard PostgreSQL connector for Spring Data JPA |
| React | 19.x | Frontend UI library | Modern React with concurrent rendering and hooks |
| Vite | 5.x / 6.x | Frontend build tool and dev server | Instant hot module replacement (HMR) and fast build |
| Tailwind CSS | 3.4.x | Utility-first CSS framework | Rapid styling with custom design tokens and theme extensions |
| Lucide React | Latest | Iconography | Clean, consistent icons (Clock, Sparkles, Search, ArrowRight, User) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Spring Boot Starter Actuator | 3.3.x | Health & metrics | Base operational monitoring |
| Docker Compose | v2 | Local container orchestration | PostgreSQL 16 local database provisioning |

**Installation Commands:**
```bash
# Root
docker compose up -d

# Backend
mvn -f backend/pom.xml spring-boot:run

# Frontend
npm --prefix frontend install
npm --prefix frontend run dev
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Directory Structure Overview
```
JK web/
├── docker-compose.yml              # PostgreSQL 16 container definition
├── backend/                        # Spring Boot 3 Modular Monolith
│   ├── pom.xml
│   ├── src/main/java/com/skillswap/platform/
│   │   ├── SkillSwapApplication.java
│   │   ├── core/
│   │   │   ├── config/WebConfig.java (CORS configuration)
│   │   │   └── controller/HealthController.java (/api/v1/health)
│   │   ├── user/
│   │   ├── wallet/
│   │   └── skill/
│   └── src/main/resources/
│       ├── application.yml
│       └── db/migration/
│           └── V1__init_schema.sql # Core PostgreSQL entities
└── frontend/                       # React 19 + Vite SPA
    ├── package.json
    ├── vite.config.js              # Dev proxy /api -> http://localhost:8080
    ├── tailwind.config.js          # Warm cream & amber/coral design tokens
    ├── index.html                  # Plus Jakarta Sans & Inter font imports
    └── src/
        ├── index.css
        ├── App.jsx
        ├── components/
        │   ├── layout/Navbar.jsx
        │   └── layout/Footer.jsx
        └── pages/
            └── Landing.jsx
```
</architecture_patterns>

<validation_architecture>
## Validation Architecture

1. **Backend Automated Tests:**
   - `SkillSwapApplicationTests`: Verifies Spring context loads cleanly with PostgreSQL connection.
   - `HealthControllerTest`: Verifies `/api/v1/health` returns HTTP 200 with status `"UP"`, database `"CONNECTED"`, and current timestamp.
2. **Frontend Automated Tests & Builds:**
   - `npm --prefix frontend run build`: Verifies zero build or syntax errors in React 19 components.
   - Smoke test: Verifies `App.jsx` renders `Navbar`, `Landing`, and `Footer`.
</validation_architecture>
