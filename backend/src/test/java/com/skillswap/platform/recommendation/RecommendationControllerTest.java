package com.skillswap.platform.recommendation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.platform.auth.dto.RegisterRequest;
import com.skillswap.platform.profile.dto.AddUserSkillRequest;
import com.skillswap.platform.profile.repository.UserSkillRepository;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.skill.repository.SkillRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RecommendationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    private String aliceToken;
    private String bobToken;
    private String charlieToken;
    private String dianaToken;

    private Skill pythonSkill;
    private Skill webDevSkill;
    private Skill gardeningSkill;

    @BeforeEach
    void setUp() throws Exception {
        userSkillRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();
        skillRepository.deleteAll();

        // 1. Seed Skills
        pythonSkill = skillRepository.save(new Skill("Python Programming", "Technology"));
        webDevSkill = skillRepository.save(new Skill("Web Development", "Technology"));
        gardeningSkill = skillRepository.save(new Skill("Gardening & Urban Farming", "Trades & Practical"));

        // 2. Register Users
        aliceToken = registerUser("Alice", "alice@example.com", "Password123", "Seattle, WA");
        bobToken = registerUser("Bob", "bob@example.com", "Password123", "Seattle, WA");
        charlieToken = registerUser("Charlie", "charlie@example.com", "Password123", "Portland, OR");
        dianaToken = registerUser("Diana", "diana@example.com", "Password123", "Remote");

        // 3. Setup Alice: Offers WebDev, Wants Python
        addSkill(aliceToken, webDevSkill.getId(), "OFFERED", "ADVANCED");
        addSkill(aliceToken, pythonSkill.getId(), "WANTED", null);

        // 4. Setup Bob: Offers Python, Wants WebDev (MUTUAL MATCH with Alice!)
        addSkill(bobToken, pythonSkill.getId(), "OFFERED", "ADVANCED");
        addSkill(bobToken, webDevSkill.getId(), "WANTED", null);

        // 5. Setup Charlie: Offers Python, Wants Gardening (One-way match with Alice)
        addSkill(charlieToken, pythonSkill.getId(), "OFFERED", "INTERMEDIATE");
        addSkill(charlieToken, gardeningSkill.getId(), "WANTED", null);
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

    private void addSkill(String token, Long skillId, String type, String experience) throws Exception {
        AddUserSkillRequest req = new AddUserSkillRequest(skillId, null, null, type, experience);
        mockMvc.perform(post("/api/v1/profile/skills")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Should return top personalized recommendations for authenticated member")
    void shouldReturnTopRecommendationsForAuthenticatedUser() throws Exception {
        mockMvc.perform(get("/api/v1/recommendations/me")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].matchedSkillName", is("Python Programming")))
                .andExpect(jsonPath("$[0].compatibilityPercentage", greaterThanOrEqualTo(80)));
    }

    @Test
    @DisplayName("Should prioritize two-way mutual matches with isMutualMatch = true at rank #1")
    void shouldFlagAndPrioritizeMutualMatches() throws Exception {
        mockMvc.perform(get("/api/v1/recommendations/me")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].providerName", is("Bob")))
                .andExpect(jsonPath("$[0].isMutualMatch", is(true)))
                .andExpect(jsonPath("$[0].matchReasons", hasItem(containsString("Mutual match"))))
                .andExpect(jsonPath("$[1].providerName", is("Charlie")))
                .andExpect(jsonPath("$[1].isMutualMatch", is(false)));
    }

    @Test
    @DisplayName("Should gracefully fallback and recommend providers when member has no wanted skills yet")
    void shouldFallbackGracefullyWhenUserHasNoWantedSkills() throws Exception {
        mockMvc.perform(get("/api/v1/recommendations/me")
                        .header("Authorization", "Bearer " + dianaToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[*].providerName", hasItem("Bob")));
    }

    @Test
    @DisplayName("Should reject unauthenticated calls with HTTP 401 Unauthorized")
    void shouldRejectUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/api/v1/recommendations/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should sanitize recommendation payload and omit credentials, roles, and balances")
    void shouldSanitizeSensitiveData() throws Exception {
        mockMvc.perform(get("/api/v1/recommendations/me")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").doesNotExist())
                .andExpect(jsonPath("$[0].passwordHash").doesNotExist())
                .andExpect(jsonPath("$[0].role").doesNotExist())
                .andExpect(jsonPath("$[0].walletBalance").doesNotExist());
    }
}
