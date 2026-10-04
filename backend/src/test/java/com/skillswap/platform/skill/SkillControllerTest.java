package com.skillswap.platform.skill;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillswap.platform.skill.dto.CreateSkillRequest;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.skill.repository.SkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SkillControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SkillRepository skillRepository;

    @BeforeEach
    void setUp() {
        skillRepository.deleteAll();
        skillRepository.saveAll(List.of(
                new Skill("Web Development", "Technology"),
                new Skill("Python Programming", "Technology"),
                new Skill("Spanish Conversation", "Languages"),
                new Skill("Acoustic Guitar", "Arts & Design"),
                new Skill("Vinyasa Yoga", "Health & Wellness")
        ));
    }

    @Test
    @DisplayName("GET /api/v1/skills should return all catalog skills")
    void shouldReturnAllSkills() throws Exception {
        mockMvc.perform(get("/api/v1/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)))
                .andExpect(jsonPath("$[*].name", hasItem("Python Programming")));
    }

    @Test
    @DisplayName("GET /api/v1/skills?category=Technology should filter skills by category")
    void shouldFilterSkillsByCategory() throws Exception {
        mockMvc.perform(get("/api/v1/skills")
                        .param("category", "Technology"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].category").value("Technology"))
                .andExpect(jsonPath("$[1].category").value("Technology"));
    }

    @Test
    @DisplayName("GET /api/v1/skills?search=Yoga should search skills by name keyword")
    void shouldSearchSkillsByKeyword() throws Exception {
        mockMvc.perform(get("/api/v1/skills")
                        .param("search", "Yoga"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Vinyasa Yoga"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/skills should create custom skill and return 201 Created")
    void shouldCreateCustomSkill() throws Exception {
        CreateSkillRequest request = new CreateSkillRequest("Robotics with Arduino", "Technology");

        mockMvc.perform(post("/api/v1/skills")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Robotics with Arduino"))
                .andExpect(jsonPath("$.category").value("Technology"));
    }
}
