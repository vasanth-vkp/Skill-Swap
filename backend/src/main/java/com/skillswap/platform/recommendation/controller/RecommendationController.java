package com.skillswap.platform.recommendation.controller;

import com.skillswap.platform.auth.security.UserPrincipal;
import com.skillswap.platform.recommendation.dto.RecommendationDto;
import com.skillswap.platform.recommendation.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<RecommendationDto>> getMyRecommendations(@AuthenticationPrincipal UserPrincipal principal) {
        List<RecommendationDto> recommendations = recommendationService.getRecommendationsForUser(principal.id());
        return ResponseEntity.ok(recommendations);
    }
}
