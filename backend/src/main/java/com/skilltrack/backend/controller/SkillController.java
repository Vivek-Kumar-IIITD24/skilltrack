package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.repository.SkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillRepository skillRepository;

    public SkillController(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    // ✅ CREATE SKILL (Unified: Safe and Secure)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> addSkill(@RequestBody Skill skill) {
        
        // 1. Safety check: Don't allow empty names
        if (skill.getName() == null || skill.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Skill name cannot be empty");
        }

        // 2. Check if the skill name is already taken
        if (skillRepository.existsByName(skill.getName())) {
             return ResponseEntity.badRequest().body("Skill already exists");
        }

        // 3. Save and return the new skill
        Skill savedSkill = skillRepository.save(skill);
        return ResponseEntity.ok(savedSkill);
    }

    // ✅ GET ALL SKILLS (Public/Authenticated)
    @GetMapping
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }
}