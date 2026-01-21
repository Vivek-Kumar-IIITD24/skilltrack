package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.repository.SkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillRepository skillRepository;

    public SkillController(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    // ✅ ADMIN: Add new skill
    @PostMapping
    public ResponseEntity<?> addSkill(@RequestBody Skill skill) {
        return ResponseEntity.ok(skillRepository.save(skill));
    }

    // ✅ ADMIN: Get all skills
    @GetMapping
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }
}
