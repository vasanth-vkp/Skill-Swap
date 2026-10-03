# SkillSwap — Practical Hackathon Solution
**SkillSwap: Exchange Skills, Not Money**
**Hackathon MVP | Full-Stack Web Application | AI-Assisted Matching | Time-Credit Economy**

## Objective
Build a functional web application where people can exchange skills using time credits instead of money, discover suitable community members, complete service requests, and build trust through ratings.

Focus on making one complete skill exchange work reliably from beginning to end, rather than building an entire social network.

---

## 1. Main Problem We Are Solving
People possess valuable skills but often cannot access the services they need because of financial constraints, lack of connections, or difficulty finding trustworthy people.

For example:
- A student knows mathematics but needs help repairing a laptop.
- A technician can repair laptops but wants to learn English.
- A teacher can teach English but needs assistance with household repairs.

### Solution
Create a digital skill-exchange community where:
1. Users list skills they offer.
2. Users list skills they need.
3. The platform finds compatible members.
4. Users exchange services using time credits (1 hour of service = 1 time credit, regardless of skill).
5. Completed exchanges update credit balance atomically.
6. Ratings and reviews build community trust.

---

## 2. Target Users & User Roles
### Target Users
- Students (e.g. math for coding)
- Working professionals (technical exchange)
- Freelancers (design, coding, marketing)
- Homemakers (cooking, tutoring, practical tasks)
- Retired professionals (mentoring, advice)
- Local community members (everyday skills)

### User Roles
- **Member:** Can offer skills, request services, earn credits, spend credits, and leave reviews. Every member can be both provider and requester.
- **Admin:** Can view users, moderate reported content, and manage platform activity.

---

## 3. Core Modules
1. **Skill Discovery:** Find community members by skills, location, availability, and ratings.
2. **Skill Exchange:** Request, accept, schedule, and complete services through structured lifecycle.
3. **Time-Credit Wallet:** Earn and spend credits based on time spent providing services.
4. **Trust & Reputation:** Ratings and reviews after completed exchanges.

---

## 4. MVP Requirements & Core Features
### Must-Have Features
| Feature | Implementation |
|---|---|
| Authentication | Register, login, logout with JWT |
| User Profile | Name, bio, location, profile image |
| Skill Management | Add/remove skills offered and skills wanted |
| Skill Discovery | Search and filter members |
| Matching | Recommend users with compatible skills |
| Exchange Requests | Send, accept, reject, and cancel requests |
| Booking | Select date, time, and duration |
| Completion | Confirm service delivery |
| Time-Credit Wallet | Display balance and transaction history |
| Credit Transfer | Automatically transfer credits atomically upon completion |
| Ratings | Submit review after completed exchange |
| Dashboard | Display balance, requests, bookings, and recommendations |

### Initial Credit Allocation
- Every new user receives **5 time credits** as an initial grant.
- Backend, not frontend, calculates and updates credits. Users cannot edit balance.

---

## 5. Nice-to-Have Features
- **AI semantic matching** (High priority for MVP+: complementary needs & semantic similarity)
- **In-app notifications** (High priority: request status updates)
- Smart availability suggestions (Medium)
- AI skill-description generator (Medium)
- Admin analytics (Medium)
- Skill verification (Medium)
- Multilingual interface (Medium)
- Community groups (Low)
- Gamification / badges (Low)
- AI chatbot (Low)

---

## 6. Complete User Flow & Exchange Lifecycle
### Exchange Lifecycle
- `PENDING`: Request sent, awaiting provider response.
- `ACCEPTED`: Provider agreed to request.
- `SCHEDULED`: Date/time/duration agreed.
- `IN_PROGRESS`: Service underway.
- `COMPLETED`: Both participants confirm completion; backend transfers credits atomically.
- Terminal alternatives: `REJECTED`, `CANCELLED`, `DISPUTED`.

---

## 7. Required Pages (9 Pages)
1. **Landing Page:** Hero, how it works, example skill exchanges, time credit explanation, CTA.
2. **Authentication:** Register & Login forms with validation.
3. **Onboarding / Profile Setup:** Name, bio, location, offered/wanted skills, availability.
4. **Dashboard:** Balance, request summaries, upcoming bookings, recommended members, recent activity.
5. **Explore Skills:** Search bar, category filters, location filters, rating filters, provider cards.
6. **User Profile:** Profile info, offered/wanted skills, experience, ratings/reviews, request exchange button.
7. **Exchange Management:** Incoming/outgoing requests, accept/reject/cancel, booking status, completion confirmation.
8. **Time-Credit Wallet:** Current balance, credits earned/spent, transaction history ledger.
9. **Reviews:** Rating form, written feedback, historical reviews.
*(Booking form can be a modal or part of Exchange Management).*

---

## 8. Tech Stack & Architecture
- **Architecture:** Modular Monolith (Spring Boot backend + React SPA frontend + PostgreSQL).
- **Frontend:** React 19 / Vite, Tailwind CSS, React Router, Axios, Lucide icons.
- **Backend:** Java / Spring Boot 3.x (Spring Security, JWT, Spring Data JPA, Bean Validation).
- **Database:** PostgreSQL (with transactional ledger for wallets).
- **Matching:** Rule-based matching with weighted scoring `0.4*Skill + 0.2*Location + 0.15*Availability + 0.15*Rating + 0.1*Experience`, with AI semantic matching extension.

---

## 9. Database Entities (PostgreSQL)
1. `users` (id, name, email, password_hash, bio, location, role, created_at)
2. `skills` (id, name, category)
3. `user_skills` (id, user_id, skill_id, type [OFFERED/WANTED], experience)
4. `exchange_requests` (id, requester_id, provider_id, skill_id, duration, status, notes, created_at)
5. `bookings` (id, request_id, start_time, end_time, status)
6. `wallets` (id, user_id, balance, updated_at)
7. `credit_transactions` (id, exchange_id, sender_id, receiver_id, amount, type, created_at)
8. `reviews` (id, exchange_id, reviewer_id, reviewee_id, rating, comment, created_at)
9. `notifications` (id, user_id, message, type, is_read, created_at)

---

## 10. Development Sequence
Authentication → Profiles → Skills → Matching → Exchange Requests → Booking → Completion → Credit Ledger → Reviews → UI Polish → AI Enhancements
