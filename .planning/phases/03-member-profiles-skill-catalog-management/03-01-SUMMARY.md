# Plan 03-01 Summary: Backend Skill Catalog & Member Profile Management

## Overview
Implemented backend skill catalog management, Flyway seed migration with 36 curated standard skills, personal profile management, dual-persona offered/wanted user skills with 3-tier experience levels, and sanitized public member profile views.

## Key Changes
1. **Catalog Seeding & Repository (`backend/src/main/resources/db/migration/V2__seed_skills.sql`):**
   - Seeded 36 standard skills across 6 core domains: Technology, Languages, Arts & Design, Academics, Trades & Practical, Health & Wellness with `ON CONFLICT (name) DO NOTHING`.
   - `Skill`: JPA entity mapped to `skills` table.
   - `SkillRepository`: Added case-insensitive name, category, and keyword search methods.
   - `SkillService`: Provides category/keyword filtered querying and transparent `getOrCreateSkill` for custom skills.
   - `SkillController`: Exposes `GET /api/v1/skills` and `POST /api/v1/skills` (201 Created).
2. **User Skills Management (`com.skillswap.platform.profile`):**
   - `UserSkill`: JPA entity mapped to `user_skills` table with unique constraint `uq_user_skill_type(user_id, skill_id, type)`.
   - `UserSkillRepository`: Provides queries by user and type, duplicate checks, and ownership-enforced deletion.
   - `UserSkillService`: Handles adding offered skills (with `BEGINNER`, `INTERMEDIATE`, `ADVANCED` experience levels) and wanted skills as interest tags; enforces 409 Conflict duplicate checks and ownership validation on deletion.
3. **Profile Service & Public Member Endpoints:**
   - `ProfileService`: Fetches current user profile with offered/wanted skills; handles partial bio, location, avatar updates; delivers sanitized public member profiles.
   - `ProfileController`: Exposes `GET /api/v1/profile/me`, `PUT /api/v1/profile/me`, `GET /api/v1/profile/skills`, `POST /api/v1/profile/skills`, `DELETE /api/v1/profile/skills/{id}`, and public `GET /api/v1/members/{id}`.
   - `SecurityConfig`: Configured to permit public access to `GET /api/v1/skills/**` and `GET /api/v1/members/**`, while requiring authentication for `/api/v1/profile/**`.

## Verification
- Unit & MockMvc tests executed:
  - `SkillControllerTest`: 4/4 passed (catalog retrieval, category filter, keyword search, custom skill creation).
  - `ProfileControllerTest`: 4/4 passed (personal profile retrieval, bio/location/avatar update, offered/wanted skills creation with experience levels, and public member sanitation).
  - Full backend test suite: 19/19 tests passed with 0 failures and 0 errors.

## Requirements Covered
- **PROF-01:** Member profile management (name, bio, location, avatar).
- **PROF-02:** Predefined skill catalog seeded and searchable across 6 domains, with custom skill creation.
- **PROF-03:** Member can add/remove offered skills with experience levels.
- **PROF-04:** Member can add/remove wanted skills.
- **PROF-05:** Public member profile endpoint delivers profile, skills, and ratings without exposing sensitive credentials.
