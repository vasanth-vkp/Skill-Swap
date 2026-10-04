package com.skillswap.platform.exchange;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.platform.auth.dto.RegisterRequest;
import com.skillswap.platform.exchange.dto.CreateExchangeRequest;
import com.skillswap.platform.exchange.repository.ExchangeRequestRepository;
import com.skillswap.platform.profile.dto.AddUserSkillRequest;
import com.skillswap.platform.profile.repository.UserSkillRepository;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.skill.repository.SkillRepository;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import com.skillswap.platform.wallet.repository.WalletRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ExchangeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExchangeRequestRepository exchangeRequestRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private com.skillswap.platform.wallet.repository.CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    private String aliceToken;
    private Long aliceId;

    private String bobToken;
    private Long bobId;

    private String charlieToken;
    private Long charlieId;

    private Skill pythonSkill;
    private Skill webDevSkill;

    @BeforeEach
    void setUp() throws Exception {
        creditTransactionRepository.deleteAll();
        exchangeRequestRepository.deleteAll();
        userSkillRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();
        skillRepository.deleteAll();

        // 1. Seed Skills
        pythonSkill = skillRepository.save(new Skill("Python Programming", "Technology"));
        webDevSkill = skillRepository.save(new Skill("Web Development", "Technology"));

        // 2. Register Users
        aliceToken = registerUser("Alice", "alice@example.com", "Password123", "Seattle, WA");
        aliceId = getUserIdByEmail("alice@example.com");

        bobToken = registerUser("Bob", "bob@example.com", "Password123", "Seattle, WA");
        bobId = getUserIdByEmail("bob@example.com");

        charlieToken = registerUser("Charlie", "charlie@example.com", "Password123", "Portland, OR");
        charlieId = getUserIdByEmail("charlie@example.com");

        // 3. Setup Bob: Offers Python
        addSkill(bobToken, pythonSkill.getId(), "OFFERED", "ADVANCED");

        // 4. Setup Alice: Offers WebDev
        addSkill(aliceToken, webDevSkill.getId(), "OFFERED", "ADVANCED");
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        creditTransactionRepository.deleteAll();
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
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }

    private void addSkill(String token, Long skillId, String type, String experience) throws Exception {
        AddUserSkillRequest req = new AddUserSkillRequest(skillId, null, null, type, experience);
        mockMvc.perform(post("/api/v1/profile/skills")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    private Long createTestExchange(String requesterToken, Long providerId, Long skillId, BigDecimal duration, String notes) throws Exception {
        CreateExchangeRequest req = new CreateExchangeRequest(providerId, skillId, duration, notes);
        MvcResult res = mockMvc.perform(post("/api/v1/exchanges")
                        .header("Authorization", "Bearer " + requesterToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asLong();
    }

    @Test
    @DisplayName("Should successfully create exchange request when authenticated and valid")
    void shouldCreateExchangeRequestSuccessfully() throws Exception {
        CreateExchangeRequest req = new CreateExchangeRequest(bobId, pythonSkill.getId(), new BigDecimal("1.50"), "Learn Python Flask");

        mockMvc.perform(post("/api/v1/exchanges")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.requesterName", is("Alice")))
                .andExpect(jsonPath("$.providerName", is("Bob")))
                .andExpect(jsonPath("$.skillName", is("Python Programming")))
                .andExpect(jsonPath("$.duration", is(1.50)))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.notes", is("Learn Python Flask")));
    }

    @Test
    @DisplayName("Should reject unauthenticated exchange creation with HTTP 401 Unauthorized")
    void shouldRejectUnauthenticatedRequest() throws Exception {
        CreateExchangeRequest req = new CreateExchangeRequest(bobId, pythonSkill.getId(), new BigDecimal("1.00"), "Learn");

        mockMvc.perform(post("/api/v1/exchanges")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should reject self-request with HTTP 400 Bad Request")
    void shouldRejectSelfRequest() throws Exception {
        CreateExchangeRequest req = new CreateExchangeRequest(aliceId, webDevSkill.getId(), new BigDecimal("1.00"), "Self request");

        mockMvc.perform(post("/api/v1/exchanges")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("cannot request an exchange with yourself")));
    }

    @Test
    @DisplayName("Should allow provider to accept incoming exchange request")
    void shouldAllowProviderToAcceptIncomingExchange() throws Exception {
        Long exchangeId = createTestExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"), "Notes");

        mockMvc.perform(put("/api/v1/exchanges/" + exchangeId + "/accept")
                        .header("Authorization", "Bearer " + bobToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")));
    }

    @Test
    @DisplayName("Should forbid non-provider from accepting exchange request with HTTP 403 Forbidden")
    void shouldForbidNonProviderFromAcceptingExchange() throws Exception {
        Long exchangeId = createTestExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"), "Notes");

        mockMvc.perform(put("/api/v1/exchanges/" + exchangeId + "/accept")
                        .header("Authorization", "Bearer " + charlieToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("Only the designated provider can accept")));
    }

    @Test
    @DisplayName("Should allow requester to cancel pending exchange request")
    void shouldAllowRequesterToCancelPendingExchange() throws Exception {
        Long exchangeId = createTestExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"), "Notes");

        mockMvc.perform(put("/api/v1/exchanges/" + exchangeId + "/cancel")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));
    }

    @Test
    @DisplayName("Should forbid non-requester from cancelling exchange request with HTTP 403 Forbidden")
    void shouldForbidNonRequesterFromCancellingExchange() throws Exception {
        Long exchangeId = createTestExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"), "Notes");

        mockMvc.perform(put("/api/v1/exchanges/" + exchangeId + "/cancel")
                        .header("Authorization", "Bearer " + bobToken) // Bob is provider, not requester
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("Only the requester can cancel")));
    }

    @Test
    @DisplayName("Should allow provider to reject incoming exchange request")
    void shouldAllowProviderToRejectIncomingExchange() throws Exception {
        Long exchangeId = createTestExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"), "Notes");

        mockMvc.perform(put("/api/v1/exchanges/" + exchangeId + "/reject")
                        .header("Authorization", "Bearer " + bobToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REJECTED")));
    }

    @Test
    @DisplayName("Should list incoming and outgoing exchange requests filtered by status")
    void shouldListIncomingAndOutgoingExchangesFilteredByStatus() throws Exception {
        createTestExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("2.00"), "Python course");

        // 1. Bob queries incoming requests
        mockMvc.perform(get("/api/v1/exchanges/incoming?status=PENDING")
                        .header("Authorization", "Bearer " + bobToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].requesterName", is("Alice")))
                .andExpect(jsonPath("$[0].duration", is(2.00)));

        // 2. Alice queries outgoing requests
        mockMvc.perform(get("/api/v1/exchanges/outgoing?status=PENDING")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].providerName", is("Bob")))
                .andExpect(jsonPath("$[0].skillName", is("Python Programming")));
    }

    @Test
    @DisplayName("Should handle dual confirmation completion flow transitioning to COMPLETED")
    void shouldHandleDualConfirmationCompletionFlow() throws Exception {
        Long exchangeId = createTestExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"), "Notes");

        // Accept exchange first
        mockMvc.perform(put("/api/v1/exchanges/" + exchangeId + "/accept")
                        .header("Authorization", "Bearer " + bobToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // 1. Bob (provider) confirms completion
        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/complete")
                        .header("Authorization", "Bearer " + bobToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.providerConfirmed", is(true)))
                .andExpect(jsonPath("$.requesterConfirmed", is(false)))
                .andExpect(jsonPath("$.status", is("ACCEPTED")));

        // 2. Non-participant Charlie cannot confirm
        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/complete")
                        .header("Authorization", "Bearer " + charlieToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        // 3. Alice (requester) confirms completion -> Status becomes COMPLETED
        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/complete")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.providerConfirmed", is(true)))
                .andExpect(jsonPath("$.requesterConfirmed", is(true)))
                .andExpect(jsonPath("$.status", is("COMPLETED")));
    }

    @Test
    @DisplayName("Should allow participant to dispute exchange and reject invalid dispute attempts")
    void shouldAllowParticipantToDisputeExchange() throws Exception {
        Long exchangeId = createTestExchange(aliceToken, bobId, pythonSkill.getId(), new BigDecimal("1.00"), "Notes");

        // Accept exchange
        mockMvc.perform(put("/api/v1/exchanges/" + exchangeId + "/accept")
                        .header("Authorization", "Bearer " + bobToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // 1. Blank reason returns 400 Bad Request
        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/dispute")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new com.skillswap.platform.exchange.dto.DisputeRequest("   "))))
                .andExpect(status().isBadRequest());

        // 2. Non-participant Charlie cannot dispute
        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/dispute")
                        .header("Authorization", "Bearer " + charlieToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new com.skillswap.platform.exchange.dto.DisputeRequest("Partner no-show"))))
                .andExpect(status().isForbidden());

        // 3. Participant Alice files valid dispute
        mockMvc.perform(post("/api/v1/exchanges/" + exchangeId + "/dispute")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new com.skillswap.platform.exchange.dto.DisputeRequest("Provider did not attend session"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DISPUTED")))
                .andExpect(jsonPath("$.disputeReason", is("Provider did not attend session")))
                .andExpect(jsonPath("$.disputedById", is(aliceId.intValue())));
    }
}
