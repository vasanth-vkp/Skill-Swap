package com.skillswap.platform.profile.controller;

import com.skillswap.platform.auth.security.UserPrincipal;
import com.skillswap.platform.profile.dto.*;
import com.skillswap.platform.profile.service.ProfileService;
import com.skillswap.platform.profile.service.UserSkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ProfileController {

    private final ProfileService profileService;
    private final UserSkillService userSkillService;

    public ProfileController(ProfileService profileService, UserSkillService userSkillService) {
        this.profileService = profileService;
        this.userSkillService = userSkillService;
    }

    @GetMapping("/profile/me")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        ProfileResponse response = profileService.getMyProfile(principal.id());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/me")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        ProfileResponse response = profileService.updateMyProfile(principal.id(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/skills")
    public ResponseEntity<List<UserSkillDto>> getMySkills(@AuthenticationPrincipal UserPrincipal principal) {
        List<UserSkillDto> skills = userSkillService.getUserSkills(principal.id());
        return ResponseEntity.ok(skills);
    }

    @PostMapping("/profile/skills")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<UserSkillDto> addSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddUserSkillRequest request
    ) {
        UserSkillDto dto = userSkillService.addUserSkill(principal.id(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @DeleteMapping("/profile/skills/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> removeSkill(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        userSkillService.removeUserSkill(principal.id(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/members/{id}")
    public ResponseEntity<PublicMemberResponse> getPublicMemberProfile(@PathVariable Long id) {
        PublicMemberResponse member = profileService.getPublicMemberProfile(id);
        return ResponseEntity.ok(member);
    }
}
