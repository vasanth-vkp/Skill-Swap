# Phase 5 Research: Matching & Recommendation Engine

## Executive Summary
Phase 5 implements the compatibility and recommendation engine for SkillSwap. Using mathematical multi-factor scoring (`0.4*Skill + 0.2*Location + 0.15*Availability + 0.15*Rating + 0.1*Experience`) combined with a deterministic domain semantic taxonomy and mutual exchange detection, the system identifies optimal peer providers for each authenticated member and showcases them on the Dashboard (`/dashboard`).

---

## 1. Mathematical Compatibility Model (MATCH-01)

### Compatibility Formula
The composite compatibility score between a requester $R$ and a provider $P$ is calculated as:
$$\text{Score} = 0.40 \cdot S(R, P) + 0.20 \cdot L(R, P) + 0.15 \cdot A(P) + 0.15 \cdot Rtg(P) + 0.10 \cdot Exp(P, s)$$

Where:
1. **$S(R, P)$ (Skill Alignment, 40%):**
   - Exact Match: If $P$ offers a skill $s$ that $R$ wants: $1.0$.
   - Semantic/Synonym Match: If $P$ offers a known synonym or complementary pairing for a skill $R$ wants: $0.85$.
   - Domain Category Match: If $P$ offers a skill in the same domain category as a skill $R$ wants: $0.70$.
   - No Match: $0.0$.
   - **Mutual Exchange Bonus:** If $R$ also offers a skill that $P$ wants, the pair is flagged with `isMutualMatch = true` and receives a $+0.10$ synergy bonus (capped at $1.0$).
2. **$L(R, P)$ (Location Alignment, 20%):**
   - Same city/location (case-insensitive substring or match): $1.0$.
   - Either $R$ or $P$ location is `"Remote"`: $0.90$.
   - Different physical locations: $0.20$.
3. **$A(P)$ (Availability, 15%):**
   - Active platform member: $1.0$.
4. **$Rtg(P)$ (Rating Score, 15%):**
   - $\frac{\text{averageRating}}{5.0}$ (e.g. $5.0 \to 1.0$, $4.5 \to 0.90$, $4.0 \to 0.80$).
5. **$Exp(P, s)$ (Experience Level, 10%):**
   - $P$'s proficiency in skill $s$: `ADVANCED` $\to 1.0$, `INTERMEDIATE` $\to 0.75$, `BEGINNER` $\to 0.50$, unspecified $\to 0.50$.

The resulting floating-point score in $[0.0, 1.0]$ is converted into an integer percentage: $\text{Math.round}(\text{Score} \cdot 100)$.

---

## 2. Deterministic Domain Semantic Taxonomy (MATCH-03)

### Built-in Semantic Pairings & Synonyms
To achieve zero-latency, deterministic execution without external API billing or token limits, `SemanticSkillMatcher` embeds a curated graph of skill relationships:
- **Synonyms & Aliases:**
  - `"Python"` ↔ `"Python Programming"`
  - `"Coding"`, `"Programming"`, `"Full-Stack"` ↔ `"Web Development"`
  - `"Math"`, `"Algebra"`, `"Math Tutoring"` ↔ `"Calculus & Algebra"`
  - `"Design"`, `"Branding"` ↔ `"Graphic Design"`, `"UI/UX Design"`
  - `"Fitness"`, `"Workout"`, `"Gym"` ↔ `"Personal Fitness"`
  - `"Cooking"`, `"Culinary"`, `"Food"` ↔ `"Cooking & Baking"`
  - `"English"`, `"ESL"` ↔ `"English Conversation"`
- **Complementary Pairings (Cross-Skill Synergy):**
  - `Web Development` ↔ `UI/UX Design`, `Graphic Design`
  - `Python Programming` ↔ `Data Analysis`, `Cybersecurity`
  - `Spanish` ↔ `English Conversation`, `French`
  - `Calculus & Algebra` ↔ `Physics`, `Economics`
  - `Cooking & Baking` ↔ `Nutrition & Meal Prep`
  - `Digital Photography` ↔ `Video Editing`, `Graphic Design`
  - `Mindfulness & Meditation` ↔ `Yoga`, `Pilates`

---

## 3. Architecture & Data Flow

### Backend Layer
- `SemanticSkillMatcher`: Pure Java domain component calculating skill similarity score $[0.0, 1.0]$.
- `CompatibilityCalculator`: Evaluates multi-factor formula and collects human-readable reason strings (e.g., `"Matches wanted skill: Python Programming"`, `"Mutual exchange partner"`, `"Both located in Seattle"`).
- `RecommendationService`:
  - Finds all candidate providers ($P \neq R$ who offer at least 1 skill).
  - Evaluates compatibility for each candidate against $R$'s wanted skills.
  - Detects reciprocal mutual matches ($R \leftrightarrow P$).
  - Sorts candidates by `isMutualMatch` DESC, `compatibilityPercentage` DESC, `rating` DESC.
  - Limits output to top 6 `RecommendationDto` items.
  - Graceful fallback: If $R$ has 0 wanted skills, recommends top-rated providers in diverse categories.
- `RecommendationController`: Exposes `GET /api/v1/recommendations/me` (requires JWT authentication).

### Frontend Layer
- `recommendationService.js`: Calls `GET /api/v1/recommendations/me`.
- `RecommendationCard.jsx`:
  - Displays match percentage badge (`96% Match` in emerald green).
  - Special `Mutual Match` badge with swap icon when `isMutualMatch = true`.
  - Matched skill pill with experience badge.
  - Match reason bullets.
  - Provider avatar, name, location, and rating.
  - CTA button: "Request Exchange" linking to `/members/:id`.
- `Dashboard.jsx`:
  - Renders "Recommended Matches For You" card grid right below the credit balance stats.
  - Loading skeleton state while fetching.
  - Empty state with link to Explore page if 0 recommendations.

---

## 4. Threat Model & Security Controls

| Threat ID | Category | Component | Severity | Mitigation Plan |
|-----------|----------|-----------|----------|-----------------|
| T-05-01 | Unauthorized Access | `/api/v1/recommendations/me` | high | Spring Security enforces JWT authentication; recommendations strictly derived from authenticated user context |
| T-05-02 | Information Disclosure | `RecommendationDto` | high | DTO excludes private emails, password hashes, roles, and wallet credit balances |
| T-05-03 | Denial of Service | Recommendation Engine | medium | O(N) evaluation over community members with early pruning; limited to top 6 results |
