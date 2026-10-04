package com.skillswap.platform.exchange.dto;

import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.exchange.entity.ExchangeStatus;
import java.math.BigDecimal;
import java.time.Instant;

public class ExchangeDto {

    private Long id;
    private Long requesterId;
    private String requesterName;
    private String requesterAvatar;
    private String requesterLocation;

    private Long providerId;
    private String providerName;
    private String providerAvatar;
    private String providerLocation;

    private Long skillId;
    private String skillName;
    private String skillCategory;

    private BigDecimal duration;
    private ExchangeStatus status;
    private String notes;
    private Instant createdAt;

    public ExchangeDto() {}

    public static ExchangeDto fromEntity(ExchangeRequest entity) {
        ExchangeDto dto = new ExchangeDto();
        dto.setId(entity.getId());

        if (entity.getRequester() != null) {
            dto.setRequesterId(entity.getRequester().getId());
            dto.setRequesterName(entity.getRequester().getName());
            dto.setRequesterAvatar(entity.getRequester().getAvatarUrl());
            dto.setRequesterLocation(entity.getRequester().getLocation());
        }

        if (entity.getProvider() != null) {
            dto.setProviderId(entity.getProvider().getId());
            dto.setProviderName(entity.getProvider().getName());
            dto.setProviderAvatar(entity.getProvider().getAvatarUrl());
            dto.setProviderLocation(entity.getProvider().getLocation());
        }

        if (entity.getSkill() != null) {
            dto.setSkillId(entity.getSkill().getId());
            dto.setSkillName(entity.getSkill().getName());
            dto.setSkillCategory(entity.getSkill().getCategory());
        }

        dto.setDuration(entity.getDuration());
        dto.setStatus(entity.getStatus());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getRequesterLocation() {
        return requesterLocation;
    }

    public void setRequesterLocation(String requesterLocation) {
        this.requesterLocation = requesterLocation;
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

    public String getProviderLocation() {
        return providerLocation;
    }

    public void setProviderLocation(String providerLocation) {
        this.providerLocation = providerLocation;
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

    public ExchangeStatus getStatus() {
        return status;
    }

    public void setStatus(ExchangeStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
