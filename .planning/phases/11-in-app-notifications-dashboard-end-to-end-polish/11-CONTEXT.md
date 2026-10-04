# Phase 11: In-App Notifications, Dashboard & End-to-End Polish — Context

## 1. Phase Intent
Unify and polish the SkillSwap platform with:
1. Real-time/in-app event notifications for all critical exchange lifecycle milestones (request received, accepted, declined, scheduled, completed, credit transferred, reviewed).
2. Unread notification counter, notification bell dropdown in the navigation bar, and mark-as-read functionality.
3. Enhanced Member Dashboard integrating unread notification alerts, live credit balance, active request counts, upcoming scheduled sessions, and smart recommendations.
4. Comprehensive end-to-end flow verification across all 9 SPA pages with zero mock hardcoded data, clean responsive layouts, and robust user feedback.

---

## 2. Requirements & Traceability

| ID | Requirement | Plan | Verification Target |
|----|-------------|------|---------------------|
| **NOTF-01** | Backend emits and persists in-app notifications upon exchange request events, booking scheduling, completion credit settlements, and review submissions | 11-01 | `NotificationService`, Spring Application Events / Service triggers, `NotificationRepository` |
| **NOTF-02** | Authenticated users can list their notifications, check unread counts, and mark notifications as read | 11-01, 11-02 | `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `PATCH /api/v1/notifications/{id}/read`, `PATCH /api/v1/notifications/read-all` |
| **DASH-01** | Dashboard presents a cohesive command center with real-time wallet metrics, upcoming bookings, active exchange quick stats, and smart recommendations | 11-02 | `Dashboard.jsx`, `NotificationBell.jsx`, unread alert pill |
| **DASH-02** | 9-page responsive web experience with full end-to-end navigation, zero mock data in production bundle, and 100% clean test suite | 11-02 | Vitest, Maven tests, Vite production build |

---

## 3. Existing Architecture & Reusable Assets
- **Database Schema**:
  - `notifications` table already defined in Flyway `V1__init_schema.sql` with columns `id`, `user_id`, `message`, `type`, `is_read`, `created_at`, and index `idx_notifications_user_read(user_id, is_read)`.
- **Backend Services**:
  - `ExchangeService`: triggers request creation, acceptance, decline, and dual completion confirmation.
  - `BookingService`: triggers booking creation and rescheduling.
  - `WalletService`: transfers credits upon completed exchanges.
  - `ReviewService`: records ratings and reviews.
- **Frontend Components**:
  - `Navbar.jsx`: navigation header where `NotificationBell` will reside.
  - `Dashboard.jsx`: dashboard page to integrate notification highlights and active exchange summary.

---

## 4. Key Design Decisions
- **[D-1101] Notification Entity & Types**:
  Notification types: `REQUEST_RECEIVED`, `REQUEST_ACCEPTED`, `REQUEST_DECLINED`, `BOOKING_SCHEDULED`, `SERVICE_COMPLETED`, `CREDIT_TRANSFERRED`, `REVIEW_RECEIVED`.
- **[D-1102] Synchronous Domain Event Creation**:
  Inside the respective transactional services (`ExchangeService`, `BookingService`, `WalletService`, `ReviewService`) or via Spring `ApplicationEventPublisher`, notifications are persisted transactionally alongside the domain event so notifications never drift from actual state.
- **[D-1103] REST Notification Endpoints**:
  - `GET /api/v1/notifications`: Paginated or recent notifications for the authenticated user.
  - `GET /api/v1/notifications/unread-count`: Fast query counting `is_read = false`.
  - `PATCH /api/v1/notifications/{id}/read`: Marks single notification as read.
  - `PATCH /api/v1/notifications/read-all`: Marks all user notifications as read.
- **[D-1104] Frontend Notification Bell Dropdown**:
  Accessible bell icon with badge counter in `Navbar` displaying recent notifications, relative time ("5m ago", "1h ago"), direct action links to relevant pages (`/exchanges`, `/wallet`, `/members/:id`), and a "Mark all as read" button.
