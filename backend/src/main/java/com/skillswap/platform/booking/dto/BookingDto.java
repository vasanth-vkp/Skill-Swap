package com.skillswap.platform.booking.dto;

import com.skillswap.platform.booking.entity.Booking;
import com.skillswap.platform.booking.entity.BookingStatus;
import com.skillswap.platform.exchange.entity.ExchangeRequest;
import java.math.BigDecimal;
import java.time.Instant;

public class BookingDto {

    private Long id;
    private Long requestId;
    private Long requesterId;
    private String requesterName;
    private String requesterAvatar;
    private Long providerId;
    private String providerName;
    private String providerAvatar;
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private BigDecimal duration;
    private Instant startTime;
    private Instant endTime;
    private BookingStatus status;
    private Instant createdAt;

    public BookingDto() {}

    public static BookingDto fromEntity(Booking booking) {
        if (booking == null) return null;
        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setCreatedAt(booking.getCreatedAt());

        ExchangeRequest req = booking.getExchangeRequest();
        if (req != null) {
            dto.setRequestId(req.getId());
            dto.setDuration(req.getDuration());

            if (req.getRequester() != null) {
                dto.setRequesterId(req.getRequester().getId());
                dto.setRequesterName(req.getRequester().getName());
                dto.setRequesterAvatar(req.getRequester().getAvatarUrl());
            }

            if (req.getProvider() != null) {
                dto.setProviderId(req.getProvider().getId());
                dto.setProviderName(req.getProvider().getName());
                dto.setProviderAvatar(req.getProvider().getAvatarUrl());
            }

            if (req.getSkill() != null) {
                dto.setSkillId(req.getSkill().getId());
                dto.setSkillName(req.getSkill().getName());
                dto.setSkillCategory(req.getSkill().getCategory());
            }
        }

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getRequesterAvatar() {
        return requesterAvatar;
    }

    public void setRequesterAvatar(String requesterAvatar) {
        this.requesterAvatar = requesterAvatar;
    }

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getProviderAvatar() {
        return providerAvatar;
    }

    public void setProviderAvatar(String providerAvatar) {
        this.providerAvatar = providerAvatar;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getSkillCategory() {
        return skillCategory;
    }

    public void setSkillCategory(String skillCategory) {
        this.skillCategory = skillCategory;
    }

    public BigDecimal getDuration() {
        return duration;
    }

    public void setDuration(BigDecimal duration) {
        this.duration = duration;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
