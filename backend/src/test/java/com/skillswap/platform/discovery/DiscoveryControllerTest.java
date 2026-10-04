package com.skillswap.platform.discovery;

import com.skillswap.platform.profile.entity.UserSkill;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DiscoveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private com.skillswap.platform.wallet.repository.CreditTransactionRepository creditTransactionRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    private User alice;
    private User bob;
    private User charlie;
    private User diana;

    @BeforeEach
    void setUp() {
        creditTransactionRepository.deleteAll();
        userSkillRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();
        skillRepository.deleteAll();

        // 1. Seed Skills
        Skill python = skillRepository.save(new Skill("Python Programming", "Technology"));
        Skill spanish = skillRepository.save(new Skill("Spanish Conversation", "Languages"));
        Skill design = skillRepository.save(new Skill("Graphic Design", "Arts & Design"));

        // 2. Seed Users
        alice = new User("Alice Cooper", "alice@example.com", "hash1", "Seattle, WA");
        alice.setBio("Experienced python backend engineer");
        alice.setAverageRating(4.9);
        alice.setTotalReviews(12);
        alice = userRepository.save(alice);

        bob = new User("Bob Martin", "bob@example.com", "hash2", "Portland, OR");
        bob.setBio("Native Spanish language teacher");
        bob.setAverageRating(4.8);
        bob.setTotalReviews(8);
        bob = userRepository.save(bob);

        charlie = new User("Charlie Davis", "charlie@example.com", "hash3", "Seattle, WA");
        charlie.setBio("Visual branding and graphic artist");
        charlie.setAverageRating(3.5);
        charlie.setTotalReviews(2);
        charlie = userRepository.save(charlie);

        diana = new User("Diana Prince", "diana@example.com", "hash4", "Remote");
        diana.setBio("Learner searching for mentors");
        diana.setAverageRating(5.0);
        diana.setTotalReviews(0);
        diana = userRepository.save(diana);

        // 3. Seed Offered UserSkills
        userSkillRepository.save(new UserSkill(alice.getId(), python, "OFFERED", "ADVANCED"));
        userSkillRepository.save(new UserSkill(bob.getId(), spanish, "OFFERED", "INTERMEDIATE"));
        userSkillRepository.save(new UserSkill(charlie.getId(), design, "OFFERED", "BEGINNER"));

        // Diana offers nothing, only wants python
        userSkillRepository.save(new UserSkill(diana.getId(), python, "WANTED", null));
    }

    @Test
    @DisplayName("Should return paginated providers who offer skills, excluding non-providers")
    void shouldReturnPaginatedProviders() throws Exception {
        mockMvc.perform(get("/api/v1/members/search")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.totalElements", is(3)))
                .andExpect(jsonPath("$.content[*].name", containsInAnyOrder("Alice Cooper", "Bob Martin", "Charlie Davis")))
                .andExpect(jsonPath("$.content[*].name", not(hasItem("Diana Prince"))));
    }

    @Test
    @DisplayName("Should filter providers by category")
    void shouldFilterByCategory() throws Exception {
        mockMvc.perform(get("/api/v1/members/search")
                        .param("category", "Technology")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Alice Cooper")))
                .andExpect(jsonPath("$.content[0].offeredSkills[0].skillName", is("Python Programming")));
    }

    @Test
    @DisplayName("Should filter providers by location and keyword")
    void shouldFilterByLocationAndKeyword() throws Exception {
        // Location Seattle
        mockMvc.perform(get("/api/v1/members/search")
                        .param("location", "Seattle")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[*].name", containsInAnyOrder("Alice Cooper", "Charlie Davis")));

        // Location Seattle + keyword Python
        mockMvc.perform(get("/api/v1/members/search")
                        .param("location", "Seattle")
                        .param("keyword", "Python")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Alice Cooper")));
    }

    @Test
    @DisplayName("Should filter providers by minimum rating threshold")
    void shouldFilterByMinRating() throws Exception {
        mockMvc.perform(get("/api/v1/members/search")
                        .param("minRating", "4.0")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[*].name", containsInAnyOrder("Alice Cooper", "Bob Martin")))
                .andExpect(jsonPath("$.content[*].name", not(hasItem("Charlie Davis"))));
    }

    @Test
    @DisplayName("Should sort providers by name ascending")
    void shouldSortProvidersByNameAsc() throws Exception {
        mockMvc.perform(get("/api/v1/members/search")
                        .param("sortBy", "NAME_ASC")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name", is("Alice Cooper")))
                .andExpect(jsonPath("$.content[1].name", is("Bob Martin")))
                .andExpect(jsonPath("$.content[2].name", is("Charlie Davis")));
    }

    @Test
    @DisplayName("Should sanitize response and not disclose sensitive credentials or balances")
    void shouldSanitizeSensitiveDataInMemberCards() throws Exception {
        mockMvc.perform(get("/api/v1/members/search")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").doesNotExist())
                .andExpect(jsonPath("$.content[0].passwordHash").doesNotExist())
                .andExpect(jsonPath("$.content[0].role").doesNotExist())
                .andExpect(jsonPath("$.content[0].walletBalance").doesNotExist());
    }
}
