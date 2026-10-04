package com.skillswap.platform.review;

import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.exchange.entity.ExchangeStatus;
import com.skillswap.platform.exchange.repository.ExchangeRequestRepository;
import com.skillswap.platform.review.dto.CreateReviewRequest;
import com.skillswap.platform.review.dto.ReviewDto;
import com.skillswap.platform.review.dto.ReviewStatusDto;
import com.skillswap.platform.review.entity.Review;
import com.skillswap.platform.review.repository.ReviewRepository;
import com.skillswap.platform.review.service.ReviewService;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ExchangeRequestRepository exchangeRequestRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User requester;
    private User provider;
    private Skill skill;
    private ExchangeRequest exchange;

    @BeforeEach
    void setUp() {
        requester = new User("Requester Alice", "alice@example.com", "hash", "Seattle, WA");
        requester.setId(1L);

        provider = new User("Provider Bob", "bob@example.com", "hash", "Seattle, WA");
        provider.setId(2L);

        skill = new Skill("Python Programming", "Technology");
        skill.setId(10L);

        exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Learn Python");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.COMPLETED);
    }

    @Test
    @DisplayName("Requester submitting review should save review and recalculate provider average rating")
    void shouldCreateReviewByRequesterAndRecalculateRating() {
        CreateReviewRequest request = new CreateReviewRequest(50L, 5, "Bob was an incredible teacher!");

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));
        when(reviewRepository.existsByExchangeIdAndReviewerId(50L, 1L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(101L);
            return r;
        });
        when(reviewRepository.calculateAverageRatingForUser(2L)).thenReturn(4.85);
        when(reviewRepository.countByRevieweeId(2L)).thenReturn(3L);

        ReviewDto result = reviewService.createReview(1L, request);

        assertThat(result.rating()).isEqualTo(5);
        assertThat(result.comment()).isEqualTo("Bob was an incredible teacher!");
        assertThat(result.reviewerId()).isEqualTo(1L);
        assertThat(result.revieweeId()).isEqualTo(2L);
        assertThat(result.skillTitle()).isEqualTo("Python Programming");

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository, times(1)).save(captor.capture());
        Review saved = captor.getValue();
        assertThat(saved.getReviewer()).isEqualTo(requester);
        assertThat(saved.getReviewee()).isEqualTo(provider);

        // Verify provider rating update
        assertThat(provider.getAverageRating()).isEqualTo(4.85);
        assertThat(provider.getTotalReviews()).isEqualTo(3);
        verify(userRepository, times(1)).save(provider);
    }

    @Test
    @DisplayName("Provider submitting review should assign requester as reviewee and recalculate requester rating")
    void shouldCreateReviewByProviderAndRecalculateRequesterRating() {
        CreateReviewRequest request = new CreateReviewRequest(50L, 4, "Alice was a motivated learner.");

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));
        when(reviewRepository.existsByExchangeIdAndReviewerId(50L, 2L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(102L);
            return r;
        });
        when(reviewRepository.calculateAverageRatingForUser(1L)).thenReturn(4.00);
        when(reviewRepository.countByRevieweeId(1L)).thenReturn(1L);

        ReviewDto result = reviewService.createReview(2L, request);

        assertThat(result.reviewerId()).isEqualTo(2L);
        assertThat(result.revieweeId()).isEqualTo(1L);
        assertThat(requester.getAverageRating()).isEqualTo(4.00);
        assertThat(requester.getTotalReviews()).isEqualTo(1);
        verify(userRepository, times(1)).save(requester);
    }

    @Test
    @DisplayName("Submitting review for non-completed exchange should throw IllegalStateException")
    void shouldRejectReviewWhenExchangeNotCompleted() {
        exchange.setStatus(ExchangeStatus.SCHEDULED);
        CreateReviewRequest request = new CreateReviewRequest(50L, 5, "Too early to review");

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));

        assertThatThrownBy(() -> reviewService.createReview(1L, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Reviews can only be submitted for completed exchanges");

        verify(reviewRepository, never()).save(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Submitting review by non-participant should throw AccessDeniedException")
    void shouldRejectReviewByNonParticipant() {
        CreateReviewRequest request = new CreateReviewRequest(50L, 5, "I am a stranger");

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));

        assertThatThrownBy(() -> reviewService.createReview(999L, request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only exchange participants can submit reviews");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Submitting duplicate review by same participant should throw Conflict ResponseStatusException")
    void shouldRejectDuplicateReviewOnSameExchange() {
        CreateReviewRequest request = new CreateReviewRequest(50L, 5, "Reviewing again");

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));
        when(reviewRepository.existsByExchangeIdAndReviewerId(50L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> reviewService.createReview(1L, request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("You have already reviewed this exchange");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("getReviewsForMember should return list of reviews mapped to ReviewDto")
    void shouldReturnReviewsForMember() {
        Review r1 = new Review(exchange, requester, provider, 5, "Awesome");
        r1.setId(101L);

        when(reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(2L)).thenReturn(List.of(r1));

        List<ReviewDto> list = reviewService.getReviewsForMember(2L);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).comment()).isEqualTo("Awesome");
        assertThat(list.get(0).rating()).isEqualTo(5);
    }

    @Test
    @DisplayName("getReviewStatusForExchange should return hasReviewed true when review exists")
    void shouldReturnReviewStatus() {
        Review r1 = new Review(exchange, requester, provider, 5, "Awesome");
        r1.setId(101L);

        when(reviewRepository.findByExchangeIdAndReviewerId(50L, 1L)).thenReturn(Optional.of(r1));

        ReviewStatusDto status = reviewService.getReviewStatusForExchange(50L, 1L);

        assertThat(status.hasReviewed()).isTrue();
        assertThat(status.review()).isNotNull();
        assertThat(status.review().rating()).isEqualTo(5);
    }
}
