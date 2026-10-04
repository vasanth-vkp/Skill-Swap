# Phase 11: User Acceptance Testing (UAT) Guide

## 1. Overview
This test plan provides step-by-step instructions to manually verify that in-app notifications, the header notification bell, and dashboard unread alerts function correctly in the live SkillSwap application.

---

## 2. Prerequisites
1. Start backend server:
   ```powershell
   ./mvnw spring-boot:run
   ```
2. Start frontend dev server:
   ```powershell
   npm --prefix frontend run dev
   ```

---

## 3. Test Scenarios

### Scenario 1: Unread Notification Badge & Dropdown Feed
1. Log in as an authenticated member (e.g., via `/login`).
2. Have another user send an exchange request to you (or invoke request creation).
3. Observe the navigation bar:
   - A red badge appears over the **Bell** icon showing the number of unread notifications (e.g. `1`).
4. Click the **Bell** icon:
   - A dropdown menu opens smoothly showing the latest notifications.
   - Each notification item displays a contextual icon (e.g. `Sparkles` for requests, `Calendar` for bookings, `Clock` for credit transfers, `Star` for reviews), the message text, and relative timestamp (e.g. `Just now`).
   - Unread notifications have an amber highlight and an unread dot.

### Scenario 2: Mark Individual Notification as Read & Context Navigation
1. In the open notifications dropdown, click on a notification (or click "Mark read" on the item).
2. Confirm the unread badge count decrements by 1.
3. Observe that clicking a notification navigates to the relevant page:
   - Exchange/Booking notifications navigate to `/exchanges`.
   - Credit transfer notifications navigate to `/wallet`.
   - Review notifications navigate to `/profile`.

### Scenario 3: Mark All as Read
1. When multiple unread notifications exist, open the **Bell** dropdown.
2. In the dropdown header, click **"Mark all as read"**.
3. Confirm:
   - The unread badge count is cleared completely.
   - All notifications in the list update to the read state (amber highlights removed).

### Scenario 4: Dashboard Notification Highlight Banner
1. When you have unread notifications, navigate to `/dashboard`.
2. Observe the prominent amber banner above the Welcome greeting:
   - Displays *"You have X unread notification(s)"*.
   - Explains that community members have interacted with your skills, sessions, or reviews.
   - Includes a direct button: **"View Exchanges"** linking to `/exchanges`.
3. Once all notifications are marked as read, return to `/dashboard` and confirm the banner disappears cleanly.

### Scenario 5: End-to-End Responsive Navigation Across All 9 Pages
1. Navigate through all 9 application routes:
   - `/` (Landing page)
   - `/login` & `/register` (Authentication pages)
   - `/onboarding` (Profile and skills setup wizard)
   - `/explore` (Skill search & provider discovery)
   - `/members/:id` (Public member profile & reputation)
   - `/profile` (Personal profile & offered/wanted skills editor)
   - `/exchanges` (Incoming & Outgoing requests, bookings, and dual-confirmation)
   - `/wallet` (Time-credit balance, stats, and transaction ledger)
   - `/dashboard` (Aggregated member dashboard with recommendations, upcoming sessions, and notifications)
2. Verify all pages render without console errors, broken images, or layout shifts across desktop and mobile screen sizes.
