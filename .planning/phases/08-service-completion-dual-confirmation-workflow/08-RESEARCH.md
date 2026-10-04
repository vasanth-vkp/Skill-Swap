# Phase 8 Research: Service Completion & Dual Confirmation Workflow

## Domain & Infrastructure Analysis

### 1. Existing Exchange and Booking Infrastructure
- In `ExchangeRequest.java`:
  - `status` uses `ExchangeStatus` enum which already includes `COMPLETED` and `DISPUTED`.
  - `requester` and `provider` reference `User`.
- In `Booking.java`:
  - `status` uses `BookingStatus` enum which already includes `SCHEDULED`, `COMPLETED`, `CANCELLED`.
  - Linked to `ExchangeRequest` via `@ManyToOne private ExchangeRequest request`.
- In `BookingRepository.java`:
  - Query exists: `findByRequestIdAndStatus(Long requestId, BookingStatus status)`.

### 2. Dual Confirmation State Invariants
- **First confirmation:**
  - When User A calls `complete`:
    - Check if User A is requester or provider.
    - Set `requesterConfirmed = true` (or `providerConfirmed = true`) and record timestamp.
    - If User B has NOT confirmed yet: status remains `SCHEDULED`.
- **Second confirmation:**
  - When User B calls `complete`:
    - Both `requesterConfirmed` and `providerConfirmed` are now `true`.
    - `ExchangeRequest.status` transitions to `COMPLETED`.
    - If an active `Booking` exists for this exchange with status `SCHEDULED`, it is updated to `BookingStatus.COMPLETED`.
- **Idempotency:**
  - If a user calls `complete` when they have already confirmed, the method simply returns the current exchange DTO without error.

### 3. Dispute Invariants
- Either party can dispute an exchange if it is in `SCHEDULED` or `ACCEPTED` status and not yet completed.
- Submitting a dispute sets `status = ExchangeStatus.DISPUTED`, records the reason, user ID, and timestamp.
- Disputed exchanges cannot be confirmed as completed or rescheduled.

### 4. API & DTO Evolution
- `DisputeRequest.java`:
  - `@NotBlank(message = "Dispute reason is required") String reason`
- `ExchangeDto.java`:
  - Add fields:
    - `Boolean providerConfirmed`
    - `Boolean requesterConfirmed`
    - `Instant providerConfirmedAt`
    - `Instant requesterConfirmedAt`
    - `String disputeReason`
    - `Long disputedById`
    - `Instant disputedAt`

### 5. Frontend Visual Hierarchy & Interaction Flow
- On `ExchangeCard.jsx`:
  - Detect authenticated user role: is user requester or provider?
  - Have they already confirmed? `const userConfirmed = isIncoming ? exchange.providerConfirmed : exchange.requesterConfirmed;`
  - Has the partner confirmed? `const partnerConfirmed = isIncoming ? exchange.requesterConfirmed : exchange.providerConfirmed;`
  - Action button rendering for `SCHEDULED` exchanges:
    - If `!userConfirmed && !partnerConfirmed`:
      - "Confirm Completion" button + "Dispute" button.
    - If `userConfirmed && !partnerConfirmed`:
      - "Awaiting Partner Confirmation" pill + "Dispute" button.
    - If `!userConfirmed && partnerConfirmed`:
      - "Partner Confirmed — Verify Completion" button (highlighted with emerald ring) + "Dispute" button.
- `DisputeExchangeModal.jsx`:
  - Accessible from `ExchangeCard.jsx`.
  - Radio options for common dispute reasons:
    - "No-show / Partner did not attend"
    - "Session significantly shorter than agreed duration"
    - "Wrong topic or inadequate skill delivery"
    - "Technical issues prevented session"
    - "Other (please explain)"
  - Detailed notes text area.
  - Cancel & Submit buttons.

---

## Plan Decomposition

- **Plan 08-01:**
  - **Task 1 (Backend):**
    - Flyway migration `V4__add_completion_and_dispute_tracking.sql`.
    - `ExchangeRequest.java` entity updates with completion/dispute fields.
    - `DisputeRequest.java` DTO.
    - `ExchangeDto.java` mapping updates.
    - `ExchangeService.java` methods: `confirmCompletion(Long exchangeId, Long userId)` and `disputeExchange(Long exchangeId, Long userId, String reason)`.
    - `ExchangeController.java` endpoints: `POST /api/v1/exchanges/{id}/complete` and `POST /api/v1/exchanges/{id}/dispute`.
    - Unit tests (`ExchangeServiceTest`) and integration tests (`ExchangeControllerTest`).
  - **Task 2 (Frontend):**
    - `exchangeService.js` client additions (`confirmCompletion`, `disputeExchange`).
    - `DisputeExchangeModal.jsx` component.
    - `ExchangeCard.jsx` dual confirmation actions, partner confirmation prompts, and dispute triggers.
    - Unit tests for `DisputeExchangeModal` and `ExchangeCard`.
  - **Task 3 (Full Test Suite & Production Build):**
    - Run full backend tests via Maven (71+ tests).
    - Run full frontend tests via Vitest (66+ tests).
    - Run Vite production build.
