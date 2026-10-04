package com.skillswap.platform.discovery.controller;

import com.skillswap.platform.discovery.dto.MemberCardDto;
import com.skillswap.platform.discovery.service.DiscoveryService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/members")
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    public DiscoveryController(DiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }

    @GetMapping("/search")
    public ResponseEntity<Page<MemberCardDto>> searchMembers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false, defaultValue = "RATING_DESC") String sortBy,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "9") int size
    ) {
        Page<MemberCardDto> results = discoveryService.searchMembers(
                keyword,
                category,
                location,
                minRating,
                sortBy,
                page,
                size
        );
        return ResponseEntity.ok(results);
    }
}
