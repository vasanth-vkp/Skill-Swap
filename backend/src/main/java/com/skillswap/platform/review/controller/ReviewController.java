package com.skillswap.platform.review.controller;

import com.skillswap.platform.auth.security.UserPrincipal;
import com.skillswap.platform.review.dto.CreateReviewRequest;
import com.skillswap.platform.review.dto.ReviewDto;
import com.skillswap.platform.review.dto.ReviewStatusDto;
import com.skillswap.platform.review.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewDto> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        ReviewDto review = reviewService.createReview(principal.id(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<ReviewDto>> getReviewsForMember(@PathVariable Long memberId) {
        List<ReviewDto> reviews = reviewService.getReviewsForMember(memberId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/exchange/{exchangeId}/status")
    public ResponseEntity<ReviewStatusDto> getReviewStatusForExchange(
            @PathVariable Long exchangeId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ReviewStatusDto status = reviewService.getReviewStatusForExchange(exchangeId, principal.id());
        return ResponseEntity.ok(status);
    }
}
