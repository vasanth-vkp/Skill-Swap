package com.skillswap.platform.wallet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.platform.auth.dto.RegisterRequest;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CreditTransactionRepository creditTransactionRepository;

    private String userToken;
    private Long userId;

    @BeforeEach
    void setUp() throws Exception {
        cleanDb();

        RegisterRequest request = new RegisterRequest(
                "Wallet TestUser",
                "wallet.user@example.com",
                "Password123!",
                "San Francisco, CA"
        );

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        userToken = objectMapper.readTree(responseBody).get("token").asText();
        userId = objectMapper.readTree(responseBody).get("userId").asLong();
    }

    @AfterEach
    void tearDown() {
        cleanDb();
    }

    private void cleanDb() {
        creditTransactionRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("GET /api/v1/wallet/me should return wallet summary with balance and totals")
    void shouldReturnWalletSummary() throws Exception {
        mockMvc.perform(get("/api/v1/wallet/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(5.00))
                .andExpect(jsonPath("$.totalEarned").value(0))
                .andExpect(jsonPath("$.totalSpent").value(0))
                .andExpect(jsonPath("$.completedExchangesCount").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/wallet/transactions should return transaction ledger containing INITIAL_GRANT")
    void shouldReturnTransactionLedger() throws Exception {
        mockMvc.perform(get("/api/v1/wallet/transactions")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].type").value("INITIAL_GRANT"))
                .andExpect(jsonPath("$[0].direction").value("INITIAL_GRANT"))
                .andExpect(jsonPath("$[0].amount").value(5.00))
                .andExpect(jsonPath("$[0].counterpartyName").value("SkillSwap Platform"));
    }

    @Test
    @DisplayName("GET /api/v1/wallet/me without token should return 401 Unauthorized")
    void shouldDenyWalletSummaryWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/wallet/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/wallet/transactions without token should return 401 Unauthorized")
    void shouldDenyWalletTransactionsWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/wallet/transactions"))
                .andExpect(status().isUnauthorized());
    }
}
