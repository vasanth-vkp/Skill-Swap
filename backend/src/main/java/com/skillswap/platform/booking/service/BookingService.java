package com.skillswap.platform.booking.service;

import com.skillswap.platform.booking.dto.BookingDto;
import com.skillswap.platform.booking.dto.ScheduleBookingRequest;
import com.skillswap.platform.booking.entity.Booking;
import com.skillswap.platform.booking.entity.BookingStatus;
import com.skillswap.platform.booking.repository.BookingRepository;
import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.exchange.entity.ExchangeStatus;
import com.skillswap.platform.exchange.repository.ExchangeRequestRepository;
import com.skillswap.platform.notification.entity.NotificationType;
import com.skillswap.platform.notification.service.NotificationService;
import com.skillswap.platform.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ExchangeRequestRepository exchangeRequestRepository;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            ExchangeRequestRepository exchangeRequestRepository,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.exchangeRequestRepository = exchangeRequestRepository;
        this.notificationService = notificationService;
    }

    public BookingDto scheduleBooking(Long exchangeId, ScheduleBookingRequest request, Long currentUserId) {
        if (request == null || request.getStartTime() == null) {
            throw new IllegalArgumentException("Booking start time is required.");
        }

        ExchangeRequest exchange = exchangeRequestRepository.findById(exchangeId)
                .orElseThrow(() -> new NoSuchElementException("Exchange request not found: " + exchangeId));

        validateParticipant(exchange, currentUserId);

        if (exchange.getStatus() != ExchangeStatus.ACCEPTED && exchange.getStatus() != ExchangeStatus.SCHEDULED) {
            throw new IllegalStateException("Cannot schedule booking: exchange request is in status " + exchange.getStatus() + ". Must be ACCEPTED or SCHEDULED.");
        }

        validateFutureTime(request.getStartTime());

        long durationMinutes = Math.round(exchange.getDuration().doubleValue() * 60);
        Instant endTime = request.getStartTime().plus(durationMinutes, ChronoUnit.MINUTES);

        Optional<Booking> existingActiveOpt = bookingRepository.findByExchangeRequestIdAndStatus(exchangeId, BookingStatus.SCHEDULED);
        Long excludeBookingId = existingActiveOpt.map(Booking::getId).orElse(null);

        checkConflicts(exchange.getRequester().getId(), exchange.getProvider().getId(), request.getStartTime(), endTime, excludeBookingId);

        Booking booking;
        if (existingActiveOpt.isPresent()) {
            booking = existingActiveOpt.get();
            booking.setStartTime(request.getStartTime());
            booking.setEndTime(endTime);
        } else {
            booking = new Booking(exchange, request.getStartTime(), endTime, BookingStatus.SCHEDULED);
        }

        exchange.setStatus(ExchangeStatus.SCHEDULED);
        Booking saved = bookingRepository.save(booking);

        User counterpart = exchange.getRequester().getId().equals(currentUserId) ? exchange.getProvider() : exchange.getRequester();
        notificationService.sendNotification(counterpart, NotificationType.BOOKING_SCHEDULED,
                "A session was scheduled for " + exchange.getSkill().getName());

        return BookingDto.fromEntity(saved);
    }

    public BookingDto rescheduleBooking(Long bookingId, ScheduleBookingRequest request, Long currentUserId) {
        if (request == null || request.getStartTime() == null) {
            throw new IllegalArgumentException("Booking start time is required.");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found: " + bookingId));

        ExchangeRequest exchange = booking.getExchangeRequest();
        validateParticipant(exchange, currentUserId);

        if (booking.getStatus() != BookingStatus.SCHEDULED) {
            throw new IllegalStateException("Cannot reschedule booking: booking status is " + booking.getStatus() + ". Only SCHEDULED bookings can be rescheduled.");
        }

        validateFutureTime(request.getStartTime());

        long durationMinutes = Math.round(exchange.getDuration().doubleValue() * 60);
        Instant endTime = request.getStartTime().plus(durationMinutes, ChronoUnit.MINUTES);

        checkConflicts(exchange.getRequester().getId(), exchange.getProvider().getId(), request.getStartTime(), endTime, booking.getId());

        booking.setStartTime(request.getStartTime());
        booking.setEndTime(endTime);
        Booking saved = bookingRepository.save(booking);

        User counterpart = exchange.getRequester().getId().equals(currentUserId) ? exchange.getProvider() : exchange.getRequester();
        notificationService.sendNotification(counterpart, NotificationType.BOOKING_SCHEDULED,
                "The session for " + exchange.getSkill().getName() + " was rescheduled");

        return BookingDto.fromEntity(saved);
    }

    public BookingDto cancelBooking(Long bookingId, Long currentUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found: " + bookingId));

        ExchangeRequest exchange = booking.getExchangeRequest();
        validateParticipant(exchange, currentUserId);

        if (booking.getStatus() != BookingStatus.SCHEDULED) {
            throw new IllegalStateException("Cannot cancel booking: booking is not currently SCHEDULED.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        exchange.setStatus(ExchangeStatus.ACCEPTED); // D-702: Revert exchange to ACCEPTED to allow rescheduling

        Booking saved = bookingRepository.save(booking);
        return BookingDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getUpcomingBookings(Long currentUserId) {
        List<Booking> bookings = bookingRepository.findUpcomingBookings(currentUserId, BookingStatus.SCHEDULED, Instant.now());
        return bookings.stream()
                .map(BookingDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<BookingDto> getBookingForExchange(Long exchangeId, Long currentUserId) {
        ExchangeRequest exchange = exchangeRequestRepository.findById(exchangeId)
                .orElseThrow(() -> new NoSuchElementException("Exchange request not found: " + exchangeId));

        validateParticipant(exchange, currentUserId);

        return bookingRepository.findByExchangeRequestIdAndStatus(exchangeId, BookingStatus.SCHEDULED)
                .map(BookingDto::fromEntity);
    }

    private void validateParticipant(ExchangeRequest exchange, Long userId) {
        boolean isRequester = exchange.getRequester() != null && exchange.getRequester().getId().equals(userId);
        boolean isProvider = exchange.getProvider() != null && exchange.getProvider().getId().equals(userId);

        if (!isRequester && !isProvider) {
            throw new SecurityException("Unauthorized: Only exchange participants can view or modify bookings.");
        }
    }

    private void validateFutureTime(Instant startTime) {
        Instant minimumTime = Instant.now().plus(14, ChronoUnit.MINUTES);
        if (startTime.isBefore(minimumTime)) {
            throw new IllegalArgumentException("Booking start time must be at least 15 minutes in the future.");
        }
    }

    private void checkConflicts(Long requesterId, Long providerId, Instant startTime, Instant endTime, Long excludeBookingId) {
        List<Booking> reqConflicts = bookingRepository.findOverlappingBookings(
                requesterId, startTime, endTime, BookingStatus.SCHEDULED, excludeBookingId);
        if (!reqConflicts.isEmpty()) {
            throw new IllegalStateException("Calendar conflict: Requester has another confirmed booking during this time window.");
        }

        List<Booking> provConflicts = bookingRepository.findOverlappingBookings(
                providerId, startTime, endTime, BookingStatus.SCHEDULED, excludeBookingId);
        if (!provConflicts.isEmpty()) {
            throw new IllegalStateException("Calendar conflict: Provider has another confirmed booking during this time window.");
        }
    }
}
