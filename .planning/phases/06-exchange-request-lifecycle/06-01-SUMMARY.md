# Plan 06-01 Summary: Backend Exchange Request Domain & State Machine

## Overview
Implemented the complete backend domain for the service exchange request lifecycle:
- `ExchangeStatus.java` enum (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `SCHEDULED`, `COMPLETED`, `DISPUTED`).
- `ExchangeRequest.java` entity mapping the pre-provisioned `exchange_requests` table with relations to `User` (requester & provider) and `Skill`.
- `CreateExchangeRequest.java` and `ExchangeDto.java` DTOs with validation and sanitized projections.
- `ExchangeRequestRepository.java` providing sorted, status-filtered query methods for incoming and outgoing exchanges.
- `ExchangeService.java` implementing core business constraints:
  - Prevention of self-dealing / self-requests (`requesterId != providerId`).
  - Validation that the designated provider offers the requested skill in `user_skills`.
  - Liquidity verification ensuring requester's wallet balance covers the proposed duration (`balance >= duration`).
  - Enforced state machine transitions: only provider can accept/reject; only requester can cancel; non-pending transitions rejected.
- `ExchangeController.java` exposing authenticated REST endpoints:
  - `POST /api/v1/exchanges`: Create exchange request (201 Created).
  - `GET /api/v1/exchanges/incoming`: Filterable list of incoming requests.
  - `GET /api/v1/exchanges/outgoing`: Filterable list of outgoing requests.
  - `GET /api/v1/exchanges/{id}`: Participant-guarded exchange detail view.
  - `PUT /api/v1/exchanges/{id}/accept`: Provider accept action.
  - `PUT /api/v1/exchanges/{id}/reject`: Provider reject action.
  - `PUT /api/v1/exchanges/{id}/cancel`: Requester cancel action.
  - Exception handlers mapping domain errors to HTTP 400 Bad Request and 403 Forbidden.

## Test Verification
- **ExchangeServiceTest**: 9 / 9 unit tests passing (1.616s)
  - Successfully creates exchange with valid inputs.
  - Rejects self-requests.
  - Rejects when provider does not offer skill.
  - Rejects when requester has insufficient balance.
  - Allows provider to accept and rejects unauthorized callers.
  - Allows provider to reject.
  - Allows requester to cancel and rejects unauthorized callers.
  - Rejects state transitions when exchange is not pending.
- **ExchangeControllerTest**: 9 / 9 MockMvc integration tests passing (16.45s)
  - Endpoints secured with Bearer JWT authentication (401 on unauthenticated).
  - Rejects self-requests with 400 Bad Request.
  - Role-authorized actions (accept, reject, cancel) enforced with 403 Forbidden on violations.
  - Incoming/outgoing status filtering verified.

## Key Artifacts
- `backend/src/main/java/com/skillswap/platform/exchange/entity/ExchangeStatus.java`
- `backend/src/main/java/com/skillswap/platform/exchange/entity/ExchangeRequest.java`
- `backend/src/main/java/com/skillswap/platform/exchange/dto/CreateExchangeRequest.java`
- `backend/src/main/java/com/skillswap/platform/exchange/dto/ExchangeDto.java`
- `backend/src/main/java/com/skillswap/platform/exchange/repository/ExchangeRequestRepository.java`
- `backend/src/main/java/com/skillswap/platform/exchange/service/ExchangeService.java`
- `backend/src/main/java/com/skillswap/platform/exchange/controller/ExchangeController.java`
- `backend/src/test/java/com/skillswap/platform/exchange/ExchangeServiceTest.java`
- `backend/src/test/java/com/skillswap/platform/exchange/ExchangeControllerTest.java`
