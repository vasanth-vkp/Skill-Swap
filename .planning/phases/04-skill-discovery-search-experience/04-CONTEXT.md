# Phase 4 Context: Skill Discovery & Search Experience

## 1. Executive Summary
Phase 4 implements the discovery engine for SkillSwap: an intuitive, responsive Explore Skills experience at `/explore` where members can search, filter, and discover peer providers across categories, locations, and ratings. This connects the seeded skill catalog and user profiles from Phase 3 to member discovery, preparing the foundation for Phase 5 recommendations and Phase 6 exchange requests.

---

## 2. Locked Design Decisions

| ID | Decision | Specific Details |
|---|---|---|
| **D-401** | **Provider-Centric Result Representation** | Search results represent community members/providers offering matching skills. Each card displays member avatar, name, location, star rating, total review count, and badges for skills offered (with experience levels) and wanted skills. |
| **D-402** | **Sticky Sidebar + Responsive Grid Layout** | Desktop layout features a sticky left sidebar with keyword search, category multi-select pills, location text search, minimum star rating filter (Any, 3.0+, 4.0+, 4.5+), and sort dropdown. Right pane displays active filter pills, total match count, and responsive provider card grid (3 cols on desktop, 2 on tablet, 1 on mobile) with a mobile slide-over filter drawer. |
| **D-403** | **Card Navigation to Public Member Profile** | Clicking a provider card or its primary "View Profile & Request" CTA navigates directly to the member's public profile page at `/members/:id`, where all capabilities and the exchange request CTA are presented. |
| **D-404** | **Backend Multi-Criteria Specification API** | `GET /api/v1/members/search` built with Spring Data JPA `Specification<User>` supporting combined criteria: `keyword` (skill name, member name, bio), `category` (skill category), `location` (city/region), `minRating` (minimum average rating), `sortBy` (`RATING_DESC`, `NEWEST`, `NAME_ASC`), and `Pageable` pagination. |
| **D-405** | **Pagination & Rich Empty State UX** | Standard page navigation (page numbers, Previous/Next buttons, 9 or 12 cards per page). If 0 results match, an aesthetic empty state is displayed with a "Clear all filters" button and suggested popular categories to explore. |

---

## 3. User Experience & Search Journey

1. **Entry:** Member clicks "Explore Skills" in the top navigation bar (`/explore`).
2. **Initial State:** All providers offering at least one skill are displayed, sorted by highest rating or newest members.
3. **Filtering:**
   - **Keyword:** User types in search bar (e.g. "Python", "Spanish", "Guitar") with instant debounced filtering.
   - **Category:** User clicks category pills (Technology, Languages, Arts & Design, Academics, Trades & Practical, Health & Wellness).
   - **Location:** User filters by neighborhood or city (e.g. "Seattle", "Downtown", "Remote").
   - **Rating:** User toggles minimum rating requirement (e.g. 4.0+ Stars).
   - **Sorting:** User selects between "Highest Rated", "Newest Members", or "Name (A–Z)".
4. **Action:** User clicks "View Profile & Request" on a provider card to view `/members/:id` and initiate an exchange request.

---

## 4. Architectural Boundaries & Data Flow

### Backend
- **Repository Layer:**
  - `MemberSpecification`: Dynamic JPA Predicates combining `User` fields (`location`, `averageRating`, `name`, `bio`) and joined `UserSkill` / `Skill` records where `type = OFFERED`.
  - `UserRepository`: Extended with `JpaSpecificationExecutor<User>`.
- **DTOs & Controllers:**
  - `MemberCardDto`: Sanitized card payload containing `id`, `name`, `location`, `avatarUrl`, `bio`, `averageRating`, `totalReviews`, `memberSince`, and `offeredSkills` (list of skill name, category, experience level). Excludes private credentials and wallet balance.
  - `DiscoveryController`: Exposes `GET /api/v1/members/search` returning `Page<MemberCardDto>`.
  - Security: Endpoint is publicly accessible without authentication so visitors can explore the community before registering.

### Frontend
- **Pages & Components:**
  - `frontend/src/pages/ExploreSkills.jsx`: Main search and discovery page at `/explore`.
  - `frontend/src/components/discovery/FilterSidebar.jsx`: Sticky filter panel (category pills, location input, rating selector, sort options, reset button).
  - `frontend/src/components/discovery/ProviderCard.jsx`: Card component showcasing provider info, rating stars, skill badges, and CTA.
  - `frontend/src/components/discovery/ActiveFilters.jsx`: Removable chip tags for active filters + result counter.
  - `frontend/src/services/discoveryService.js`: API client for `/api/v1/members/search`.
- **Navigation:**
  - Route `/explore` registered in `App.jsx` and wired into `Navbar.jsx`.

---

## 5. Security & Privacy Guarantees
- **Sanitized Search Projections:** Search endpoint strictly projects `MemberCardDto`, ensuring passwords, emails, roles, and private wallet credit balances are never included in search payloads.
- **SQL Injection Prevention:** All keyword and location filters utilize parameterized JPA Criteria / Specification builders with wildcard escaping.
- **Pagination Denial-of-Service Guard:** Maximum page size capped at 50 records per request to prevent memory exhaustion attacks.
