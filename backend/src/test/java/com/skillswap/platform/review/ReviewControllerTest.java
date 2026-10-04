package com.skillswap.platform.review;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.platform.auth.dto.RegisterRequest;
import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.exchange.entity.ExchangeStatus;
import com.skillswap.platform.exchange.repository.ExchangeRequestRepository;
import com.skillswap.platform.review.dto.CreateReviewRequest;
import com.skillswap.platform.review.repository.ReviewRepository;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.skill.repository.SkillRepository;
import com.skillswap.platform.booking.repository.BookingRepository;
import com.skillswap.platform.profile.repository.UserSkillRepository;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import com.skillswap.platform.wallet.repository.CreditTransactionRepository;
import com.skillswap.platform.wallet.repository.WalletRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ExchangeRequestRepository exchangeRequestRepository;

    @Autowired
    private CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    private String aliceToken;
    private Long aliceId;
    private String bobToken;
    private Long bobId;
    private Skill skill;
    private ExchangeRequest completedExchange;

    @BeforeEach
    void setUp() throws Exception {
        cleanDb();

        // 1. Seed Skill
        skill = skillRepository.save(new Skill("Graphic Design", "Arts & Design"));

        // 2. Register Users
        aliceToken = registerUser("Alice Artist", "alice.review@example.com", "Password123!", "Seattle, WA");
        aliceId = getUserIdByEmail("alice.review@example.com");

        bobToken = registerUser("Bob Designer", "bob.review@example.com", "Password123!", "Portland, OR");
        bobId = getUserIdByEmail("bob.review@example.com");

        // 3. Create Completed Exchange
        User alice = userRepository.findById(aliceId).orElseThrow();
        User bob = userRepository.findById(bobId).orElseThrow();

        completedExchange = new ExchangeRequest(alice, bob, skill, new BigDecimal("2.00"), "Branding session");
        completedExchange.setStatus(ExchangeStatus.COMPLETED);
        completedExchange.setProviderConfirmed(true);
        completedExchange.setRequesterConfirmed(true);
        completedExchange = exchangeRequestRepository.save(completedExchange);
    }

    @AfterEach
    void tearDown() {
        cleanDb();
    }

    private void cleanDb() {
        reviewRepository.deleteAll();
        creditTransactionRepository.deleteAll();
        bookingRepository.deleteAll();
        exchangeRequestRepository.deleteAll();
        userSkillRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();
        skillRepository.deleteAll();
    }

    private String registerUser(String name, String email, String password, String location) throws Exception {
        RegisterRequest req = new RegisterRequest(name, email, password, location);
        MvcResult res = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).get("token").asText();
    }

    private Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow().getId();
    }

    @Test
    @DisplayName("POST /api/v1/reviews by participant on completed exchange should create review and return 201 Created")
    void shouldCreateReviewSuccessfully() throws Exception {
        CreateReviewRequest request = new CreateReviewRequest(
                completedExchange.getId(),
                5,
                "Bob was fantastic, gave great design feedback!"
        );

        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Bob was fantastic, gave great design feedback!"))
                .andExpect(jsonPath("$.reviewerName").value("Alice Artist"))
                .andExpect(jsonPath("$.revieweeName").value("Bob Designer"))
                .andExpect(jsonPath("$.skillTitle").value("Graphic Design"));
    }

    @Test
    @DisplayName("POST /api/v1/reviews duplicate submission on same exchange should return 409 Conflict")
    void shouldRejectDuplicateReviewSubmission() throws Exception {
        CreateReviewRequest request = new CreateReviewRequest(
                completedExchange.getId(),
                4,
                "First review"
        );

        // Submit once
        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Submit again on same exchange by same user
        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /api/v1/reviews with invalid rating should return 400 Bad Request")
    void shouldRejectInvalidRatingRange() throws Exception {
        CreateReviewRequest request = new CreateReviewRequest(
                completedExchange.getId(),
                6, // Invalid rating > 5
                "Invalid rating value"
        );

        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/reviews/member/{memberId} should return reviews list publicly")
    void shouldReturnPublicReviewsForMember() throws Exception {
        // Create review first
        CreateReviewRequest request = new CreateReviewRequest(
                completedExchange.getId(),
                5,
                "Wonderful mentor!"
        );

        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Public GET without token
        mockMvc.perform(get("/api/v1/reviews/member/" + bobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].rating").value(5))
                .andExpect(jsonPath("$[0].reviewerName").value("Alice Artist"))
                .andExpect(jsonPath("$[0].comment").value("Wonderful mentor!"));
    }

    @Test
    @DisplayName("GET /api/v1/reviews/exchange/{exchangeId}/status should return hasReviewed true after review")
    void shouldReturnReviewStatusForExchange() throws Exception {
        // Initially false
        mockMvc.perform(get("/api/v1/reviews/exchange/" + completedExchange.getId() + "/status")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasReviewed").value(false))
                .andExpect(jsonPath("$.review").doesNotExist());

        // Alice submits review
        CreateReviewRequest request = new CreateReviewRequest(
                completedExchange.getId(),
                5,
                "Top notch skill swap!"
        );
        mockMvc.perform(post("/api/v1/reviews")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Now returns true
        mockMvc.perform(get("/api/v1/reviews/exchange/" + completedExchange.getId() + "/status")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasReviewed").value(true))
                .andExpect(jsonPath("$.review.rating").value(5));
    }

    @Test
    @DisplayName("POST /api/v1/reviews without token should return 401 Unauthorized")
    void shouldDenyReviewSubmissionWithoutAuth() throws Exception {
        CreateReviewRequest request = new CreateReviewRequest(completedExchange.getId(), 5, "Unauthenticated");

        mockMvc.perform(post("/api/v1/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
