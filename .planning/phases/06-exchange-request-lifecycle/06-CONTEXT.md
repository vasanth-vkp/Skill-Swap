# Phase 6 Context: Exchange Request Lifecycle

## Phase Boundary
Deliver the end-to-end service exchange request workflow:
- Requester initiates an exchange request specifying skill, proposed duration, and notes.
- System validates requester balance, prevents self-requests, and verifies provider skill offer.
- Provider accepts or rejects incoming requests.
- Requester can cancel pending outgoing requests.
- Dedicated `/exchanges` management dashboard with segmented Incoming / Outgoing tabs, status badges, and action buttons.

---

## Architectural Decisions

### D-601: Credit Balance Verification Strategy
- Server validates that `requester.wallet.balance >= duration` when the request is created.
- Credits are **not** locked or deducted into escrow at request time. This preserves member liquidity while ensuring members only initiate exchanges they can afford.
- Final atomic credit deduction and provider grant execute at service completion in Phase 9.

### D-602: Request Initiation UX & Modal
- `RequestExchangeModal.jsx` reusable modal accessible from:
  - Public Member Profile (`/members/:id`) via "Request Skill Exchange" button.
  - Explore Cards and Dashboard Recommendation Cards.
- Form inputs:
  - Selected skill: Dropdown populated dynamically with provider's offered skills.
  - Duration picker: Quick chips (1.0 hr, 1.5 hr, 2.0 hr, 3.0 hr) with custom number input (step 0.5, min 0.5, max 8.0).
  - Notes: Textarea for personal introduction, learning goals, or preferred times.
- Balance preview: Displays current available credits and confirms `Cost: X.X Credits (1 hr = 1 credit)`.

### D-603: Dual-Persona Exchanges Management Dashboard (`/exchanges`)
- Dedicated `/exchanges` route with dual-persona segmentation:
  - **Incoming Requests Tab** (As Provider): Exchanges requested by other members to learn from me. Shows requester avatar, name, requested skill, proposed duration, notes, and actions: `Accept` and `Reject`.
  - **Outgoing Requests Tab** (As Requester): Exchanges I sent to other providers. Shows provider avatar, name, skill, duration, status badge, and action: `Cancel Request` (available when `PENDING`).
- Filter pills: `All`, `Pending`, `Accepted`, `Past` (`REJECTED`, `CANCELLED`, `COMPLETED`).
- Empty states tailored to each tab with contextual CTAs (e.g. "Browse Skills to Request" or "List More Skills to Teach").

### D-604: State Machine & Strict Authorization Guards
- Status transitions:
  - Initial state: `PENDING`.
  - `PENDING` ➔ `ACCEPTED` (Only the designated provider can accept).
  - `PENDING` ➔ `REJECTED` (Only the designated provider can reject).
  - `PENDING` ➔ `CANCELLED` (Only the original requester can cancel).
  - Attempting to transition from non-`PENDING` states throws a `400 Bad Request` or `409 Conflict`.
- Strict validation rules:
  - Self-request prevention: `requester.id != provider.id` (throws `400 Bad Request`).
  - Provider skill verification: Provider must have an active `OFFERED` skill matching the requested skill ID.
  - Sufficient balance: `requester.wallet.balance >= duration` (throws `400 Bad Request` with clear message).
  - Minimum duration: `duration > 0` (e.g. at least 0.5 hours).

### D-605: REST API Contract
- `POST /api/v1/exchanges`: Create new exchange request (`CreateExchangeRequest { providerId, skillId, duration, notes }`).
- `GET /api/v1/exchanges/incoming`: Fetch all incoming exchange requests for current user (as provider) with optional `status` filter.
- `GET /api/v1/exchanges/outgoing`: Fetch all outgoing exchange requests for current user (as requester) with optional `status` filter.
- `GET /api/v1/exchanges/{id}`: Fetch single exchange detail (only accessible to participant requester or provider).
- `PUT /api/v1/exchanges/{id}/accept`: Provider accepts exchange.
- `PUT /api/v1/exchanges/{id}/reject`: Provider rejects exchange.
- `PUT /api/v1/exchanges/{id}/cancel`: Requester cancels pending exchange.

---

## Data Model Alignment
Matches existing `exchange_requests` table in `V1__init_schema.sql`:
- `id` (BIGSERIAL)
- `requester_id` (BIGINT REFERENCES users)
- `provider_id` (BIGINT REFERENCES users)
- `skill_id` (BIGINT REFERENCES skills)
- `duration` (NUMERIC(5, 2))
- `status` (VARCHAR(50)) - `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`
- `notes` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)

---

## Downstream Plan Structure
- **Plan 06-01**: Backend Exchange Domain (Entity, Repository, Service with state machine validation, DTOs, Controller, Security tests).
- **Plan 06-02**: Frontend Exchange Experience (`exchangeService.js`, `RequestExchangeModal.jsx`, `/exchanges` page with Incoming/Outgoing tabs, cards, status badges, Navbar link, and tests).
