package com.skillswap.platform.exchange.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DisputeRequest {

    @NotBlank(message = "Dispute reason is required")
    @Size(max = 2000, message = "Dispute reason cannot exceed 2000 characters")
    private String reason;

    public DisputeRequest() {}

    public DisputeRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
