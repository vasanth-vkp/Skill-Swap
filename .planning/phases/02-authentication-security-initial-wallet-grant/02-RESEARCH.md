# Phase 2: Authentication, Security & Initial Wallet Grant - Research

**Researched:** 2026-10-04
**Domain:** Spring Boot 3 Security (JWT, BCrypt) + React 19 SPA Authentication & Wallet Provisioning
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Seamless auto-login on signup: The registration endpoint (`POST /api/v1/auth/register`) returns a signed JWT token, user profile details, and wallet balance directly, signing the user in immediately without requiring a separate login step.
- **D-02:** Welcome modal celebration: Newly registered members are greeted with a celebratory popup modal showcasing a sparkling time-credit graphic and the announcement: *"Welcome to SkillSwap! We've gifted you 5 Time Credits to start exchanging skills"*, featuring a CTA button to explore skills.
- **D-03:** First landing destination: After registration and welcome modal dismissal, the user is navigated to the Member Dashboard (`/dashboard`), prominently displaying their 5-credit balance card and quick action prompts.
- **D-04:** Single-step registration form: Collects Full Name, Email Address, Password (with toggleable show/hide eye), and Location (City/State), keeping signup frictionless and directly fulfilling requirement AUTH-01.
- **D-05:** JWT storage & transmission: The signed JWT token is stored in `localStorage` and transmitted on authenticated requests via `Authorization: Bearer <token>` through an Axios request interceptor. React `AuthContext` provides reactive auth state across the SPA.
- **D-06:** Token lifetime: 24-hour access token (86,400s) signed with HMAC-SHA256 (`jwt.secret`), avoiding complex refresh token sync during hackathon evaluation while ensuring reliable sessions.
- **D-07:** Password validation & hashing: Balanced policy requiring minimum 8 characters containing letters and at least one digit; backend hashes passwords with BCrypt (strength 12) before persisting to PostgreSQL `users.password_hash`.
- **D-08:** Protected routing & 401 recovery: `ProtectedRoute` redirects unauthenticated users to `/login` preserving target route (`state: { from: location }`); Axios response interceptor catches 401 Unauthorized responses, clears credentials, resets `AuthContext`, and displays an auth-expired toast.

### The Agent's Discretion
- Standard JWT claims structure (`sub: userId`, `email`, `role: "ROLE_MEMBER"`, `iat`, `exp`).
- Toast notification styles and animation timing.
- Specific error response payloads for registration conflicts (duplicate email: HTTP 409) and bad credentials (HTTP 401).

### Deferred Ideas (OUT OF SCOPE)
- OAuth2 / Social Login (Google, GitHub) — deferred to post-hackathon enhancement.
- Multi-factor authentication (MFA) — out of scope for MVP.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| User Registration & Validation | API/Backend | Browser/Client | Backend validates email uniqueness, format, and hashes password; client provides responsive format checks |
| Initial Wallet Provisioning (5 credits) | API/Backend | Database/Storage | Enforced strictly in database transaction on server; client cannot mutate balance |
| JWT Generation & Signing | API/Backend | — | Server signs JWT with HMAC-SHA256 secret key |
| JWT Verification & Auth Filter | API/Backend | — | `JwtAuthenticationFilter` validates signature and extracts user claims on every request |
| Client Auth Context & Token Storage | Browser/Client | — | Stored in `localStorage`, injected by Axios request interceptor into `Authorization: Bearer` |
| Protected SPA Route Gate | Browser/Client | API/Backend | React `ProtectedRoute` redirects to `/login`; Spring Security rejects unauthorized API calls with 401 |
| Welcome Modal & Dashboard Navigation | Browser/Client | — | Client displays celebratory 5-credit modal upon new registration state |
</architectural_responsibility_map>

<research_summary>
## Summary

This phase implements user identity, secure credential management, JWT issuance/validation, and transactional wallet initialization. In Spring Boot 3.3.x, `SecurityFilterChain` bean configuration replaces legacy `WebSecurityConfigurerAdapter`. `BCryptPasswordEncoder(12)` provides cryptographically sound one-way password hashing. The JJWT library (`io.jsonwebtoken:jjwt-api:0.12.6`, `jjwt-impl`, `jjwt-jackson`) is the standard Java library for compact HMAC-SHA256 JWT serialization and parser building.

Crucially, when a user registers, the platform executes an atomic `@Transactional` service call that creates the `User` entity and initializes a `Wallet` entity with `balance = 5`. The response packages the newly created member details, wallet balance, and a 24-hour signed JWT, satisfying D-01 and WALL-01.

On the React 19 frontend, an `AuthContext` provides global authentication state (`user`, `token`, `isAuthenticated`, `login`, `register`, `logout`). An Axios interceptor automatically appends `Authorization: Bearer <token>` to all outgoing requests and catches 401 responses to cleanly handle session expiry.

**Primary recommendation:** Use JJWT 0.12.6 with an `@Transactional` user registration method that creates both user and wallet entities in a single atomic database commit, returning the JWT token for seamless auto-login.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library / Component | Version | Purpose | Why Standard |
|---------------------|---------|---------|--------------|
| `spring-boot-starter-security` | 3.3.x | Security filter chain & authentication manager | Standard enterprise authentication framework for Spring Boot |
| `io.jsonwebtoken:jjwt-api` | 0.12.6 | JWT token builder & parser | Modern, fluent, zero-deprecation API for Java 17/21 |
| `io.jsonwebtoken:jjwt-impl` | 0.12.6 | Runtime implementation of JJWT | Required runtime engine for JJWT |
| `io.jsonwebtoken:jjwt-jackson` | 0.12.6 | JSON claim deserialization via Jackson | Native integration with Spring's Jackson ObjectMapper |
| `bcrypt` (Spring Security Crypto) | Built-in | Salted password hashing | Resistant to rainbow tables; strength 12 balances safety and latency (~100ms) |
| `react-router-dom` | 6.x / 7.x | Client-side routing & ProtectedRoute wrapper | Standard React router with location state history |
| `axios` | 1.7.x | HTTP client with request/response interceptors | Reliable Bearer header injection and 401 error interception |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | Latest | Iconography (Eye, EyeOff, Sparkles, Coins, Lock) | Password visibility toggle and welcome modal graphics |
| `jakarta.validation-api` | 3.0.x | Request DTO validation (`@NotBlank`, `@Email`, `@Size`) | Controller-level request validation before processing |

**Installation:**
```xml
<!-- In backend pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

```bash
# In frontend package.json
npm install axios lucide-react react-router-dom
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Authentication Flow Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT (React 19)                               |
+---------------------------------------------------------------------------------+
        |                                                        ^
1. POST /api/v1/auth/register                                   | 3. Returns {token,
   {name, email, password, location}                             |    user, wallet: {balance: 5}}
        |                                                        |
        v                                                        |
+---------------------------------------------------------------------------------+
|                             API GATEWAY / SPRING BOOT                           |
+---------------------------------------------------------------------------------+
|  SecurityFilterChain: PermitAll -> /api/v1/auth/**, /api/v1/health             |
|                                                                                 |
|  AuthController.register(RegisterRequest)                                       |
|         |                                                                       |
|         v                                                                       |
|  AuthService.register(dto) [@Transactional]                                     |
|         |-- 1. Check email availability (throw ConflictException if exists)     |
|         |-- 2. Hash password: passwordEncoder.encode(dto.password())            |
|         |-- 3. Save User(name, email, hash, location, role: "ROLE_MEMBER")      |
|         |-- 4. Save Wallet(userId, balance: 5)                                  |
|         `-- 5. Generate JWT: jwtService.generateToken(user) (24h validity)      |
+---------------------------------------------------------------------------------+
        |
        v
+---------------------------------------------------------------------------------+
|                               POSTGRESQL DATABASE                               |
|   TABLE users (id, name, email, password_hash, location, role, created_at)      |
|   TABLE wallets (id, user_id, balance=5, updated_at)                            |
+---------------------------------------------------------------------------------+
```

### Key Pattern: JWT Stateless Filter Chain
Spring Boot 3 `SecurityFilterChain` configured with:
- `sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`
- `csrf(csrf -> csrf.disable())` (safe for stateless Bearer token authentication)
- `addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`
- `cors(Customizer.withDefaults())` configured for `http://localhost:5173`

</architecture_patterns>

<validation_architecture>
## Validation Architecture

1. **Unit Testing:**
   - `JwtServiceTest`: Asserts token generation contains valid claims, correct expiration (24h), and passes signature verification.
   - `AuthServiceTest`: Asserts atomic user + wallet creation with balance = 5, and duplicate email throws Conflict.
2. **Integration Testing (MockMvc):**
   - `POST /api/v1/auth/register`: Returns 201 Created with JWT token and wallet balance 5.
   - `POST /api/v1/auth/login`: Returns 200 OK with valid credentials; 401 Unauthorized with bad password.
   - Protected endpoint verification: Accessing `/api/v1/users/me` without Bearer returns 401; with valid Bearer returns 200.
3. **Frontend Testing:**
   - `Register.test.jsx`: Validates form fields, password validation feedback, and submit triggers `AuthContext.register`.
   - `ProtectedRoute.test.jsx`: Asserts redirect to `/login` when unauthenticated, and passes through when authenticated.
</validation_architecture>
