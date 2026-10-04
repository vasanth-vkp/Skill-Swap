package com.skillswap.platform.skill.service;

import com.skillswap.platform.skill.dto.CreateSkillRequest;
import com.skillswap.platform.skill.dto.SkillDto;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.skill.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public List<SkillDto> getSkills(String category, String search) {
        List<Skill> skills;

        boolean hasCategory = category != null && !category.isBlank();
        boolean hasSearch = search != null && !search.isBlank();

        if (hasCategory && hasSearch) {
            skills = skillRepository.searchByCategoryAndQuery(category.trim(), search.trim());
        } else if (hasCategory) {
            skills = skillRepository.findByCategoryIgnoreCase(category.trim());
        } else if (hasSearch) {
            skills = skillRepository.searchByQuery(search.trim());
        } else {
            skills = skillRepository.findAll();
        }

        return skills.stream()
                .map(s -> new SkillDto(s.getId(), s.getName(), s.getCategory()))
                .toList();
    }

    @Transactional
    public Skill getOrCreateSkill(String name, String category) {
        String trimmedName = name.trim();
        String resolvedCategory = (category != null && !category.isBlank()) ? category.trim() : "General";

        return skillRepository.findByNameIgnoreCase(trimmedName)
                .orElseGet(() -> skillRepository.save(new Skill(trimmedName, resolvedCategory)));
    }

    @Transactional
    public SkillDto createSkill(CreateSkillRequest request) {
        Skill skill = getOrCreateSkill(request.name(), request.category());
        return new SkillDto(skill.getId(), skill.getName(), skill.getCategory());
    }
}
