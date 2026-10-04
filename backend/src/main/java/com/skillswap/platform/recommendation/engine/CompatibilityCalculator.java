package com.skillswap.platform.recommendation.engine;

import com.skillswap.platform.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CompatibilityCalculator {

    public record CalculationResult(
            int compatibilityPercentage,
            boolean isMutualMatch,
            List<String> matchReasons
    ) {}

    public CalculationResult calculate(
            User requester,
            User provider,
            double skillSimilarity,
            String experienceLevel,
            boolean isMutualMatch,
            String matchedSkillName
    ) {
        List<String> reasons = new ArrayList<>();

        // 1. Skill Score (Weight 40%)
        double skillScore = Math.min(1.0, Math.max(0.0, skillSimilarity));
        if (skillScore >= 0.95) {
            reasons.add("Offers skill you want: " + matchedSkillName);
        } else if (skillScore >= 0.80) {
            reasons.add("Offers complementary skill: " + matchedSkillName);
        } else if (skillScore > 0) {
            reasons.add("Active in related category");
        }

        // Mutual match indicator
        if (isMutualMatch) {
            reasons.add("Mutual match: wants skills you offer!");
        }

        // 2. Location Score (Weight 20%)
        double locationScore = computeLocationScore(requester.getLocation(), provider.getLocation(), reasons);

        // 3. Availability Score (Weight 15%)
        double availabilityScore = 1.0;

        // 4. Rating Score (Weight 15%)
        double rating = provider.getAverageRating() != null ? provider.getAverageRating() : 5.0;
        double ratingScore = Math.min(1.0, Math.max(0.0, rating / 5.0));
        if (rating >= 4.5) {
            reasons.add(String.format("Top-rated member (%.1f ★)", rating));
        }

        // 5. Experience Score (Weight 10%)
        double experienceScore = computeExperienceScore(experienceLevel, matchedSkillName, reasons);

        // Composite Weighted Score
        double compositeScore = (0.40 * skillScore) +
                                (0.20 * locationScore) +
                                (0.15 * availabilityScore) +
                                (0.15 * ratingScore) +
                                (0.10 * experienceScore);

        // Mutual Match Bonus (+10% score boost, capped at 1.0)
        if (isMutualMatch) {
            compositeScore = Math.min(1.0, compositeScore + 0.10);
        }

        int percentage = (int) Math.round(Math.min(1.0, Math.max(0.0, compositeScore)) * 100);

        return new CalculationResult(percentage, isMutualMatch, reasons);
    }

    private double computeLocationScore(String reqLoc, String provLoc, List<String> reasons) {
        if (reqLoc == null || provLoc == null) {
            return 0.50;
        }

        String r = reqLoc.trim().toLowerCase();
        String p = provLoc.trim().toLowerCase();

        if (r.equals(p) || r.contains(p) || p.contains(r)) {
            reasons.add("Same location (" + provLoc + ")");
            return 1.0;
        }

        if (r.contains("remote") || p.contains("remote")) {
            reasons.add("Available for remote exchange");
            return 0.90;
        }

        return 0.20;
    }

    private double computeExperienceScore(String exp, String skillName, List<String> reasons) {
        if (exp == null) return 0.50;

        return switch (exp.toUpperCase()) {
            case "ADVANCED" -> {
                reasons.add("Advanced experience in " + skillName);
                yield 1.0;
            }
            case "INTERMEDIATE" -> {
                yield 0.75;
            }
            default -> 0.50;
        };
    }
}
