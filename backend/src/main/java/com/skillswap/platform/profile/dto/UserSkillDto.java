package com.skillswap.platform.profile.dto;

public record UserSkillDto(
    Long id,
    Long skillId,
    String skillName,
    String category,
    String type,
    String experience
) {}
