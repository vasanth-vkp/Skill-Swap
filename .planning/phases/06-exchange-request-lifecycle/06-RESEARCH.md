# Phase 6 Research: Exchange Request Lifecycle

## 1. Domain & Architecture Analysis

### Current Schema Baseline
The `exchange_requests` table was provisioned in `V1__init_schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS exchange_requests (
    id BIGSERIAL PRIMARY KEY,
    requester_id BIGINT NOT NULL REFERENCES users(id),
    provider_id BIGINT NOT NULL REFERENCES users(id),
    skill_id BIGINT NOT NULL REFERENCES skills(id),
    duration NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_exchange_duration CHECK (duration > 0)
);
CREATE INDEX IF NOT EXISTS idx_exchange_requester ON exchange_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_exchange_provider ON exchange_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_exchange_status ON exchange_requests(status);
```

### Business Rules & Invariants
1. **Self-Request Prohibition**: Requester cannot send an exchange request to themselves (`requesterId != providerId`).
2. **Provider Skill Validation**: The requested `skillId` must be actively offered by the `providerId` in `user_skills` (`type = 'OFFERED'`).
3. **Liquidity Check (D-601)**: The requester's current balance in `wallets` must be `>= duration` (1 hour = 1 credit). Credits remain unlocked until actual service completion (Phase 9).
4. **Duration Boundaries**: Duration must be strictly positive (minimum 0.5 hours, maximum 8.0 hours recommended).
5. **State Transition Authority (D-604)**:
   - Initial state on creation is always `PENDING`.
   - Only `providerId` can transition `PENDING ➔ ACCEPTED` or `PENDING ➔ REJECTED`.
   - Only `requesterId` can transition `PENDING ➔ CANCELLED`.
   - Any attempt to modify an exchange that is not in `PENDING` status or by an unauthorized user throws a validation exception (`400 Bad Request` or `403 Forbidden`).

---

## 2. API Design & Data Contracts

### Status Enum
```java
public enum ExchangeStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    CANCELLED,
    SCHEDULED,   // Handled in Phase 7
    COMPLETED,   // Handled in Phase 8
    DISPUTED     // Handled in Phase 8
}
```

### DTOs
- `CreateExchangeRequest`: `{ providerId: Long, skillId: Long, duration: BigDecimal, notes: String }`
- `ExchangeDto`:
  ```json
  {
    "id": 1,
    "requesterId": 10,
    "requesterName": "Alice",
    "requesterAvatar": "...",
    "requesterLocation": "Seattle, WA",
    "providerId": 20,
    "providerName": "Bob",
    "providerAvatar": "...",
    "providerLocation": "Seattle, WA",
    "skillId": 101,
    "skillName": "Python Programming",
    "skillCategory": "Technology",
    "duration": 1.5,
    "status": "PENDING",
    "notes": "Looking to learn basics of Flask",
    "createdAt": "2026-10-04T12:00:00Z",
    "updatedAt": "2026-10-04T12:00:00Z"
  }
  ```

### Controller Endpoints
- `POST /api/v1/exchanges`: Create new request (authenticated).
- `GET /api/v1/exchanges/incoming?status=`: List incoming requests where authenticated user is the provider.
- `GET /api/v1/exchanges/outgoing?status=`: List outgoing requests where authenticated user is the requester.
- `GET /api/v1/exchanges/{id}`: View exchange details (caller must be requester or provider).
- `PUT /api/v1/exchanges/{id}/accept`: Provider marks accepted.
- `PUT /api/v1/exchanges/{id}/reject`: Provider marks rejected.
- `PUT /api/v1/exchanges/{id}/cancel`: Requester marks cancelled.

---

## 3. Frontend Architecture

### Component Hierarchy
- `RequestExchangeModal.jsx`: Modal dialog for selecting offered skill, duration chips (1, 1.5, 2, 3 hrs), writing notes, and checking credit balance.
- `ExchangeCard.jsx`: Clean, responsive card with counterparty info (avatar, name, location), skill badge, duration pill, notes quote, status badge, and action buttons.
- `Exchanges.jsx` (`/exchanges`):
  - Sticky top bar with tabs: `Incoming Requests` (with pending count badge) vs `Outgoing Requests`.
  - Filter pills: `All`, `Pending`, `Accepted`, `Past`.
  - Loading skeleton and rich contextual empty states.
- `Navbar.jsx` & `Dashboard.jsx`: Nav link to `/exchanges` with badge counter for pending incoming requests.
- `MemberProfile.jsx`: "Request Exchange" CTA button opening `RequestExchangeModal`.

---

## 4. Threat & Security Considerations
- **T-06-01 (IDOR / Unauthorized State Mutation):** Enforced in service layer — verify `exchange.providerId == currentUserId` before accepting/rejecting; verify `exchange.requesterId == currentUserId` before cancelling.
- **T-06-02 (Self-Dealing / Self-Request):** Explicitly reject if `requesterId == providerId`.
- **T-06-03 (Negative / Extreme Durations):** Validate `duration >= 0.5` and `duration <= 8.0`.
- **T-06-04 (Insufficient Balance Bypass):** Verify `wallet.balance >= duration` on request creation.
- **T-06-05 (XSS in Request Notes):** Automatic text node escaping via React JSX.
