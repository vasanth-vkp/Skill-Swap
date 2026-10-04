# Phase 11: In-App Notifications, Dashboard & End-to-End Polish — Research & Technical Spikes

## 1. Domain Notification Architecture

### Schema Alignment
The `notifications` table in PostgreSQL / H2 has the following columns:
```sql
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
```

### Notification Entity
```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
```

### Notification Types
1. `REQUEST_RECEIVED`: Sent to provider when requester submits exchange request.
2. `REQUEST_ACCEPTED`: Sent to requester when provider accepts exchange.
3. `REQUEST_DECLINED`: Sent to requester when provider declines.
4. `BOOKING_SCHEDULED`: Sent to counterpart when session is scheduled/rescheduled.
5. `SERVICE_COMPLETED`: Sent to both participants upon dual completion.
6. `CREDIT_TRANSFERRED`: Sent to both parties summarizing credit transfer.
7. `REVIEW_RECEIVED`: Sent to reviewee when counterpart submits review.

---

## 2. Notification Dispatch Mechanism
To keep transactions unified and reliable:
1. `NotificationService` provides a clean method:
   `createNotification(User user, NotificationType type, String message)`
2. Direct invocation from service methods:
   - `ExchangeService.createExchangeRequest` -> notifies provider (`REQUEST_RECEIVED`)
   - `ExchangeService.acceptExchange` -> notifies requester (`REQUEST_ACCEPTED`)
   - `ExchangeService.rejectExchange` -> notifies requester (`REQUEST_DECLINED`)
   - `BookingService.scheduleBooking` -> notifies counterpart (`BOOKING_SCHEDULED`)
   - `ExchangeService.confirmCompletion` / `WalletService.settleCompletedExchange` -> notifies provider (`CREDIT_EARNED`) and requester (`CREDIT_SPENT` / `SERVICE_COMPLETED`)
   - `ReviewService.createReview` -> notifies reviewee (`REVIEW_RECEIVED`)

---

## 3. Frontend Bell Dropdown UX & Accessibility
- **Trigger**: Bell icon button in `Navbar` with aria-label "Notifications", showing red/amber badge if `unreadCount > 0`.
- **Dropdown Panel**:
  - Flyout panel with backdrop click-away dismissal.
  - Header: "Notifications" + "Mark all read" button.
  - List of up to 10 latest notifications, grouped or ordered with latest first.
  - Type-specific icon:
    - `REQUEST_RECEIVED`: UserPlus / Clock (amber)
    - `REQUEST_ACCEPTED`: CheckCircle (emerald)
    - `REQUEST_DECLINED`: XCircle (rose)
    - `BOOKING_SCHEDULED`: Calendar (blue)
    - `SERVICE_COMPLETED` / `CREDIT_TRANSFERRED`: Award / Clock (teal/amber)
    - `REVIEW_RECEIVED`: Star (amber)
  - Relative time stamp (e.g., "Just now", "5m ago", "2h ago").
  - Click on notification marks it as read and navigates to relevant page (e.g. `/exchanges`, `/wallet`, `/profile`).
- **Empty State**: "You're all caught up! No new notifications."

---

## 4. End-to-End Experience & 9-Page Audit
1. **Landing Page (`/`)**: Hero, How It Works, Time Credit Principle, Community Testimonials, CTA.
2. **Login (`/login`)**: Email/password authentication, JWT storage, redirect to saved location.
3. **Register (`/register`)**: New account onboarding with instant 5-credit wallet grant and welcome reward modal.
4. **Onboarding (`/onboarding`)**: 2-step setup for initial profile and offered/wanted skills.
5. **Explore (`/explore`)**: Community search, domain filters, ratings, and member cards.
6. **Member Profile (`/members/:id`)**: Public profile with offered skills, learning goals, reputation score, and reviews.
7. **My Profile (`/profile`)**: Dual-persona profile management, offered skills with experience tiers, learning goals, and avatar picker.
8. **Exchanges (`/exchanges`)**: Dual incoming/outgoing tabs, status filters, accept/decline, scheduling, completion confirmation, dispute, and review CTAs.
9. **Wallet (`/wallet`)**: Time-credit balance card, total earned/spent metrics, filterable immutable transaction ledger.
10. **Dashboard (`/dashboard`)**: Unified overview with live balance, list skills CTA, explore CTA, upcoming scheduled sessions, smart match recommendations, and active notification alerts.
