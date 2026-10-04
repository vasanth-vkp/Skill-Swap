# Plan 07-01 Summary: Backend Booking Domain, Scheduling, Conflict Detection & REST API

## Overview
Implemented the backend booking and scheduling domain:
- `BookingStatus.java`: Status lifecycle enum (`SCHEDULED`, `COMPLETED`, `CANCELLED`).
- `Booking.java`: JPA entity mapped to the `bookings` table with foreign key relationship to `ExchangeRequest` (`request_id`).
- `ScheduleBookingRequest.java` & `BookingDto.java`: Validation DTO and sanitized projection with participant and skill context.
- `BookingRepository.java`:
  - `findOverlappingBookings`: Calendar conflict detection JPQL query preventing double-booking across both participants.
  - `findUpcomingBookings`: Chronological query fetching future sessions where the user is either requester or provider.
- `BookingService.java`:
  - Participant verification (caller must be requester or provider).
  - Exchange status prerequisite validation (must be `ACCEPTED` or `SCHEDULED`).
  - Minimum future time horizon verification (must be >= 15 minutes in future).
  - Authoritative duration math (`endTime = startTime + duration * 60 min`).
  - Mutual calendar collision check throwing HTTP 409 Conflict.
  - Rescheduling support with collision detection excluding current booking ID.
  - Cancellation workflow (`D-702`): Marks booking `CANCELLED` and restores exchange request status to `ACCEPTED`.
- `BookingController.java`:
  - `POST /api/v1/exchanges/{id}/book`: Schedule booking (201 Created).
  - `PUT /api/v1/bookings/{id}/reschedule`: Reschedule booking (200 OK).
  - `DELETE /api/v1/bookings/{id}`: Cancel booking and restore exchange (200 OK).
  - `GET /api/v1/bookings/upcoming`: List authenticated user's upcoming sessions (200 OK).
  - `GET /api/v1/exchanges/{id}/booking`: Active booking for exchange (200 OK / 404).
  - Explicit HTTP exception mappings: 400 Bad Request, 403 Forbidden, 404 Not Found, 409 Conflict.

## Test Verification
- **BookingServiceTest**: 9 / 9 unit tests passing (1.48s)
  - Successful scheduling with duration calculation.
  - Rejection of non-participants.
  - Rejection when exchange is not accepted.
  - Rejection when time is in the past / too soon.
  - Rejection when requester has calendar conflict.
  - Rejection when provider has calendar conflict.
  - Successful rescheduling.
  - Cancellation restoring exchange to ACCEPTED.
  - Upcoming bookings list.
- **BookingControllerTest**: 7 / 7 MockMvc integration tests passing (16.07s)
  - Endpoints reject unauthenticated callers with 401.
  - Participant can schedule accepted exchange with 201 Created.
  - Non-participant forbidden with 403.
  - Overlapping booking attempt returns 409 Conflict.
  - Rescheduling updates times with 200 OK.
  - Cancelling booking reverts exchange status with 200 OK.
  - Upcoming bookings and exchange detail queries work correctly.

## Key Artifacts
- `backend/src/main/java/com/skillswap/platform/booking/entity/BookingStatus.java`
- `backend/src/main/java/com/skillswap/platform/booking/entity/Booking.java`
- `backend/src/main/java/com/skillswap/platform/booking/dto/ScheduleBookingRequest.java`
- `backend/src/main/java/com/skillswap/platform/booking/dto/BookingDto.java`
- `backend/src/main/java/com/skillswap/platform/booking/repository/BookingRepository.java`
- `backend/src/main/java/com/skillswap/platform/booking/service/BookingService.java`
- `backend/src/main/java/com/skillswap/platform/booking/controller/BookingController.java`
- `backend/src/test/java/com/skillswap/platform/booking/BookingServiceTest.java`
- `backend/src/test/java/com/skillswap/platform/booking/BookingControllerTest.java`
