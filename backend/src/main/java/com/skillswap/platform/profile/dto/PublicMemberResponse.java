package com.skillswap.platform.profile.dto;

import java.time.Instant;
import java.util.List;

public record PublicMemberResponse(
    Long id,
    String name,
    String bio,
    String location,
    String avatarUrl,
    Instant memberSince,
    List<UserSkillDto> offeredSkills,
    List<UserSkillDto> wantedSkills,
    Double ratingAverage,
    Integer totalReviews
) {}
