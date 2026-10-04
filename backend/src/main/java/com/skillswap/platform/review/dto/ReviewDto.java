package com.skillswap.platform.review.dto;

import com.skillswap.platform.review.entity.Review;

import java.time.Instant;

public record ReviewDto(
        Long id,
        Long exchangeId,
        Long reviewerId,
        String reviewerName,
        String reviewerAvatarUrl,
        Long revieweeId,
        String revieweeName,
        String skillTitle,
        Integer rating,
        String comment,
        Instant createdAt
) {
    public static ReviewDto fromEntity(Review review) {
        String skillTitle = null;
        if (review.getExchange() != null && review.getExchange().getSkill() != null) {
            skillTitle = review.getExchange().getSkill().getName();
        }

        return new ReviewDto(
                review.getId(),
                review.getExchange() != null ? review.getExchange().getId() : null,
                review.getReviewer().getId(),
                review.getReviewer().getName(),
                review.getReviewer().getAvatarUrl(),
                review.getReviewee().getId(),
                review.getReviewee().getName(),
                skillTitle,
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
