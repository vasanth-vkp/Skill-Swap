package com.skillswap.platform.skill.controller;

import com.skillswap.platform.skill.dto.CreateSkillRequest;
import com.skillswap.platform.skill.dto.SkillDto;
import com.skillswap.platform.skill.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    public ResponseEntity<List<SkillDto>> getSkills(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        List<SkillDto> skills = skillService.getSkills(category, search);
        return ResponseEntity.ok(skills);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<SkillDto> createSkill(@Valid @RequestBody CreateSkillRequest request) {
        SkillDto skill = skillService.createSkill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(skill);
    }
}
