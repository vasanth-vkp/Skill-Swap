package com.skillswap.platform.recommendation;

import com.skillswap.platform.recommendation.engine.CompatibilityCalculator;
import com.skillswap.platform.recommendation.engine.SemanticSkillMatcher;
import com.skillswap.platform.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SemanticSkillMatcherTest {

    private SemanticSkillMatcher matcher;
    private CompatibilityCalculator calculator;

    @BeforeEach
    void setUp() {
        matcher = new SemanticSkillMatcher();
        calculator = new CompatibilityCalculator();
    }

    @Test
    @DisplayName("Should return 1.0 for exact skill matches")
    void shouldReturnOneForExactMatch() {
        double score = matcher.matchSkills("Python Programming", "Technology", "Python Programming", "Technology");
        assertEquals(1.0, score, 0.001);
    }

    @Test
    @DisplayName("Should return >= 0.90 for direct substring containment")
    void shouldReturnHighForSubstringMatch() {
        double score = matcher.matchSkills("Python", "Technology", "Python Programming", "Technology");
        assertTrue(score >= 0.90);
    }

    @Test
    @DisplayName("Should return 0.85 for known synonym pairs")
    void shouldReturnEightyFiveForSynonyms() {
        double score = matcher.matchSkills("Math", "Academics", "Calculus & Algebra", "Academics");
        assertEquals(0.85, score, 0.001);
    }

    @Test
    @DisplayName("Should return 0.85 for complementary skill pairings")
    void shouldReturnEightyFiveForComplementaryPairing() {
        double score = matcher.matchSkills("UI/UX Design", "Technology", "Web Development", "Technology");
        assertEquals(0.85, score, 0.001);
    }

    @Test
    @DisplayName("Should return 0.70 for same category domain fallback")
    void shouldReturnSeventyForSameCategory() {
        double score = matcher.matchSkills("Cybersecurity", "Technology", "Mobile Apps", "Technology");
        assertEquals(0.70, score, 0.001);
    }

    @Test
    @DisplayName("Should return 0.0 for unrelated skills across different domains")
    void shouldReturnZeroForUnrelatedSkills() {
        double score = matcher.matchSkills("Gardening", "Trades & Practical", "Python Programming", "Technology");
        assertEquals(0.0, score, 0.001);
    }

    @Test
    @DisplayName("Should calculate composite compatibility score and include mutual match bonus")
    void shouldCalculateCompatibilityScore() {
        User requester = new User("Alice", "alice@example.com", "hash", "Seattle, WA");
        User provider = new User("Bob", "bob@example.com", "hash", "Seattle, WA");
        provider.setAverageRating(4.9);

        // Exact skill match (1.0) with mutual match bonus
        CompatibilityCalculator.CalculationResult result = calculator.calculate(
                requester,
                provider,
                1.0,
                "ADVANCED",
                true,
                "Python Programming"
        );

        assertTrue(result.compatibilityPercentage() >= 95, "Score should be >= 95%");
        assertTrue(result.isMutualMatch());
        assertTrue(result.matchReasons().stream().anyMatch(r -> r.contains("Mutual match")));
        assertTrue(result.matchReasons().stream().anyMatch(r -> r.contains("Seattle")));
        assertTrue(result.matchReasons().stream().anyMatch(r -> r.contains("Python Programming")));
    }
}
