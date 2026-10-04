# Plan 02-01 Summary: Backend Security, JWT & Atomic Wallet Grant

## Overview
Implemented Spring Boot 3.3 Security with stateless JJWT 0.12.6 authentication, BCrypt password hashing (strength 12), and atomic registration provisioning exactly 5.00 time credits into PostgreSQL for all newly registered users.

## Key Changes
1. **Dependencies & Configuration (`backend/pom.xml`, `application.yml`):**
   - Added `spring-boot-starter-security`, `io.jsonwebtoken:jjwt-api:0.12.6`, `jjwt-impl`, `jjwt-jackson`, and `spring-security-test`.
   - Configured 256-bit HMAC secret and 24-hour token expiration (`86400000` ms) in `application.yml` and `test/resources/application.yml`.
2. **Entities & Repositories (`com.skillswap.platform.user`, `com.skillswap.platform.wallet`):**
   - `User`: JPA entity mapped to `users` table with email uniqueness and BCrypt hashed password storage.
   - `UserRepository`: Spring Data JPA interface with `findByEmail` and `existsByEmail`.
   - `Wallet`: JPA entity mapped to `wallets` table with default `5.00` balance and `updated_at` timestamp.
   - `WalletRepository`: Spring Data JPA interface with `findByUserId`.
3. **Security & Cryptography (`com.skillswap.platform.auth.security`):**
   - `JwtService`: Token creation with HMAC-SHA256, embedding subject (userId), email, role, and name claims; token validation and claims extraction.
   - `UserPrincipal`: Implements `UserDetails` holding user identity and authorities.
   - `JwtAuthenticationFilter`: Extends `OncePerRequestFilter`, extracts Bearer tokens, validates signature, and populates `SecurityContextHolder`.
   - `SecurityConfig`: Stateless session policy, CSRF disabled, CORS configured for `http://localhost:5173`, public access on `/api/v1/auth/register`, `/api/v1/auth/login`, and `/api/v1/health`, with 401 Unauthorized entry point for unauthenticated requests.
4. **Auth Service & REST Endpoints (`com.skillswap.platform.auth`):**
   - DTOs: `RegisterRequest`, `LoginRequest`, `AuthResponse`.
   - `AuthService`: `@Transactional` `register` checks duplicate email (409 Conflict), encodes password with BCrypt(12), saves User, creates and saves initial Wallet with 5.00 credits (WALL-01, AUTH-02), and issues signed JWT (AUTH-03). `login` validates credentials (401 Unauthorized) and issues JWT. `getCurrentUser` returns authenticated profile with live wallet balance.
   - `AuthController`: REST endpoints `POST /api/v1/auth/register` (201 Created), `POST /api/v1/auth/login` (200 OK), and `GET /api/v1/auth/me` (200 OK).

## Verification
- Unit test: `JwtServiceTest` passed (3 tests: valid token, claims extraction, expired/tampered rejection).
- MockMvc integration test: `AuthControllerTest` passed (6 tests: registration with 5 credits, duplicate conflict, login success, invalid password, authenticated `/me`, unauthenticated 401).
- Full backend suite: All 11 tests passed with 0 failures and 0 errors.

## Requirements Covered
- **AUTH-01:** Registration with name, email, password, and location.
- **AUTH-02:** User automatically receives initial time credits upon registration.
- **AUTH-03:** User can log in with email and password and receive a signed JWT token.
- **WALL-01:** Initial wallet balance initialized strictly server-side to 5 time credits in an atomic transaction.
