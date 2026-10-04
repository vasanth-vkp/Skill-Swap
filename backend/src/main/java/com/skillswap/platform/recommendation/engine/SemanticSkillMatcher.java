package com.skillswap.platform.recommendation.engine;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SemanticSkillMatcher {

    private static final Map<String, Set<String>> SYNONYM_CLUSTERS = new HashMap<>();
    private static final Map<String, Set<String>> COMPLEMENTARY_PAIRS = new HashMap<>();

    static {
        // Synonym clusters (normalized lowercase)
        addCluster("python", "python programming", "python3", "data analysis with python");
        addCluster("web development", "coding", "programming", "software development", "frontend", "full stack");
        addCluster("calculus & algebra", "calculus", "algebra", "math", "mathematics", "math tutoring");
        addCluster("graphic design", "design", "visual design", "illustration", "branding");
        addCluster("ui/ux design", "ui design", "ux design", "product design", "figma");
        addCluster("spanish", "spanish conversation", "conversational spanish", "spanish language");
        addCluster("english", "english conversation", "conversational english", "esl");
        addCluster("french", "french conversation", "conversational french");
        addCluster("personal fitness", "fitness", "workout", "gym", "personal training");
        addCluster("cooking & baking", "cooking", "baking", "culinary arts");
        addCluster("nutrition & meal prep", "nutrition", "meal prep", "healthy cooking");
        addCluster("digital photography", "photography", "photo editing", "lightroom");
        addCluster("video editing", "video production", "videography", "premiere pro");
        addCluster("mindfulness & meditation", "meditation", "mindfulness", "stress reduction");

        // Complementary pairings (cross-skill trade synergy)
        addPair("web development", "ui/ux design");
        addPair("web development", "graphic design");
        addPair("python programming", "data analysis");
        addPair("calculus & algebra", "physics");
        addPair("calculus & algebra", "economics");
        addPair("spanish conversation", "english conversation");
        addPair("french conversation", "english conversation");
        addPair("cooking & baking", "nutrition & meal prep");
        addPair("digital photography", "video editing");
        addPair("digital photography", "graphic design");
        addPair("yoga", "mindfulness & meditation");
        addPair("yoga", "pilates");
        addPair("personal fitness", "nutrition & meal prep");
    }

    private static void addCluster(String... terms) {
        Set<String> set = new HashSet<>();
        for (String t : terms) {
            set.add(normalize(t));
        }
        for (String t : terms) {
            SYNONYM_CLUSTERS.put(normalize(t), set);
        }
    }

    private static void addPair(String skillA, String skillB) {
        String a = normalize(skillA);
        String b = normalize(skillB);
        COMPLEMENTARY_PAIRS.computeIfAbsent(a, k -> new HashSet<>()).add(b);
        COMPLEMENTARY_PAIRS.computeIfAbsent(b, k -> new HashSet<>()).add(a);
    }

    private static String normalize(String s) {
        if (s == null) return "";
        return s.trim().toLowerCase().replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    /**
     * Calculates semantic similarity score between a wanted skill and an offered skill.
     * Returns a double between 0.0 and 1.0:
     * - 1.0: Exact match or direct containment
     * - 0.85: Known synonym or complementary pairing
     * - 0.70: Same category domain
     * - 0.0: Unrelated
     */
    public double matchSkills(String wantedSkill, String wantedCategory, String offeredSkill, String offeredCategory) {
        if (wantedSkill == null || offeredSkill == null) {
            return 0.0;
        }

        String wNorm = normalize(wantedSkill);
        String oNorm = normalize(offeredSkill);

        // 1. Exact string match
        if (wNorm.equals(oNorm)) {
            return 1.0;
        }

        // 2. Direct substring containment (e.g. "python" in "python programming")
        if (wNorm.contains(oNorm) || oNorm.contains(wNorm)) {
            return 0.95;
        }

        // 3. Synonym Cluster Check
        Set<String> wCluster = SYNONYM_CLUSTERS.get(wNorm);
        if (wCluster != null && wCluster.contains(oNorm)) {
            return 0.85;
        }

        Set<String> oCluster = SYNONYM_CLUSTERS.get(oNorm);
        if (oCluster != null && oCluster.contains(wNorm)) {
            return 0.85;
        }

        // 4. Complementary Pairings Check
        Set<String> wPairs = COMPLEMENTARY_PAIRS.get(wNorm);
        if (wPairs != null && (wPairs.contains(oNorm) || wPairs.stream().anyMatch(oNorm::contains))) {
            return 0.85;
        }

        // 5. Category Domain Match
        if (wantedCategory != null && offeredCategory != null &&
            wantedCategory.equalsIgnoreCase(offeredCategory) && !wantedCategory.isBlank()) {
            return 0.70;
        }

        return 0.0;
    }
}
