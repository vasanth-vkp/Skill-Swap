# Phase 4 Research: Skill Discovery & Search Experience

## Executive Summary
Phase 4 builds the core discovery and search capability of SkillSwap. Members and visitors must be able to explore the community at `/explore` through full multi-criteria search: keyword search (matching skills, provider name, or bio), category filters (6 core catalog domains), location filtering, minimum star rating threshold, and sorting (highest rated, newest, alphabetical), served via server-side pagination with clean provider cards.

---

## 1. Domain & Architecture Analysis

### Current Schema Baseline
- **`users` Table:**
  - Contains `id`, `name`, `email`, `password_hash`, `bio`, `location`, `role`, `avatar_url`, `created_at`.
  - To support fast, indexed filtering by rating and sorting without joins on every row:
    - Add `average_rating NUMERIC(3, 2) DEFAULT 5.00` and `total_reviews INT DEFAULT 0` via Flyway migration `V3__add_member_rating_columns.sql`.
    - Add B-Tree indexes: `idx_users_rating ON users(average_rating)` and `idx_users_location ON users(location)`.
- **`skills` & `user_skills` Tables:**
  - `skills`: `id`, `name`, `category`, `created_at`. Indexed on `category`.
  - `user_skills`: `id`, `user_id`, `skill_id`, `type` (`OFFERED`, `WANTED`), `experience` (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`). Indexed on `user_id` and `skill_id`.

### Query Architecture: Spring Data JPA
- In `UserRepository`:
  - Execute a JPQL query joining `User` to `UserSkill` (`type = 'OFFERED'`) and `Skill` with optional criteria:
    - `(:category IS NULL OR :category = '' OR LOWER(s.category) = LOWER(:category))`
    - `(:location IS NULL OR :location = '' OR LOWER(u.location) LIKE LOWER(CONCAT('%', :location, '%')))`
    - `(:minRating IS NULL OR u.averageRating >= :minRating)`
    - `(:keyword IS NULL OR :keyword = '' OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.bio) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')))`
  - `Page<User> searchProviders(...)` with Spring Data `Pageable` handles count queries, limits, and dynamic ordering (`averageRating DESC`, `createdAt DESC`, `name ASC`).
- Service Layer (`DiscoveryService`):
  - Fetches the `Page<User>` and aggregates each provider's offered skills and wanted skills via `UserSkillService`.
  - Maps to `MemberCardDto` records with zero credential leakage.

### Security & Privacy Protections (Threat Modeling)
- **T-04-01 (SQL Injection in Free-text Search):** JPA parameter binding (`:keyword`, `:location`) and sanitized wildcard concatenation prevent SQL injection.
- **T-04-02 (Credential Leakage in Discovery Results):** `MemberCardDto` explicitly includes only public fields (`id`, `name`, `bio`, `location`, `avatarUrl`, `averageRating`, `totalReviews`, `memberSince`, `offeredSkills`, `wantedSkills`). Email, password hash, role, and wallet balance are strictly excluded.
- **T-04-03 (Pagination DoS / Memory Exhaustion):** Maximum page size enforced (capped at 50) in `DiscoveryController` to prevent out-of-memory queries.

---

## 2. Frontend UX & Component Architecture

### Layout Strategy
- **Sticky Filter Sidebar (`FilterSidebar.jsx`):**
  - Instant category multi-select pill buttons for the 6 domains + "All Categories".
  - Search input with clear button.
  - Location input with pin icon.
  - Minimum rating radio selector: Any, 3.0+, 4.0+, 4.5+ with star icons.
  - Sort dropdown: Highest Rated, Newest Members, Name (A–Z).
  - "Reset All Filters" button.
- **Header & Active Filter Chips (`ActiveFilters.jsx`):**
  - Displays total matching provider count (e.g., "Showing 12 members").
  - Dismissible filter tags for active filters (e.g., `Category: Technology ✕`).
- **Responsive Provider Grid (`ExploreSkills.jsx`):**
  - 3 columns on desktop, 2 on tablet, 1 on mobile.
  - Empty state with warm illustration, "No members match your criteria", and popular category quick-links.
- **Provider Card (`ProviderCard.jsx`):**
  - Member avatar with SVG presets and fallback initials.
  - Location tag with map pin.
  - Star rating badge + review count.
  - Truncated bio (2 lines).
  - Offered skills badges with category color pills and experience level indicators (`Intermediate`, `Advanced`).
  - Primary button: "View Profile & Request" navigating directly to `/members/:id`.
- **Navigation Integration:**
  - Route `/explore` configured in `App.jsx`.
  - `Navbar.jsx` updated to route "Explore Skills" to `/explore`.

---

## 3. Verification & Testing Strategy

### Backend Tests
- `DiscoveryControllerTest`:
  - `GET /api/v1/members/search` returns paginated providers with offered skills.
  - Category filtering correctly narrows results to providers offering skills in that category.
  - Location filtering returns only matching providers.
  - Minimum rating filter excludes providers below threshold.
  - Keyword search matches by skill name, user name, and bio.
  - Response payload confirms absence of sensitive credentials (`email`, `passwordHash`, `role`, `walletBalance`).

### Frontend Tests
- `FilterSidebar.test.jsx`:
  - Renders all 6 category filters, location input, and rating options.
  - Triggers filter change callbacks when inputs are updated.
- `ProviderCard.test.jsx`:
  - Displays member name, location, rating, and offered skill badges with experience levels.
  - Renders "View Profile & Request" link pointing to `/members/:id`.
- `ExploreSkills.test.jsx`:
  - Loads and displays provider cards from `discoveryService`.
  - Displays empty state when 0 members match.
  - Handles page navigation.

---

## 4. Implementation Wave Breakdown

- **Wave 1 (Plan 04-01 - Backend Discovery Engine):**
  - Flyway migration `V3__add_member_rating_columns.sql`.
  - `User.java` updated with `averageRating` and `totalReviews`.
  - `UserRepository` JPQL search query with `Pageable`.
  - `MemberCardDto` projection.
  - `DiscoveryService` and `DiscoveryController` (`GET /api/v1/members/search`).
  - `SecurityConfig` allowing public `GET /api/v1/members/search`.
  - `DiscoveryControllerTest` with MockMvc.

- **Wave 2 (Plan 04-02 - Frontend Explore Skills Page & Wiring):**
  - `discoveryService.js` client.
  - `ProviderCard.jsx`, `FilterSidebar.jsx`, `ActiveFilters.jsx`.
  - `ExploreSkills.jsx` page with responsive grid and pagination.
  - Route `/explore` in `App.jsx` and updated link in `Navbar.jsx`.
  - Unit and component tests in Vitest.
