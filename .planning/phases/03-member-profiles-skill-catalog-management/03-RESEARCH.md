# Phase 3 Research: Member Profiles & Skill Catalog Management

## 1. Domain & Architecture Analysis

### Current State
- **Phase 1 & Phase 2 Complete:** Database schema initialized with Flyway (`users`, `skills`, `user_skills`, `wallets`, `exchange_requests`, `bookings`, `credit_transactions`, `reviews`, `notifications`).
- **Security & User Principal:** JWT filter chain populates `UserPrincipal` with `id`, `email`, `name`, `role`.
- **User Entity:** `User` has `id`, `name`, `email`, `passwordHash`, `bio`, `location`, `role`, `avatarUrl`, `createdAt`.
- **Database Tables for Phase 3:**
  - `skills`: `id`, `name`, `category`, `created_at`
  - `user_skills`: `id`, `user_id`, `skill_id`, `type`, `experience`, `created_at` (with unique constraint `uq_user_skill_type(user_id, skill_id, type)`)

---

## 2. Seed Catalog Design (`V2__seed_skills.sql`)
To support realistic discovery and immediate community matching from day 1, we will seed 36 high-demand skills across 6 standard categories:
1. **Technology:** Web Development, Python Programming, Mobile App Development, UI/UX Design, Data Analysis & SQL, Cybersecurity Basics
2. **Languages:** Spanish Conversation, French for Beginners, Conversational English, Mandarin Chinese, Japanese Basics, German
3. **Arts & Design:** Graphic Design & Branding, Digital Photography, Video Editing & Motion, Acoustic Guitar, Piano & Keyboard, Digital Illustration
4. **Academics:** Calculus & Linear Algebra, High School Physics, General Chemistry, College Essay Writing, SAT & ACT Math Prep, Microeconomics
5. **Trades & Practical:** Home Electrical & Plumbing Repairs, Bicycle Maintenance & Tune-up, Urban Gardening & Composting, Artisan Bread Baking, Basic Woodworking, Sewing & Clothing Alterations
6. **Health & Wellness:** Vinyasa Yoga, Functional Strength Training, Guided Meditation & Breathwork, Nutrition & Meal Prep, Mat Pilates, Self-Defense & Martial Arts

For dynamic custom skills, if a user specifies a skill not already existing in `skills`, `SkillService.getOrCreateSkill(name, category)` handles creation transparently.

---

## 3. Data Contracts & REST APIs

### 1. Skill Catalog Endpoints (`/api/v1/skills`)
- `GET /api/v1/skills?category={cat}&search={q}`
  - Returns `List<SkillDto>`: `id`, `name`, `category`.
- `POST /api/v1/skills`
  - Request: `{ name: String, category: String }`
  - Returns `201 Created` with `SkillDto`.

### 2. User Profile Endpoints (`/api/v1/profile`)
- `GET /api/v1/profile/me`
  - Returns authenticated user's full profile: `userId`, `name`, `email`, `bio`, `location`, `avatarUrl`, `role`, `createdAt`, `offeredSkills: List<UserSkillDto>`, `wantedSkills: List<UserSkillDto>`.
- `PUT /api/v1/profile/me`
  - Request: `{ name: String, bio: String, location: String, avatarUrl: String }`
  - Returns updated `ProfileResponse`.
- `GET /api/v1/profile/skills`
  - Returns current user's skills partitioned or typed.
- `POST /api/v1/profile/skills`
  - Request: `{ skillId: Long (or skillName + category), type: "OFFERED" | "WANTED", experience: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null }`
  - Returns `201 Created` with `UserSkillDto`.
- `DELETE /api/v1/profile/skills/{id}`
  - Deletes user skill owned by authenticated user. Returns `204 No Content`.

### 3. Public Member Profile (`/api/v1/members/{id}`)
- `GET /api/v1/members/{id}`
  - Returns sanitized public profile: `id`, `name`, `bio`, `location`, `avatarUrl`, `memberSince`, `offeredSkills`, `wantedSkills`, `ratingAverage`, `totalReviews`.
  - Excludes `email`, `password_hash`, `balance`, and internal audit logs.

---

## 4. Frontend Experience & Component Architecture

### Component Hierarchy
- `frontend/src/components/profile/`
  - `AvatarPicker.jsx`: Preset selector (8 SVG illustrations) + custom image URL input + preview.
  - `SkillSelector.jsx`: Searchable select with category filtering and inline "Add custom skill" option.
  - `SkillBadge.jsx`: Visual pill tag showing skill name, category badge, and experience level indicator.
- `frontend/src/pages/`
  - `Onboarding.jsx`: 2-step setup wizard after registration (`/onboarding`).
    - Step 1: Personal info (Bio, Location, Avatar).
    - Step 2: Skills configuration (Offered skills with experience, Wanted skills).
    - Action to skip directly to `/dashboard`.
  - `ProfileEdit.jsx`: Accessible at `/profile` for self-management.
  - `MemberProfile.jsx`: Public member profile page at `/members/:id` featuring bio, skill badges, and a prominent "Request Skill Exchange" CTA button.

---

## 5. Security & Verification Plan
- **Ownership Verification:** Verify that `UserSkillService` validates `user_skill.user_id == principal.id` before deletion to prevent IDOR attacks.
- **Data Privacy Hygiene:** Public profile queries must only select safe public columns (`id`, `name`, `bio`, `location`, `avatar_url`, `created_at`).
- **Tests:**
  - Backend MockMvc tests (`SkillControllerTest`, `ProfileControllerTest`).
  - Frontend Vitest tests (`SkillSelector.test.jsx`, `ProfileEdit.test.jsx`).
