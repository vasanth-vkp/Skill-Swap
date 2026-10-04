# Phase 1: Project Scaffolding & Foundation Architecture - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-04
**Phase:** 1-Project Scaffolding & Foundation Architecture
**Areas discussed:** Frontend Shell & Visual Design Theme, Backend & Repository Foundation Architecture

---

## Frontend Shell & Visual Design Theme

| Option | Description | Selected |
|--------|-------------|----------|
| Modern crisp light mode | Deep indigo primary (#4F46E5), emerald time-credit badges (#10B981), and clean slate neutrals (#F8FAFC) | |
| Sleek dark-first theme | Deep zinc background (#09090B), glassmorphic frosted cards, and glowing purple/cyan accents | |
| Warm community aesthetic | Soft cream backgrounds, amber/coral accents, and friendly rounded components | ✓ |
| You decide | Pick what best matches a modern, high-trust SaaS application | |

**User's choice:** Warm community aesthetic with soft cream backgrounds, amber/coral accents, and friendly rounded components
**Notes:** Establishes a warm, human-centric visual personality for community skill sharing.

---

## Landing Page Shell & Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Rich landing shell | Hero banner with search bar, 3-step "How It Works" card flow, "Popular Skill Exchanges" showcase grid, and Time-Credit explainer section | ✓ |
| Split-screen landing | Hero with prominent community illustration / exchange mockup on the right, value prop and CTA buttons on the left, followed by core feature cards | |
| Minimalist focused landing | Strong headline, quick search bar, and clean 4-card value proposition grid without heavy decorative sections | |
| You decide | | |

**User's choice:** Rich landing shell: Hero banner with search bar, 3-step "How It Works" card flow, "Popular Skill Exchanges" showcase grid, and Time-Credit explainer section
**Notes:** Provides a complete visual story on first load.

---

## Navbar & Header Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Comprehensive Navbar | SkillSwap logo with time-credit icon, nav links (Explore Skills, How It Works, Community), "Sign In" button, and prominent "Get 5 Free Credits" registration CTA button; full footer with community manifesto & links | ✓ |
| Clean Pill Navbar | Floating sticky navbar with centered navigation links and dual Sign In / Register buttons | |
| Minimal Navbar | Logo on left, single "Join Community" button on right | |
| You decide | | |

**User's choice:** Comprehensive Navbar with SkillSwap logo, navigation links, Sign In button, and prominent "Get 5 Free Credits" registration CTA; full footer.
**Notes:** Frontloads the 5-credit signup incentive directly in global navigation.

---

## Typography & Micro-styling

| Option | Description | Selected |
|--------|-------------|----------|
| Plus Jakarta Sans + Inter | Google Fonts "Plus Jakarta Sans" (warm headings) + "Inter" (crisp body), generous rounded corners (rounded-2xl), soft warm shadows, and Lucide icons with amber/coral accents | ✓ |
| Outfit + DM Sans | Google Font "Outfit" paired with "DM Sans", medium rounded corners (rounded-xl) | |
| You decide | | |

**User's choice:** Google Fonts "Plus Jakarta Sans" + "Inter", rounded-2xl corners, soft warm shadows, and Lucide icons with amber/coral accents.
**Notes:** Harmonizes modern SaaS typography with approachable community warmth.

---

## Backend Build Tool & Directory Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Maven in /backend & Vite in /frontend | Maven (pom.xml with Spring Boot 3.3.x, Java 21) in `/backend` and Vite React 19 in `/frontend` — standard, widely compatible, zero Gradle daemon quirks on Windows | ✓ |
| Gradle with Kotlin DSL | `build.gradle.kts` in `/backend` and Vite React 19 in `/frontend` | |
| Gradle with Groovy DSL | `build.gradle` in `/backend` and Vite React 19 in `/frontend` | |
| You decide | | |

**User's choice:** Maven (pom.xml with Spring Boot 3.3.x, Java 21) in `/backend` and Vite React 19 in `/frontend`
**Notes:** Standardized on Java 21 + Spring Boot 3.3.x and React 19.

---

## Database Schema Management

| Option | Description | Selected |
|--------|-------------|----------|
| Flyway SQL migrations | Flyway SQL migrations (db/migration/V1__init_schema.sql) with JPA `ddl-auto: validate` — deterministic, audit-ready, enforces foreign keys, indexes, and precision for credit ledger | ✓ |
| Hibernate auto-DDL | `ddl-auto: update` with JPA entities and CommandLineRunner seeder | |
| You decide | | |

**User's choice:** Flyway SQL migrations (db/migration/V1__init_schema.sql) with JPA `ddl-auto: validate`
**Notes:** Ensures strict, version-controlled schema evolution critical for financial/credit ledger integrity.

---

## Local Database Environment

| Option | Description | Selected |
|--------|-------------|----------|
| Root docker-compose.yml + flexible env | Root `docker-compose.yml` provisioning PostgreSQL 16 on port 5432, plus flexible application.yml defaults (host, port, credentials customizable via environment variables) | ✓ |
| Local PostgreSQL only | Configure application.yml targeting local postgresql service at localhost:5432/skillswap | |
| Docker Compose with PostgreSQL + pgAdmin | Includes pgAdmin container for browser inspection | |
| You decide | | |

**User's choice:** Root `docker-compose.yml` provisioning PostgreSQL 16 on port 5432, plus flexible application.yml defaults.
**Notes:** Zero-friction local setup for development and testing.

---

## API Architecture & Dev Proxy

| Option | Description | Selected |
|--------|-------------|----------|
| /api/v1 + CORS + Health + Vite Proxy | Base path `/api/v1`, Spring Web CORS configuration allowing `http://localhost:5173`, dedicated `/api/v1/health` endpoint returning DB connectivity status, plus Vite dev proxy configuration for seamless local requests | ✓ |
| Standard /api/v1 with CORS only | No Vite proxy, direct CORS calls from frontend | |
| You decide | | |

**User's choice:** Base path `/api/v1`, Spring Web CORS allowing `http://localhost:5173`, dedicated `/api/v1/health` endpoint returning DB connectivity status, plus Vite dev proxy configuration.
**Notes:** Ensures robust dev ergonomics and health verification for Phase 1 success criteria.

---

## The Agent's Discretion

- Spring Boot package layout details (`com.skillswap.platform.*`).
- Color hex values for cream and amber/coral palette in Tailwind CSS theme extension.
- Default HikariCP connection pool settings.

## Deferred Ideas

- None — discussion stayed strictly within Phase 1 foundation boundaries.
