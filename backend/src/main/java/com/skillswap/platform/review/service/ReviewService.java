package com.skillswap.platform.review.service;

import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.exchange.entity.ExchangeStatus;
import com.skillswap.platform.exchange.repository.ExchangeRequestRepository;
import com.skillswap.platform.review.dto.CreateReviewRequest;
import com.skillswap.platform.review.dto.ReviewDto;
import com.skillswap.platform.review.dto.ReviewStatusDto;
import com.skillswap.platform.review.entity.Review;
import com.skillswap.platform.review.repository.ReviewRepository;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import com.skillswap.platform.notification.entity.NotificationType;
import com.skillswap.platform.notification.service.NotificationService;

@Service
@Transactional
public class ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);

    private final ReviewRepository reviewRepository;
    private final ExchangeRequestRepository exchangeRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ReviewService(
            ReviewRepository reviewRepository,
            ExchangeRequestRepository exchangeRequestRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.reviewRepository = reviewRepository;
        this.exchangeRequestRepository = exchangeRequestRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public ReviewDto createReview(Long currentUserId, CreateReviewRequest request) {
        ExchangeRequest exchange = exchangeRequestRepository.findById(request.exchangeId())
                .orElseThrow(() -> new IllegalArgumentException("Exchange not found: " + request.exchangeId()));

        // Verification guard (REV-01): Exchange must be completed
        if (exchange.getStatus() != ExchangeStatus.COMPLETED) {
            throw new IllegalStateException("Reviews can only be submitted for completed exchanges. Current status: " + exchange.getStatus());
        }

        // Authorization guard (REV-02): Only direct exchange participants can review
        boolean isRequester = Objects.equals(exchange.getRequester().getId(), currentUserId);
        boolean isProvider = Objects.equals(exchange.getProvider().getId(), currentUserId);
        if (!isRequester && !isProvider) {
            throw new AccessDeniedException("Only exchange participants can submit reviews");
        }

        // Single review per participant guard (REV-02)
        if (reviewRepository.existsByExchangeIdAndReviewerId(exchange.getId(), currentUserId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reviewed this exchange");
        }

        User reviewer = isRequester ? exchange.getRequester() : exchange.getProvider();
        User reviewee = isRequester ? exchange.getProvider() : exchange.getRequester();

        Review review = new Review(
                exchange,
                reviewer,
                reviewee,
                request.rating(),
                request.comment() != null ? request.comment().trim() : null
        );
        Review saved = reviewRepository.save(review);

        // Aggregate reputation recalculation (REV-03)
        Double avgRating = reviewRepository.calculateAverageRatingForUser(reviewee.getId());
        long totalReviews = reviewRepository.countByRevieweeId(reviewee.getId());

        double roundedAvg = avgRating != null
                ? BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 5.0;

        reviewee.setAverageRating(roundedAvg);
        reviewee.setTotalReviews((int) totalReviews);
        userRepository.save(reviewee);

        notificationService.sendNotification(reviewee, NotificationType.REVIEW_RECEIVED,
                reviewer.getName() + " left you a " + request.rating() + "-star review for " + exchange.getSkill().getName());

        log.info("User {} reviewed user {} with rating {} on exchange {}. New average: {}, total: {}",
                reviewer.getId(), reviewee.getId(), request.rating(), exchange.getId(), roundedAvg, totalReviews);

        return ReviewDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getReviewsForMember(Long memberId) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(ReviewDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReviewStatusDto getReviewStatusForExchange(Long exchangeId, Long currentUserId) {
        Optional<Review> reviewOpt = reviewRepository.findByExchangeIdAndReviewerId(exchangeId, currentUserId);
        return new ReviewStatusDto(reviewOpt.isPresent(), reviewOpt.map(ReviewDto::fromEntity).orElse(null));
    }
}
