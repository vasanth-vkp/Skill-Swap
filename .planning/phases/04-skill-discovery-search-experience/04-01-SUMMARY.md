# Plan 04-01 Summary: Backend Discovery Engine

## Overview
Implemented the backend discovery engine for SkillSwap: added schema rating columns and indexes via Flyway V3, implemented multi-criteria JPQL provider search joining `User`, `UserSkill` (`type = 'OFFERED'`), and `Skill`, built `DiscoveryService` with `Page<MemberCardDto>` privacy sanitization, exposed public REST endpoint `GET /api/v1/members/search`, and validated with 6 MockMvc integration tests.

## Key Changes
1. **Flyway Migration V3 (`backend/src/main/resources/db/migration/V3__add_member_rating_columns.sql`):**
   - Added `average_rating NUMERIC(3, 2) DEFAULT 5.00` and `total_reviews INT DEFAULT 0` to `users`.
   - Created B-Tree indexes: `idx_users_rating` and `idx_users_location`.
2. **Entity & Repository Updates (`User.java`, `UserRepository.java`):**
   - `User`: Added `averageRating` (default 5.0) and `totalReviews` (default 0) with getters and setters.
   - `UserRepository`: Implemented `searchProviders` JPQL query with `countQuery` joining `User`, `UserSkill` (`type = 'OFFERED'`), and `Skill`, supporting dynamic keyword, category, location, and minimum rating filtering.
3. **Discovery DTO & Services (`com.skillswap.platform.discovery`):**
   - `MemberCardDto`: Projections containing public details (`id`, `name`, `bio`, `location`, `avatarUrl`, `averageRating`, `totalReviews`, `memberSince`, `offeredSkills`, `wantedSkills`), strictly omitting `email`, `passwordHash`, `role`, and `walletBalance`.
   - `DiscoveryService`: Handles sorting (`RATING_DESC`, `NEWEST`, `NAME_ASC`), page size bounding (max 50 to prevent DoS), parameter trimming, and DTO mapping.
   - `DiscoveryController`: Exposes `GET /api/v1/members/search` returning `Page<MemberCardDto>`.
   - `SecurityConfig`: Permitted public GET access to `/api/v1/members/**`.
4. **Integration Testing (`DiscoveryControllerTest.java`):**
   - 6 MockMvc tests covering paginated provider search, category filter, location & keyword search, minimum rating threshold, ascending name sorting, and privacy data sanitization.
   - Full backend test suite: 25/25 tests passing (0 failures, 0 errors).

## Requirements Covered
- **DISC-01:** Keyword search matching skill names, provider names, and user bios.
- **DISC-02:** Multi-criteria filtering by skill category, provider location, and minimum average rating.
- **DISC-03:** Provider card projection data structure with offered skills and experience levels.
