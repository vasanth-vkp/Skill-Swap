package com.skillswap.platform.profile.service;

import com.skillswap.platform.profile.dto.AddUserSkillRequest;
import com.skillswap.platform.profile.dto.UserSkillDto;
import com.skillswap.platform.profile.entity.UserSkill;
import com.skillswap.platform.profile.repository.UserSkillRepository;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.skill.repository.SkillRepository;
import com.skillswap.platform.skill.service.SkillService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserSkillService {

    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final SkillService skillService;

    public UserSkillService(
            UserSkillRepository userSkillRepository,
            SkillRepository skillRepository,
            SkillService skillService
    ) {
        this.userSkillRepository = userSkillRepository;
        this.skillRepository = skillRepository;
        this.skillService = skillService;
    }

    @Transactional(readOnly = true)
    public List<UserSkillDto> getUserSkills(Long userId) {
        return userSkillRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSkillDto> getUserSkillsByType(Long userId, String type) {
        return userSkillRepository.findByUserIdAndType(userId, type.toUpperCase()).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public UserSkillDto addUserSkill(Long userId, AddUserSkillRequest request) {
        Skill skill;
        if (request.skillId() != null) {
            skill = skillRepository.findById(request.skillId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found in catalog"));
        } else if (request.skillName() != null && !request.skillName().isBlank()) {
            skill = skillService.getOrCreateSkill(request.skillName(), request.category());
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Skill ID or name is required");
        }

        String type = request.type().toUpperCase();

        if (userSkillRepository.existsByUserIdAndSkillIdAndType(userId, skill.getId(), type)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Skill is already added as " + type);
        }

        String experience = "OFFERED".equals(type)
                ? (request.experience() != null && !request.experience().isBlank() ? request.experience().toUpperCase() : "BEGINNER")
                : null;

        UserSkill userSkill = new UserSkill(userId, skill, type, experience);
        userSkill = userSkillRepository.save(userSkill);

        return toDto(userSkill);
    }

    @Transactional
    public void removeUserSkill(Long userId, Long userSkillId) {
        UserSkill userSkill = userSkillRepository.findByIdAndUserId(userSkillId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User skill not found or unauthorized"));

        userSkillRepository.delete(userSkill);
    }

    private UserSkillDto toDto(UserSkill userSkill) {
        return new UserSkillDto(
                userSkill.getId(),
                userSkill.getSkill().getId(),
                userSkill.getSkill().getName(),
                userSkill.getSkill().getCategory(),
                userSkill.getType(),
                userSkill.getExperience()
        );
    }
}
