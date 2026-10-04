package com.skillswap.platform.review.dto;

public record ReviewStatusDto(
        boolean hasReviewed,
        ReviewDto review
) {}
