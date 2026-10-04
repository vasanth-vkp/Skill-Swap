package com.skillswap.platform.booking;

import com.skillswap.platform.booking.dto.BookingDto;
import com.skillswap.platform.booking.dto.ScheduleBookingRequest;
import com.skillswap.platform.booking.entity.Booking;
import com.skillswap.platform.booking.entity.BookingStatus;
import com.skillswap.platform.booking.repository.BookingRepository;
import com.skillswap.platform.booking.service.BookingService;
import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.exchange.entity.ExchangeStatus;
import com.skillswap.platform.exchange.repository.ExchangeRequestRepository;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ExchangeRequestRepository exchangeRequestRepository;

    @Mock
    private com.skillswap.platform.notification.service.NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    private User requester;
    private User provider;
    private Skill skill;
    private ExchangeRequest exchange;

    @BeforeEach
    void setUp() {
        requester = new User("Requester", "requester@example.com", "hash", "Seattle, WA");
        requester.setId(1L);

        provider = new User("Provider", "provider@example.com", "hash", "Seattle, WA");
        provider.setId(2L);

        skill = new Skill("Python", "Technology");
        skill.setId(10L);

        exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.50"), "Learn Python");
        exchange.setId(100L);
        exchange.setStatus(ExchangeStatus.ACCEPTED);
    }

    @Test
    void shouldScheduleBookingSuccessfully() {
        Instant startTime = Instant.now().plus(2, ChronoUnit.HOURS);
        ScheduleBookingRequest request = new ScheduleBookingRequest(startTime);

        when(exchangeRequestRepository.findById(100L)).thenReturn(Optional.of(exchange));
        when(bookingRepository.findByExchangeRequestIdAndStatus(100L, BookingStatus.SCHEDULED)).thenReturn(Optional.empty());
        when(bookingRepository.findOverlappingBookings(eq(1L), any(), any(), eq(BookingStatus.SCHEDULED), any()))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.findOverlappingBookings(eq(2L), any(), any(), eq(BookingStatus.SCHEDULED), any()))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setId(500L);
            return b;
        });

        BookingDto result = bookingService.scheduleBooking(100L, request, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(500L);
        assertThat(result.getStatus()).isEqualTo(BookingStatus.SCHEDULED);
        assertThat(result.getStartTime()).isEqualTo(startTime);
        assertThat(result.getEndTime()).isEqualTo(startTime.plus(90, ChronoUnit.MINUTES));
        assertThat(exchange.getStatus()).isEqualTo(ExchangeStatus.SCHEDULED);
    }

    @Test
    void shouldRejectNonParticipantFromScheduling() {
        Instant startTime = Instant.now().plus(2, ChronoUnit.HOURS);
        ScheduleBookingRequest request = new ScheduleBookingRequest(startTime);

        when(exchangeRequestRepository.findById(100L)).thenReturn(Optional.of(exchange));

        assertThatThrownBy(() -> bookingService.scheduleBooking(100L, request, 999L))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("Only exchange participants");
    }

    @Test
    void shouldRejectSchedulingWhenExchangeNotAccepted() {
        exchange.setStatus(ExchangeStatus.PENDING);
        Instant startTime = Instant.now().plus(2, ChronoUnit.HOURS);
        ScheduleBookingRequest request = new ScheduleBookingRequest(startTime);

        when(exchangeRequestRepository.findById(100L)).thenReturn(Optional.of(exchange));

        assertThatThrownBy(() -> bookingService.scheduleBooking(100L, request, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Must be ACCEPTED or SCHEDULED");
    }

    @Test
    void shouldRejectSchedulingInPastOrTooSoon() {
        Instant startTime = Instant.now().plus(5, ChronoUnit.MINUTES);
        ScheduleBookingRequest request = new ScheduleBookingRequest(startTime);

        when(exchangeRequestRepository.findById(100L)).thenReturn(Optional.of(exchange));

        assertThatThrownBy(() -> bookingService.scheduleBooking(100L, request, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("at least 15 minutes in the future");
    }

    @Test
    void shouldRejectWhenRequesterHasCalendarConflict() {
        Instant startTime = Instant.now().plus(2, ChronoUnit.HOURS);
        ScheduleBookingRequest request = new ScheduleBookingRequest(startTime);

        when(exchangeRequestRepository.findById(100L)).thenReturn(Optional.of(exchange));
        when(bookingRepository.findByExchangeRequestIdAndStatus(100L, BookingStatus.SCHEDULED)).thenReturn(Optional.empty());
        when(bookingRepository.findOverlappingBookings(eq(1L), any(), any(), eq(BookingStatus.SCHEDULED), any()))
                .thenReturn(List.of(new Booking()));

        assertThatThrownBy(() -> bookingService.scheduleBooking(100L, request, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Requester has another confirmed booking");
    }

    @Test
    void shouldRejectWhenProviderHasCalendarConflict() {
        Instant startTime = Instant.now().plus(2, ChronoUnit.HOURS);
        ScheduleBookingRequest request = new ScheduleBookingRequest(startTime);

        when(exchangeRequestRepository.findById(100L)).thenReturn(Optional.of(exchange));
        when(bookingRepository.findByExchangeRequestIdAndStatus(100L, BookingStatus.SCHEDULED)).thenReturn(Optional.empty());
        when(bookingRepository.findOverlappingBookings(eq(1L), any(), any(), eq(BookingStatus.SCHEDULED), any()))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.findOverlappingBookings(eq(2L), any(), any(), eq(BookingStatus.SCHEDULED), any()))
                .thenReturn(List.of(new Booking()));

        assertThatThrownBy(() -> bookingService.scheduleBooking(100L, request, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Provider has another confirmed booking");
    }

    @Test
    void shouldRescheduleBookingSuccessfully() {
        Instant initialStart = Instant.now().plus(2, ChronoUnit.HOURS);
        Instant initialEnd = initialStart.plus(90, ChronoUnit.MINUTES);
        Booking booking = new Booking(exchange, initialStart, initialEnd, BookingStatus.SCHEDULED);
        booking.setId(500L);

        Instant newStart = Instant.now().plus(4, ChronoUnit.HOURS);
        ScheduleBookingRequest request = new ScheduleBookingRequest(newStart);

        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(bookingRepository.findOverlappingBookings(eq(1L), any(), any(), eq(BookingStatus.SCHEDULED), eq(500L)))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.findOverlappingBookings(eq(2L), any(), any(), eq(BookingStatus.SCHEDULED), eq(500L)))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingDto result = bookingService.rescheduleBooking(500L, request, 2L);

        assertThat(result).isNotNull();
        assertThat(result.getStartTime()).isEqualTo(newStart);
        assertThat(result.getEndTime()).isEqualTo(newStart.plus(90, ChronoUnit.MINUTES));
    }

    @Test
    void shouldCancelBookingAndRevertExchangeToAccepted() {
        Instant initialStart = Instant.now().plus(2, ChronoUnit.HOURS);
        Instant initialEnd = initialStart.plus(90, ChronoUnit.MINUTES);
        Booking booking = new Booking(exchange, initialStart, initialEnd, BookingStatus.SCHEDULED);
        booking.setId(500L);
        exchange.setStatus(ExchangeStatus.SCHEDULED);

        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingDto result = bookingService.cancelBooking(500L, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(exchange.getStatus()).isEqualTo(ExchangeStatus.ACCEPTED);
    }

    @Test
    void shouldReturnUpcomingBookingsForUser() {
        Instant initialStart = Instant.now().plus(2, ChronoUnit.HOURS);
        Instant initialEnd = initialStart.plus(90, ChronoUnit.MINUTES);
        Booking booking = new Booking(exchange, initialStart, initialEnd, BookingStatus.SCHEDULED);
        booking.setId(500L);

        when(bookingRepository.findUpcomingBookings(eq(1L), eq(BookingStatus.SCHEDULED), any()))
                .thenReturn(List.of(booking));

        List<BookingDto> result = bookingService.getUpcomingBookings(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(500L);
    }
}
