package com.skillswap.platform.discovery.service;

import com.skillswap.platform.discovery.dto.MemberCardDto;
import com.skillswap.platform.profile.dto.UserSkillDto;
import com.skillswap.platform.profile.service.UserSkillService;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DiscoveryService {

    private final UserRepository userRepository;
    private final UserSkillService userSkillService;

    public DiscoveryService(UserRepository userRepository, UserSkillService userSkillService) {
        this.userRepository = userRepository;
        this.userSkillService = userSkillService;
    }

    @Transactional(readOnly = true)
    public Page<MemberCardDto> searchMembers(
            String keyword,
            String category,
            String location,
            Double minRating,
            String sortBy,
            int page,
            int size
    ) {
        int boundedPage = Math.max(0, page);
        int boundedSize = Math.max(1, Math.min(size, 50));

        Sort sort = switch (sortBy != null ? sortBy.toUpperCase() : "RATING_DESC") {
            case "NEWEST" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "NAME_ASC" -> Sort.by(Sort.Direction.ASC, "name");
            default -> Sort.by(Sort.Direction.DESC, "averageRating");
        };

        Pageable pageable = PageRequest.of(boundedPage, boundedSize, sort);

        String cleanKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String cleanCategory = (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) ? category.trim() : null;
        String cleanLocation = (location != null && !location.isBlank()) ? location.trim() : null;

        Page<User> usersPage = userRepository.searchProviders(
                cleanCategory,
                cleanLocation,
                minRating,
                cleanKeyword,
                pageable
        );

        return usersPage.map(user -> {
            List<UserSkillDto> offeredSkills = userSkillService.getUserSkillsByType(user.getId(), "OFFERED");
            List<UserSkillDto> wantedSkills = userSkillService.getUserSkillsByType(user.getId(), "WANTED");

            return new MemberCardDto(
                    user.getId(),
                    user.getName(),
                    user.getBio(),
                    user.getLocation(),
                    user.getAvatarUrl(),
                    user.getAverageRating() != null ? user.getAverageRating() : 5.0,
                    user.getTotalReviews() != null ? user.getTotalReviews() : 0,
                    user.getCreatedAt(),
                    offeredSkills,
                    wantedSkills
            );
        });
    }
}
