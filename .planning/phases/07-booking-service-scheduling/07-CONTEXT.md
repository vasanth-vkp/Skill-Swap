# Phase 7 Context: Booking & Service Scheduling

## Goal
Enable participants of accepted skill exchanges to collaboratively coordinate and schedule a date, start time, and duration, view upcoming bookings on their dashboard with real-time countdown badges, and reschedule or cancel bookings prior to commencement.

## Requirements Covered
- **BOOK-01**: Requester and provider can schedule a date, start time, and end time for accepted exchanges.
- **BOOK-02**: System tracks upcoming bookings and displays them on user dashboard and exchange management.
- **BOOK-03**: Users can reschedule or cancel an existing booking prior to service commencement.

---

## Decisions Log

### D-701: Direct Scheduling Agreement Workflow
- **Decision:** Either participant (requester or provider) of an `ACCEPTED` exchange can select an upcoming date and start time.
- **Duration & End Time:** The service duration is fixed from the accepted exchange request (`exchange.duration`). `endTime` is automatically computed as `startTime + (duration * 60 minutes)`.
- **Immediate State Transition:** Submitting the booking immediately transitions the exchange request status to `SCHEDULED`. A propose-and-confirm round is omitted for seamless collaborative scheduling, with full flexibility to reschedule.

### D-702: Booking Cancellation Returns Exchange to ACCEPTED
- **Decision:** When a participant cancels an upcoming booking before commencement, the booking record is cancelled/removed, and the exchange request status reverts to `ACCEPTED`.
- **Rationale:** This keeps the exchange alive and enables participants to coordinate and pick another time slot without having to restart the skill exchange request lifecycle from scratch.

### D-703: UI Experience: ScheduleBookingModal & Dashboard Upcoming Sessions Widget
- **Decision:**
  - `ScheduleBookingModal.jsx`: Reusable modal dialog featuring HTML5 date & time inputs (restricted to future times `> now`), duration badge, calculated end time summary, and submit/reschedule action.
  - `UpcomingBookingsWidget.jsx`: Integrated into `Dashboard.jsx` (positioned between wallet summary and recommendations) displaying chronological upcoming sessions, relative time countdowns ("Today at 2:00 PM", "In 2 days"), counterparty information, skill badges, and quick actions to Reschedule or Cancel Booking.
  - `ExchangeCard.jsx`: Displays "Schedule Session" button on `ACCEPTED` exchanges and date/time pill + "Reschedule / Cancel Booking" on `SCHEDULED` exchanges.

### D-704: Strict Server-Side Overlap Conflict Detection
- **Decision:** The backend enforces calendar conflict detection. An attempt to schedule or reschedule a booking where either the requester or provider has another confirmed active booking during the overlapping time window (`existing.startTime < new.endTime AND existing.endTime > new.startTime`) is rejected with HTTP 409 Conflict and an informative error message.
- **Future Date Validation:** `startTime` must be at least 15 minutes in the future from submission time.

---

## Technical Architecture & API Surface

### 1. Database Model (`bookings`)
- `id`: BIGSERIAL PRIMARY KEY
- `request_id`: BIGINT NOT NULL REFERENCES `exchange_requests(id)` ON DELETE CASCADE
- `start_time`: TIMESTAMP WITH TIME ZONE NOT NULL
- `end_time`: TIMESTAMP WITH TIME ZONE NOT NULL
- `status`: VARCHAR(50) NOT NULL DEFAULT `'SCHEDULED'` (`SCHEDULED`, `CANCELLED`, `COMPLETED`)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

### 2. Backend Endpoints (`/api/v1`)
- `POST /api/v1/exchanges/{id}/book`: Schedule booking for accepted exchange (`ScheduleBookingRequest`).
- `PUT /api/v1/bookings/{id}/reschedule`: Reschedule existing booking (`ScheduleBookingRequest`).
- `DELETE /api/v1/bookings/{id}`: Cancel booking, returning exchange to `ACCEPTED`.
- `GET /api/v1/bookings/upcoming`: List authenticated user's future bookings sorted chronologically.
- `GET /api/v1/exchanges/{id}/booking`: Retrieve booking details for a specific exchange.

### 3. Frontend Components & Services
- `bookingService.js`: API client for scheduling, rescheduling, cancelling, and fetching upcoming bookings.
- `ScheduleBookingModal.jsx`: Interactive modal for date/time selection with duration summary and error handling.
- `UpcomingBookingsWidget.jsx`: Dashboard widget with countdown timers, counterparty details, and actions.
- Updates to `Dashboard.jsx` and `ExchangeCard.jsx`.

---

## Verification Strategy
- **Unit Tests (`BookingServiceTest`):** Test scheduling, conflict detection, participant validation, rescheduling, and cancellation state transitions.
- **Integration Tests (`BookingControllerTest`):** Test REST endpoints with MockMvc, JWT auth, status codes (201, 200, 400, 403, 409).
- **Frontend Tests (`ScheduleBookingModal.test.jsx`, `UpcomingBookingsWidget.test.jsx`):** Test modal rendering, date validation, and widget countdowns.
- **Full Regression Suite:** Zero failures across backend and frontend suites; clean production build.
