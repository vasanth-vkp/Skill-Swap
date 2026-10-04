package com.skillswap.platform.discovery.dto;

import com.skillswap.platform.profile.dto.UserSkillDto;

import java.time.Instant;
import java.util.List;

public record MemberCardDto(
    Long id,
    String name,
    String bio,
    String location,
    String avatarUrl,
    Double averageRating,
    Integer totalReviews,
    Instant memberSince,
    List<UserSkillDto> offeredSkills,
    List<UserSkillDto> wantedSkills
) {}
