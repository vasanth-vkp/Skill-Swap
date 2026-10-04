package com.skillswap.platform.recommendation.dto;

import com.skillswap.platform.profile.dto.UserSkillDto;

import java.util.List;

public record RecommendationDto(
    Long providerId,
    String providerName,
    String providerBio,
    String providerAvatar,
    String providerLocation,
    Double providerRating,
    Integer totalReviews,
    String matchedSkillName,
    String matchedSkillCategory,
    String experienceLevel,
    int compatibilityPercentage,
    boolean isMutualMatch,
    List<String> matchReasons,
    List<UserSkillDto> otherOfferedSkills
) {}
