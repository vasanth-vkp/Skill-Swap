# Phase 10: User Acceptance Testing (UAT) Guide

## 1. Overview
This test plan provides step-by-step instructions to manually verify that reviews and reputation ratings work as expected in the live application.

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

### Scenario 1: Leave a Review on a Completed Exchange
1. Log in as a user who has completed an exchange (or complete an exchange using two accounts).
2. Navigate to **Exchanges** (`/exchanges`) and filter by **Completed**.
3. Notice the card displays a **"Leave a Review"** button with a star icon.
4. Click **"Leave a Review"**.
5. In the modal:
   - Hover over stars: observe dynamic gold highlight and reactive label ("5 - Excellent!", "4 - Very Good", etc.).
   - Click star 5.
   - Enter feedback in the notes field (e.g., "Fantastic session, learned so much about Python!").
   - Confirm character count updates (e.g. `52 / 1000`).
   - Click **"Submit Review"**.
6. The modal closes, exchanges reload, and the card now displays a **"Reviewed ★"** badge.

### Scenario 2: Duplicate Review Guard
1. Attempt to submit a review on the same completed exchange via API or browser console.
2. Confirm the server returns HTTP 409 Conflict with message indicating a review has already been submitted for this exchange.

### Scenario 3: Verify Member Profile Reputation Update
1. Navigate to the profile of the member who was reviewed (`/members/{memberId}`).
2. Verify the member header displays updated aggregate rating (e.g. `5.0 ★ (1 review)`).
3. Scroll to the new **"Community Reviews & Reputation"** section.
4. Verify:
   - Overall rating score and star visual are present.
   - Total review count pill is displayed.
   - The review card appears with the reviewer's name, initial avatar, swap skill badge, date, 5-star rating, and quoted comment.

### Scenario 4: Empty State for New Members
1. View a member profile who has not yet received any reviews.
2. Verify the **"Community Reviews & Reputation"** section displays a friendly empty state: *"No reviews yet. Complete a skill exchange with this member to receive community feedback and build reputation!"*
