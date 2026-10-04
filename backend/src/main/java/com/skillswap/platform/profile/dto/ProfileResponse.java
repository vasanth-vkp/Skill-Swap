package com.skillswap.platform.profile.dto;

import java.time.Instant;
import java.util.List;

public record ProfileResponse(
    Long userId,
    String name,
    String email,
    String bio,
    String location,
    String avatarUrl,
    String role,
    Instant createdAt,
    List<UserSkillDto> offeredSkills,
    List<UserSkillDto> wantedSkills
) {}
