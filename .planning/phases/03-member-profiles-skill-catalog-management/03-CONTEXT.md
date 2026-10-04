# Phase 3 Context: Member Profiles & Skill Catalog Management

## 1. Executive Summary
Phase 3 enables SkillSwap members to build complete community identities, browse a categorized skill catalog, specify skills they can teach (with experience badges) and skills they want to learn, and view public member profiles. This establishes the essential profile and catalog dataset needed by downstream search, matching, and exchange request phases.

---

## 2. Locked Design Decisions

| ID | Decision | Specific Details |
|---|---|---|
| **D-301** | **Curated Catalog + Custom Skills** | Flyway migration `V2__seed_skills.sql` seeds 36 standard skills across 6 core categories (`Technology`, `Languages`, `Arts & Design`, `Academics`, `Trades & Practical`, `Health & Wellness`). Users can search existing skills or dynamically create custom skills if not present in the catalog. |
| **D-302** | **Guided Onboarding Wizard** | Post-registration flow offers `/onboarding` (2-step modal or stepper: Step 1 = Bio, Location, Avatar; Step 2 = Add offered & wanted skills). Includes a "Skip for now" action directing straight to `/dashboard`. |
| **D-303** | **3-Tier Skill Experience Levels** | Offered skills require an experience level (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`). Wanted skills are saved as topic interest tags without experience requirements. Dual persona supported: users have both sets of skills simultaneously. |
| **D-304** | **URL Routing Structure** | `/profile` for personal profile view and editing; `/members/:id` for public member profiles (with "Request Skill Exchange" CTA); `/onboarding` for initial skill selection. |
| **D-305** | **Avatar Picker & Fallback** | 8 diverse illustrated SVG community avatar presets + custom image URL input + colored initials fallback avatar. |
| **D-306** | **Atomic CRUD APIs** | Dedicated REST endpoints for profile update (`PUT /api/v1/profile/me`), public profile view (`GET /api/v1/members/{id}`), skill search (`GET /api/v1/skills`), and user skills management (`POST`, `DELETE /api/v1/profile/skills`). |

---

## 3. Skill Catalog Categories & Seed Plan

### Predefined Categories (6 Core Domains)
1. **Technology:** Web Development, Python Programming, Mobile Apps, UI/UX Design, Data Analysis, Cybersecurity
2. **Languages:** Spanish, English Conversation, French, Mandarin, Japanese, German
3. **Arts & Design:** Graphic Design, Digital Photography, Video Editing, Guitar, Piano, Illustration
4. **Academics:** Calculus & Algebra, Physics, Chemistry, Essay Writing, SAT/ACT Prep, Economics
5. **Trades & Practical:** Home Repairs, Bicycle Maintenance, Gardening & Urban Farming, Cooking & Baking, Woodworking, Sewing & Alterations
6. **Health & Wellness:** Yoga, Personal Fitness, Mindfulness & Meditation, Nutrition & Meal Prep, Pilates, Martial Arts

---

## 4. Architectural Boundaries & Data Flow

### Backend
- **Entities & Tables:**
  - `skills` (`id`, `name`, `category`, `created_at`)
  - `user_skills` (`id`, `user_id`, `skill_id`, `type` [`OFFERED`, `WANTED`], `experience` [`BEGINNER`, `INTERMEDIATE`, `ADVANCED`], `created_at`)
  - `users` update (`bio`, `location`, `avatar_url`)
- **Controllers & Endpoints:**
  - `SkillController`: `GET /api/v1/skills`, `POST /api/v1/skills`
  - `ProfileController`: `GET /api/v1/profile/me`, `PUT /api/v1/profile/me`, `GET /api/v1/members/{id}`
  - `UserSkillController`: `GET /api/v1/profile/skills`, `POST /api/v1/profile/skills`, `DELETE /api/v1/profile/skills/{id}`

### Frontend
- **Pages & Components:**
  - `frontend/src/pages/Onboarding.jsx`: 2-step setup wizard
  - `frontend/src/pages/ProfileEdit.jsx`: Personal settings & skills manager
  - `frontend/src/pages/MemberProfile.jsx`: Public member profile page at `/members/:id`
  - `frontend/src/components/profile/AvatarPicker.jsx`: Preset selector & URL input
  - `frontend/src/components/profile/SkillSelector.jsx`: Searchable category catalog picker + custom skill creator
  - `frontend/src/components/profile/SkillBadge.jsx`: Experience badge indicator

---

## 5. Security & Invariant Guarantees
- **Authorization Check:** Users can only update their own profile and add/delete their own `user_skills`; unauthorized updates to other user IDs are rejected with HTTP 403 Forbidden.
- **Uniqueness Invariant:** Duplicate user skills are guarded by database constraint `uq_user_skill_type(user_id, skill_id, type)`.
- **Public Disclosure Hygiene:** Public member profile endpoint `GET /api/v1/members/{id}` returns name, bio, location, avatar, member since, and skills, but never exposes email, password hashes, or private wallet details.
