package com.skillswap.platform.profile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.platform.auth.dto.RegisterRequest;
import com.skillswap.platform.profile.dto.AddUserSkillRequest;
import com.skillswap.platform.profile.dto.UpdateProfileRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProfileControllerTest {

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

    private String userToken;
    private Long testUserId;
    private Skill seededSkill;

    @BeforeEach
    void setUp() throws Exception {
        userSkillRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();
        skillRepository.deleteAll();

        seededSkill = skillRepository.save(new Skill("Web Development", "Technology"));

        RegisterRequest registerReq = new RegisterRequest(
                "Morgan Reed",
                "morgan@example.com",
                "Password123!",
                "Seattle, WA"
        );

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        userToken = objectMapper.readTree(body).get("token").asText();
        testUserId = objectMapper.readTree(body).get("userId").asLong();
    }

    @Test
    @DisplayName("GET /api/v1/profile/me should return personal profile with offered and wanted skills")
    void shouldGetPersonalProfile() throws Exception {
        mockMvc.perform(get("/api/v1/profile/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(testUserId))
                .andExpect(jsonPath("$.email").value("morgan@example.com"))
                .andExpect(jsonPath("$.name").value("Morgan Reed"))
                .andExpect(jsonPath("$.offeredSkills", is(empty())))
                .andExpect(jsonPath("$.wantedSkills", is(empty())));
    }

    @Test
    @DisplayName("PUT /api/v1/profile/me should update bio, location, and avatarUrl")
    void shouldUpdatePersonalProfile() throws Exception {
        UpdateProfileRequest updateReq = new UpdateProfileRequest(
                "Morgan Reed-Cooper",
                "Passionate web engineer and urban gardener.",
                "Portland, OR",
                "https://example.com/avatar.png"
        );

        mockMvc.perform(put("/api/v1/profile/me")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Morgan Reed-Cooper"))
                .andExpect(jsonPath("$.bio").value("Passionate web engineer and urban gardener."))
                .andExpect(jsonPath("$.location").value("Portland, OR"))
                .andExpect(jsonPath("$.avatarUrl").value("https://example.com/avatar.png"));
    }

    @Test
    @DisplayName("POST /api/v1/profile/skills should add OFFERED skill with experience level and WANTED skill tag")
    void shouldAddOfferedAndWantedSkills() throws Exception {
        // Add OFFERED skill
        AddUserSkillRequest offeredReq = new AddUserSkillRequest(
                seededSkill.getId(),
                null,
                null,
                "OFFERED",
                "INTERMEDIATE"
        );

        MvcResult addOfferedResult = mockMvc.perform(post("/api/v1/profile/skills")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offeredReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.skillName").value("Web Development"))
                .andExpect(jsonPath("$.type").value("OFFERED"))
                .andExpect(jsonPath("$.experience").value("INTERMEDIATE"))
                .andReturn();

        Long userSkillId = objectMapper.readTree(addOfferedResult.getResponse().getContentAsString()).get("id").asLong();

        // Duplicate OFFERED skill should reject with 409 Conflict
        mockMvc.perform(post("/api/v1/profile/skills")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(offeredReq)))
                .andExpect(status().isConflict());

        // Add WANTED custom skill
        AddUserSkillRequest wantedReq = new AddUserSkillRequest(
                null,
                "Woodworking Basics",
                "Trades & Practical",
                "WANTED",
                null
        );

        mockMvc.perform(post("/api/v1/profile/skills")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wantedReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.skillName").value("Woodworking Basics"))
                .andExpect(jsonPath("$.type").value("WANTED"))
                .andExpect(jsonPath("$.experience").doesNotExist());

        // DELETE user skill
        mockMvc.perform(delete("/api/v1/profile/skills/" + userSkillId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/v1/members/{id} should return public profile without sensitive credentials")
    void shouldReturnSanitizedPublicMemberProfile() throws Exception {
        // Update bio first
        UpdateProfileRequest updateReq = new UpdateProfileRequest(
                "Morgan Reed",
                "Public bio for the community.",
                "Seattle, WA",
                null
        );

        mockMvc.perform(put("/api/v1/profile/me")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk());

        // Public request (no Authorization header required)
        mockMvc.perform(get("/api/v1/members/" + testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUserId))
                .andExpect(jsonPath("$.name").value("Morgan Reed"))
                .andExpect(jsonPath("$.bio").value("Public bio for the community."))
                .andExpect(jsonPath("$.location").value("Seattle, WA"))
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.walletBalance").doesNotExist());
    }
}
