package com.skillswap.platform.recommendation.service;

import com.skillswap.platform.profile.dto.UserSkillDto;
import com.skillswap.platform.profile.service.UserSkillService;
import com.skillswap.platform.recommendation.dto.RecommendationDto;
import com.skillswap.platform.recommendation.engine.CompatibilityCalculator;
import com.skillswap.platform.recommendation.engine.SemanticSkillMatcher;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class RecommendationService {

    private final UserRepository userRepository;
    private final UserSkillService userSkillService;
    private final SemanticSkillMatcher semanticSkillMatcher;
    private final CompatibilityCalculator compatibilityCalculator;

    public RecommendationService(
            UserRepository userRepository,
            UserSkillService userSkillService,
            SemanticSkillMatcher semanticSkillMatcher,
            CompatibilityCalculator compatibilityCalculator
    ) {
        this.userRepository = userRepository;
        this.userSkillService = userSkillService;
        this.semanticSkillMatcher = semanticSkillMatcher;
        this.compatibilityCalculator = compatibilityCalculator;
    }

    @Transactional(readOnly = true)
    public List<RecommendationDto> getRecommendationsForUser(Long userId) {
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<UserSkillDto> myWantedSkills = userSkillService.getUserSkillsByType(userId, "WANTED");
        List<UserSkillDto> myOfferedSkills = userSkillService.getUserSkillsByType(userId, "OFFERED");

        List<User> allUsers = userRepository.findAll();
        List<RecommendationDto> candidates = new ArrayList<>();

        for (User candidate : allUsers) {
            if (candidate.getId().equals(userId)) {
                continue; // Skip self
            }

            List<UserSkillDto> candidateOffered = userSkillService.getUserSkillsByType(candidate.getId(), "OFFERED");
            if (candidateOffered.isEmpty()) {
                continue; // Cannot recommend someone who offers no skills
            }

            List<UserSkillDto> candidateWanted = userSkillService.getUserSkillsByType(candidate.getId(), "WANTED");

            // Check if requester can satisfy candidate (two-way mutual match detection)
            boolean requesterCanHelpCandidate = false;
            for (UserSkillDto cWanted : candidateWanted) {
                for (UserSkillDto mOffered : myOfferedSkills) {
                    double reverseScore = semanticSkillMatcher.matchSkills(
                            cWanted.skillName(),
                            cWanted.category(),
                            mOffered.skillName(),
                            mOffered.category()
                    );
                    if (reverseScore >= 0.80) {
                        requesterCanHelpCandidate = true;
                        break;
                    }
                }
                if (requesterCanHelpCandidate) break;
            }

            double bestSkillScore = 0.0;
            UserSkillDto bestOfferedSkill = null;

            if (myWantedSkills.isEmpty()) {
                // Graceful fallback: match with candidate's first offered skill at baseline score
                bestOfferedSkill = candidateOffered.get(0);
                bestSkillScore = 0.60;
            } else {
                // Find best matching offered skill that candidate provides
                for (UserSkillDto wanted : myWantedSkills) {
                    for (UserSkillDto offered : candidateOffered) {
                        double sim = semanticSkillMatcher.matchSkills(
                                wanted.skillName(),
                                wanted.category(),
                                offered.skillName(),
                                offered.category()
                        );
                        if (sim > bestSkillScore) {
                            bestSkillScore = sim;
                            bestOfferedSkill = offered;
                        }
                    }
                }
            }

            if (bestOfferedSkill == null || bestSkillScore < 0.40) {
                continue; // Not compatible enough
            }

            boolean isMutualMatch = (bestSkillScore >= 0.70) && requesterCanHelpCandidate;

            CompatibilityCalculator.CalculationResult calc = compatibilityCalculator.calculate(
                    requester,
                    candidate,
                    bestSkillScore,
                    bestOfferedSkill.experience(),
                    isMutualMatch,
                    bestOfferedSkill.skillName()
            );

            if (calc.compatibilityPercentage() < 40) {
                continue;
            }

            // Other offered skills excluding the matched one
            final UserSkillDto matchedSkillRef = bestOfferedSkill;
            List<UserSkillDto> otherOffered = candidateOffered.stream()
                    .filter(s -> !s.skillId().equals(matchedSkillRef.skillId()))
                    .toList();

            candidates.add(new RecommendationDto(
                    candidate.getId(),
                    candidate.getName(),
                    candidate.getBio(),
                    candidate.getAvatarUrl(),
                    candidate.getLocation(),
                    candidate.getAverageRating() != null ? candidate.getAverageRating() : 5.0,
                    candidate.getTotalReviews() != null ? candidate.getTotalReviews() : 0,
                    bestOfferedSkill.skillName(),
                    bestOfferedSkill.category(),
                    bestOfferedSkill.experience(),
                    calc.compatibilityPercentage(),
                    calc.isMutualMatch(),
                    calc.matchReasons(),
                    otherOffered
            ));
        }

        // Sort: isMutualMatch DESC, compatibilityPercentage DESC, providerRating DESC
        candidates.sort(
                Comparator.comparing(RecommendationDto::isMutualMatch).reversed()
                        .thenComparing(Comparator.comparingInt(RecommendationDto::compatibilityPercentage).reversed())
                        .thenComparing(Comparator.comparingDouble(RecommendationDto::providerRating).reversed())
        );

        // Limit to top 6 items
        return candidates.stream().limit(6).toList();
    }
}
