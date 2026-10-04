package com.skillswap.platform.booking.repository;

import com.skillswap.platform.booking.entity.Booking;
import com.skillswap.platform.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByExchangeRequestIdAndStatus(Long requestId, BookingStatus status);

    List<Booking> findByExchangeRequestIdOrderByCreatedAtDesc(Long requestId);

    @Query("SELECT b FROM Booking b JOIN b.exchangeRequest r " +
           "WHERE b.status = :status " +
           "AND (r.requester.id = :userId OR r.provider.id = :userId) " +
           "AND b.startTime < :endTime AND b.endTime > :startTime " +
           "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId)")
    List<Booking> findOverlappingBookings(
        @Param("userId") Long userId,
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime,
        @Param("status") BookingStatus status,
        @Param("excludeBookingId") Long excludeBookingId
    );

    @Query("SELECT b FROM Booking b JOIN FETCH b.exchangeRequest r " +
           "JOIN FETCH r.requester req " +
           "JOIN FETCH r.provider prov " +
           "JOIN FETCH r.skill s " +
           "WHERE b.status = :status " +
           "AND (req.id = :userId OR prov.id = :userId) " +
           "AND b.endTime >= :now " +
           "ORDER BY b.startTime ASC")
    List<Booking> findUpcomingBookings(
        @Param("userId") Long userId,
        @Param("status") BookingStatus status,
        @Param("now") Instant now
    );
}
