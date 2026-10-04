package com.skillswap.platform.review.repository;

import com.skillswap.platform.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByExchangeIdAndReviewerId(Long exchangeId, Long reviewerId);

    Optional<Review> findByExchangeIdAndReviewerId(Long exchangeId, Long reviewerId);

    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);

    List<Review> findByExchangeId(Long exchangeId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
    Double calculateAverageRatingForUser(@Param("userId") Long userId);

    long countByRevieweeId(Long revieweeId);
}
