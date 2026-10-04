# Phase 7 Research: Booking & Service Scheduling

## Domain & Infrastructure Analysis

### 1. Existing Database Schema
The database baseline in `backend/src/main/resources/db/migration/V1__init_schema.sql` already defines the `bookings` table:
```sql
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES exchange_requests(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_request ON bookings(request_id);
```
- `exchange_requests.id` is linked via `request_id`.
- `start_time` and `end_time` are stored as `TIMESTAMP WITH TIME ZONE`.
- `ExchangeStatus.java` already defines `SCHEDULED` as an active status.

### 2. Temporal & Business Constraints
- **Duration Invariant:** Duration is established in the exchange request (`duration` in hours, e.g. 1.0, 1.5, 2.0). When a user submits `startTime`, `endTime` is strictly calculated on the server: `endTime = startTime.plus((long)(duration * 60), ChronoUnit.MINUTES)`.
- **Minimum Future Horizon:** `startTime` must be at least 15 minutes into the future to avoid scheduling past or immediate impossible sessions.
- **Mutual Calendar Conflict Detection:**
  - An active booking has `status = 'SCHEDULED'`.
  - For both the requester and provider, we search for any overlapping active bookings:
    `existing.startTime < new.endTime AND existing.endTime > new.startTime`.
  - If a collision is found for either user, the server rejects with HTTP 409 Conflict.
- **Participant Authorization:**
  - Only the `requester` or `provider` of the underlying `ExchangeRequest` can book, reschedule, or cancel a booking.
  - Foreign users attempting access receive HTTP 403 Forbidden.

### 3. State Synchronization
- When a booking is created (`SCHEDULED`):
  `ExchangeRequest.status` transitions from `ACCEPTED` to `SCHEDULED`.
- When a booking is rescheduled:
  `ExchangeRequest.status` remains `SCHEDULED`, and `startTime`/`endTime` are updated.
- When a booking is cancelled (`D-702`):
  `Booking.status` transitions to `CANCELLED` (or record removed), and `ExchangeRequest.status` transitions back to `ACCEPTED`.

### 4. Frontend UX & Date Handling
- HTML5 datetime input: `<input type="datetime-local" min={minDateTime} />`.
- Local vs UTC: The browser component reads local time from user's device, converts to ISO-8601 UTC string (`toISOString()`) before API submission.
- Reusable `ScheduleBookingModal.jsx`: Used both for initial scheduling from `ExchangeCard` and rescheduling from `UpcomingBookingsWidget`.
- Dashboard Widget `UpcomingBookingsWidget.jsx`: Positioned prominently below wallet cards with relative time calculations and clear call-to-actions.

---

## Plan Decomposition

- **Plan 07-01 (Backend):**
  - `BookingStatus.java` (`SCHEDULED`, `COMPLETED`, `CANCELLED`).
  - `Booking.java` entity.
  - `ScheduleBookingRequest.java` and `BookingDto.java`.
  - `BookingRepository.java` with conflict detection query and chronological upcoming query.
  - `BookingService.java` implementing scheduling, conflict checks, duration math, rescheduling, cancellation.
  - `BookingController.java` with secure REST endpoints and exception handlers.
  - Comprehensive unit and integration tests (`BookingServiceTest`, `BookingControllerTest`).

- **Plan 07-02 (Frontend):**
  - `bookingService.js` client.
  - `ScheduleBookingModal.jsx` for scheduling and rescheduling.
  - `UpcomingBookingsWidget.jsx` for `Dashboard.jsx`.
  - Update `ExchangeCard.jsx` to render scheduling button and session details.
  - Component tests (`ScheduleBookingModal.test.jsx`, `UpcomingBookingsWidget.test.jsx`).
  - Full regression test run and clean Vite production build.
