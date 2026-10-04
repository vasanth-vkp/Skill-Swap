package com.skillswap.platform.booking.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class ScheduleBookingRequest {

    @NotNull(message = "Start time is required")
    private Instant startTime;

    public ScheduleBookingRequest() {}

    public ScheduleBookingRequest(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }
}
