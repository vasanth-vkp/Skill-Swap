# Phase 10 Research: Trust & Reputation (Reviews & Ratings)

## Domain & Infrastructure Analysis

### 1. Database Schema & Constraints
- In `V1__init_schema.sql`:
  - `reviews` table is already defined:
    ```sql
    CREATE TABLE IF NOT EXISTS reviews (
        id BIGSERIAL PRIMARY KEY,
        exchange_id BIGINT NOT NULL REFERENCES exchange_requests(id),
        reviewer_id BIGINT NOT NULL REFERENCES users(id),
        reviewee_id BIGINT NOT NULL REFERENCES users(id),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_review_exchange_reviewer UNIQUE(exchange_id, reviewer_id)
    );
    ```
  - Index: `idx_reviews_reviewee ON reviews(reviewee_id)`.
- In `V3__add_member_rating_columns.sql` and `User.java`:
  - `average_rating NUMERIC(3, 2) DEFAULT 5.00`
  - `total_reviews INT DEFAULT 0`
  - Mapped in `User.java` as:
    ```java
    @Column(name = "average_rating")
    private Double averageRating = 5.0;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;
    ```

### 2. State & Eligibility Validation Invariants
- **Completed Exchange Only:**
  - A review can only be submitted if `exchange.getStatus() == ExchangeStatus.COMPLETED`.
  - Submissions for exchanges in any other status (`PENDING`, `ACCEPTED`, `SCHEDULED`, `DISPUTED`, `CANCELLED`, `REJECTED`) throw `IllegalStateException("Reviews can only be submitted for completed exchanges")` -> HTTP 400.
- **Participant Authorization:**
  - Caller must be either `exchange.getRequester().getId()` or `exchange.getProvider().getId()`.
  - Foreign users throw `AccessDeniedException("Only exchange participants can submit reviews")` -> HTTP 403.
- **Single Review per Participant:**
  - Check `reviewRepository.existsByExchangeIdAndReviewerId(exchangeId, callerId)`.
  - If already reviewed, throw `ResponseStatusException(HttpStatus.CONFLICT, "You have already reviewed this exchange")` -> HTTP 409.
- **Counterparty Assignment:**
  - If caller is requester -> `reviewee = exchange.getProvider()`.
  - If caller is provider -> `reviewee = exchange.getRequester()`.

### 3. Aggregate Rating Recalculation
- Inside `@Transactional` boundary of `ReviewService.createReview`:
  1. Save new `Review` entity.
  2. Query average rating:
     ```java
     @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
     Double calculateAverageRatingForUser(@Param("userId") Long userId);
     ```
  3. Query count:
     ```java
     long countByRevieweeId(Long revieweeId);
     ```
  4. Round average to 2 decimal places: `BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue()`.
  5. Update `reviewee.setAverageRating(roundedAvg)` and `reviewee.setTotalReviews((int) count)`.
  6. `userRepository.save(reviewee)`.

### 4. API Endpoints
- `POST /api/v1/reviews`:
  - Body: `CreateReviewRequest` (`exchangeId`, `rating`, `comment`).
  - Returns `201 Created` with `ReviewDto`.
- `GET /api/v1/reviews/member/{memberId}`:
  - Returns public list of reviews received by member (`ReviewDto`).
- `GET /api/v1/reviews/exchange/{exchangeId}/status`:
  - Returns `{ hasReviewed: boolean, review: ReviewDto | null }` for the current authenticated user on this exchange.

### 5. Frontend UI/UX Architecture
- **Review Submission Modal (`SubmitReviewModal.jsx`):**
  - Accessible from `ExchangeCard.jsx` on completed exchanges.
  - Interactive star selector (1 to 5 stars) with hover glow and label (`Poor`, `Fair`, `Good`, `Very Good`, `Excellent`).
  - Textarea for written feedback with character counter (max 1000).
  - Submit button with spinner loading state and error alert handling.
- **Exchange Card Integration (`ExchangeCard.jsx`):**
  - Completed exchanges check review status:
    - If unreviewed: Displays "Leave a Review" button (amber theme with Star icon).
    - If reviewed: Displays "Reviewed ★" badge.
- **Public Profile Reviews Component (`ProfileReviews.jsx`):**
  - Embedded in `MemberProfile.jsx`.
  - Summary Header: Large average rating (e.g. `4.8 ★`), review count, and verified trust badge.
  - Review Cards List: Reviewer avatar, reviewer name, star rating, exchange skill name, review date, and review comment.
  - Friendly empty state when no reviews exist yet.

---

## Plan Decomposition

- **Plan 10-01 (Backend):**
  - `Review.java` entity and `ReviewRepository.java` interface.
  - `CreateReviewRequest.java` and `ReviewDto.java` records.
  - `ReviewService.java`: `createReview`, `getReviewsForMember`, `getReviewStatusForExchange`.
  - `ReviewController.java`: endpoints with validation and JWT security.
  - Unit and integration tests (`ReviewServiceTest.java`, `ReviewControllerTest.java`).

- **Plan 10-02 (Frontend):**
  - `reviewService.js` client module.
  - `SubmitReviewModal.jsx` component and tests (`SubmitReviewModal.test.jsx`).
  - `ProfileReviews.jsx` component and tests (`ProfileReviews.test.jsx`).
  - Update `ExchangeCard.jsx` with review action and reviewed status.
  - Update `MemberProfile.jsx` to render `ProfileReviews`.
  - Full test regression (Maven backend + Vitest frontend) & Vite production build.
