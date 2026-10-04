package com.skillswap.platform.booking.controller;

import com.skillswap.platform.auth.security.UserPrincipal;
import com.skillswap.platform.booking.dto.BookingDto;
import com.skillswap.platform.booking.dto.ScheduleBookingRequest;
import com.skillswap.platform.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/exchanges/{exchangeId}/book")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<BookingDto> scheduleBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long exchangeId,
            @Valid @RequestBody ScheduleBookingRequest request
    ) {
        BookingDto dto = bookingService.scheduleBooking(exchangeId, request, principal.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/bookings/{bookingId}/reschedule")
    public ResponseEntity<BookingDto> rescheduleBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long bookingId,
            @Valid @RequestBody ScheduleBookingRequest request
    ) {
        BookingDto dto = bookingService.rescheduleBooking(bookingId, request, principal.id());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<BookingDto> cancelBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long bookingId
    ) {
        BookingDto dto = bookingService.cancelBooking(bookingId, principal.id());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/bookings/upcoming")
    public ResponseEntity<List<BookingDto>> getUpcomingBookings(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<BookingDto> list = bookingService.getUpcomingBookings(principal.id());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/exchanges/{exchangeId}/booking")
    public ResponseEntity<BookingDto> getBookingForExchange(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long exchangeId
    ) {
        return bookingService.getBookingForExchange(exchangeId, principal.id())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, String>> handleSecurityException(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }
}
