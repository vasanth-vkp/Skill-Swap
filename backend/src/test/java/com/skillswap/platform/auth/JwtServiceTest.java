package com.skillswap.platform.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 86400000L; // 24 hours

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(secret, expirationMs);
    }

    @Test
    @DisplayName("Should generate valid JWT token with claims and extract them accurately")
    void shouldGenerateAndExtractClaims() {
        Long userId = 42L;
        String email = "alex@example.com";
        String role = "ROLE_MEMBER";
        String name = "Alex Johnson";

        String token = jwtService.generateToken(userId, email, role, name);

        assertThat(token).isNotBlank();
        assertThat(jwtService.validateToken(token)).isTrue();
        assertThat(jwtService.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtService.extractEmail(token)).isEqualTo(email);
        assertThat(jwtService.extractRole(token)).isEqualTo(role);
        String extractedName = jwtService.extractClaim(token, claims -> claims.get("name", String.class));
        assertThat(extractedName).isEqualTo(name);
    }

    @Test
    @DisplayName("Should return false for invalid or tampered JWT token")
    void shouldReturnFalseForInvalidToken() {
        String invalidToken = "invalid.token.signature";
        assertThat(jwtService.validateToken(invalidToken)).isFalse();
    }

    @Test
    @DisplayName("Should reject expired token")
    void shouldRejectExpiredToken() {
        // Create JwtService with 0ms expiration
        JwtService expiredJwtService = new JwtService(secret, -1000L);
        String token = expiredJwtService.generateToken(1L, "expired@example.com", "ROLE_MEMBER", "Expired User");

        assertThat(jwtService.validateToken(token)).isFalse();
    }
}
