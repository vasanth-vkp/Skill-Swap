# Phase 5 Context: Matching & Recommendation Engine

## 1. Executive Summary
Phase 5 implements SkillSwap's intelligent compatibility and recommendation engine. By analyzing complementary member skills, locations, ratings, and experience levels, the platform proactively introduces members to high-synergy exchange partners on their Dashboard (`/dashboard`), surfacing both one-way matches and high-value two-way reciprocal trades.

---

## 2. Locked Design Decisions

| ID | Decision | Specific Details |
|---|---|---|
| **D-501** | **Mathematical Compatibility Scoring Formula** | Composite score: `0.40 * SkillScore + 0.20 * LocationScore + 0.15 * AvailabilityScore + 0.15 * RatingScore + 0.10 * ExperienceScore`.<br>• `SkillScore` (0.40): Exact match = 1.0; Semantic/synonym match = 0.80.<br>• `LocationScore` (0.20): Same city = 1.0; Either Remote = 0.90; Different = 0.20.<br>• `AvailabilityScore` (0.15): Default 1.0 for active members.<br>• `RatingScore` (0.15): `rating / 5.0` (e.g., 5.0 -> 1.0).<br>• `ExperienceScore` (0.10): `ADVANCED` = 1.0, `INTERMEDIATE` = 0.75, `BEGINNER` = 0.50.<br>Scaled to 0–100% integer display. |
| **D-502** | **Deterministic Domain Semantic Engine** | Built-in semantic engine with curated domain taxonomy, aliases, and complementary skill pairings (e.g., "Math" ↔ "Calculus & Algebra", "Coding" ↔ "Python Programming", "Web Development" ↔ "UI/UX Design"). Zero external API key dependencies, deterministic, and 100% offline testable. |
| **D-503** | **Reciprocal "Mutual Match" Elevation** | Two-way compatibility (Requester offers what Provider wants AND Provider offers what Requester wants) receives elevated scoring priority, an `isMutualMatch = true` flag, and a prominent "Mutual Match" badge. |
| **D-504** | **Personalized Recommendations REST Endpoint** | `GET /api/v1/recommendations/me` (authenticated). Returns top 4 to 6 `RecommendationDto` items with score percentage, match reasons list (e.g. `["Teaches Python Programming", "Mutual Exchange Partner", "Located in Seattle"]`), matched skill, and provider details. Gracefully falls back to top-rated providers in popular categories if user has not yet specified wanted skills. |
| **D-505** | **Dashboard Recommendation Showcase** | On `/dashboard`, render a prominent "Recommended Matches For You" section with match score pills (`96% Match`), "Mutual Trade" badges, match reasons, and a direct "Request Exchange" CTA routing to `/members/:id`. |

---

## 3. Data Flow & Architecture

### Backend
- **Domain Service:**
  - `SemanticSkillMatcher`: Evaluates skill alignment (exact match vs. synonym/complementary pairings).
  - `RecommendationService`:
    - Reads current user's offered and wanted skills.
    - Evaluates other members in the system.
    - Computes `CompatibilityScore` and tags match reasons.
    - Identifies mutual exchange opportunities.
    - Sorts descending by compatibility score and limits to top 6.
- **REST Controller:**
  - `RecommendationController`: Exposes `GET /api/v1/recommendations/me`.
  - Projections: `RecommendationDto` containing sanitized public provider details and match telemetry.

### Frontend
- **API Client:** `recommendationService.js` (`getRecommendations()`).
- **UI Components:**
  - `RecommendationCard.jsx`: Card with match percentage badge, "Mutual Match" tag, matched skill details, and CTA.
  - `Dashboard.jsx`: Updated to integrate the recommendation grid right below the wallet balance summary.

---

## 4. Security & Privacy Guarantees
- **Authentication Guard:** Only authenticated members can query `GET /api/v1/recommendations/me` (scoped strictly to the current logged-in user).
- **Sanitized Projections:** Recommendation DTOs strictly project public member fields (name, avatar, location, rating, offered skills) and omit private emails, hashes, and balances.
