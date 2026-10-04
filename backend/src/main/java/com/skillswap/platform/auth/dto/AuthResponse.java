package com.skillswap.platform.auth.dto;

import java.math.BigDecimal;

public record AuthResponse(
    String token,
    String type,
    Long userId,
    String name,
    String email,
    String role,
    BigDecimal walletBalance
) {
    public AuthResponse(String token, Long userId, String name, String email, String role, BigDecimal walletBalance) {
        this(token, "Bearer", userId, name, email, role, walletBalance);
    }
}
