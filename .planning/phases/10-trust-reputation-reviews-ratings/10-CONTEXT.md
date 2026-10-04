# Phase 10 Context: Trust & Reputation (Reviews & Ratings)

## Goal
Enable verified members to submit star ratings (1–5) and written feedback following completed skill exchanges, enforce single-review participant eligibility, automatically recompute aggregate member reputation scores, and render review commentary on member profiles and exchange cards.

## Requirements Covered
- **REV-01**: User can submit a star rating (1–5) and written feedback for a completed exchange.
- **REV-02**: System restricts reviews so only participants of a completed exchange can submit (max 1 review per participant per exchange).
- **REV-03**: System computes and updates aggregate member ratings displayed on profile cards and pages.

---

## Decisions Log

### D-1001: Verified Participant Review Eligibility
- **Decision:** Reviews are strictly tied to completed skill exchanges:
  - An exchange must have `status == ExchangeStatus.COMPLETED`. Any attempt to review an exchange in `PENDING`, `ACCEPTED`, `SCHEDULED`, `DISPUTED`, or `CANCELLED` status returns HTTP 400 Bad Request.
  - Only the two direct participants (the requester and the provider) are authorized to submit a review. Third-party members receive HTTP 403 Forbidden.
  - The reviewee is determined automatically by the server based on the caller's role:
    - If the caller is the exchange requester, the reviewee is the provider.
    - If the caller is the exchange provider, the reviewee is the requester.

### D-1002: Single Review per Participant Enforced Idempotency
- **Decision:** Each participant can submit at most one review per exchange:
  - Checked in service via `reviewRepository.existsByExchangeIdAndReviewerId(exchangeId, reviewerId)`.
  - Guaranteed at the persistence layer by the unique constraint `uq_review_exchange_reviewer UNIQUE(exchange_id, reviewer_id)` in the `reviews` table.
  - Duplicate review attempts return HTTP 409 Conflict with message `"You have already reviewed this exchange"`.

### D-1003: Aggregate Reputation Computation & Denormalization
- **Decision:**
  - Rating values are integers between 1 and 5.
  - Optional written feedback comment (up to 1,000 characters).
  - Upon review persistence, the reviewee's aggregate reputation is recomputed inside the same `@Transactional` boundary:
    - `average_rating = ROUND(AVG(rating), 2)`
    - `total_reviews = COUNT(reviews)`
  - The resulting average rating and total review count are updated directly on the reviewee's `User` record, keeping member discovery queries and profile cards instantaneous without cross-table aggregation queries.

### D-1004: Post-Completion Review Prompts on Exchange Cards
- **Decision:**
  - On `ExchangeCard.jsx`: For exchanges with `status === 'COMPLETED'`, if the authenticated user has not yet submitted a review for that exchange:
    - Render a prominent "Leave a Review" button (gold/amber styling with star icon).
    - Clicking the button launches `SubmitReviewModal.jsx`.
    - Once submitted, the card immediately updates to show a "Reviewed ★" badge.

### D-1005: Member Profile Reviews Component
- **Decision:**
  - In `MemberProfile.jsx`: Add a dedicated "Community Reviews & Ratings" section below skills:
    - Displays rating summary header: average star rating, star breakdown, and total review count.
    - Renders chronological list of reviews with reviewer avatar, name, star rating (1–5 filled stars), skill topic exchanged, review date, and written comment.
    - Friendly empty state when no reviews have been submitted yet.

---

## Technical Architecture & API Surface

### 1. Database Model
- Table `reviews` (defined in `V1__init_schema.sql`):
  - `id BIGSERIAL PRIMARY KEY`
  - `exchange_id BIGINT NOT NULL REFERENCES exchange_requests(id)`
  - `reviewer_id BIGINT NOT NULL REFERENCES users(id)`
  - `reviewee_id BIGINT NOT NULL REFERENCES users(id)`
  - `rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5)`
  - `comment TEXT`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`
  - `CONSTRAINT uq_review_exchange_reviewer UNIQUE(exchange_id, reviewer_id)`

### 2. Backend Classes (`com.skillswap.platform.review`)
- `entity.Review`
- `repository.ReviewRepository`
- `dto.CreateReviewRequest`
- `dto.ReviewDto`
- `service.ReviewService`
- `controller.ReviewController`

### 3. Frontend Components & Services
- `frontend/src/services/reviewService.js`
- `frontend/src/components/review/SubmitReviewModal.jsx`
- `frontend/src/components/review/__tests__/SubmitReviewModal.test.jsx`
- `frontend/src/components/profile/ProfileReviews.jsx`
- `frontend/src/components/profile/__tests__/ProfileReviews.test.jsx`
- `frontend/src/components/exchange/ExchangeCard.jsx` (review button & reviewed badge)
- `frontend/src/pages/MemberProfile.jsx` (integrated reviews section)
