package com.skillswap.platform.exchange.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class CreateExchangeRequest {

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotNull(message = "Duration is required")
    @DecimalMin(value = "0.5", message = "Duration must be at least 0.5 hours")
    @DecimalMax(value = "8.0", message = "Duration cannot exceed 8.0 hours")
    private BigDecimal duration = new BigDecimal("1.00");

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public CreateExchangeRequest() {}

    public CreateExchangeRequest(Long providerId, Long skillId, BigDecimal duration, String notes) {
        this.providerId = providerId;
        this.skillId = skillId;
        this.duration = duration;
        this.notes = notes;
    }

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public BigDecimal getDuration() {
        return duration;
    }

    public void setDuration(BigDecimal duration) {
        this.duration = duration;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
