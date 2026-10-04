package com.skillswap.platform.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AddUserSkillRequest(
    Long skillId,
    String skillName,
    String category,

    @NotBlank(message = "Skill type is required (OFFERED or WANTED)")
    @Pattern(regexp = "^(OFFERED|WANTED)$", message = "Type must be either OFFERED or WANTED")
    String type,

    String experience
) {}
