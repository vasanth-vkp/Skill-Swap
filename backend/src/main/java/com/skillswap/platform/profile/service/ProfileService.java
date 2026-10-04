package com.skillswap.platform.profile.service;

import com.skillswap.platform.profile.dto.ProfileResponse;
import com.skillswap.platform.profile.dto.PublicMemberResponse;
import com.skillswap.platform.profile.dto.UpdateProfileRequest;
import com.skillswap.platform.profile.dto.UserSkillDto;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final UserSkillService userSkillService;

    public ProfileService(UserRepository userRepository, UserSkillService userSkillService) {
        this.userRepository = userRepository;
        this.userSkillService = userSkillService;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"));

        List<UserSkillDto> offeredSkills = userSkillService.getUserSkillsByType(userId, "OFFERED");
        List<UserSkillDto> wantedSkills = userSkillService.getUserSkillsByType(userId, "WANTED");

        return new ProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getBio(),
                user.getLocation(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getCreatedAt(),
                offeredSkills,
                wantedSkills
        );
    }

    @Transactional
    public ProfileResponse updateMyProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"));

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }
        if (request.bio() != null) {
            user.setBio(request.bio().trim());
        }
        if (request.location() != null) {
            user.setLocation(request.location().trim());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl().trim());
        }

        userRepository.save(user);

        return getMyProfile(userId);
    }

    @Transactional(readOnly = true)
    public PublicMemberResponse getPublicMemberProfile(Long memberId) {
        User user = userRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        List<UserSkillDto> offeredSkills = userSkillService.getUserSkillsByType(memberId, "OFFERED");
        List<UserSkillDto> wantedSkills = userSkillService.getUserSkillsByType(memberId, "WANTED");

        return new PublicMemberResponse(
                user.getId(),
                user.getName(),
                user.getBio(),
                user.getLocation(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                offeredSkills,
                wantedSkills,
                5.0, // Default 5.0 initial score until ratings are seeded in Phase 10
                0
        );
    }
}
