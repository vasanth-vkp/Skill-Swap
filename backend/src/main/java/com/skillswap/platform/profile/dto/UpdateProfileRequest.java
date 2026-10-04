package com.skillswap.platform.profile.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    String name,

    String bio,

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    String location,

    String avatarUrl
) {}
