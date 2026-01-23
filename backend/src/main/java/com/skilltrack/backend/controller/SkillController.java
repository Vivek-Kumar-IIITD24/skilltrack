package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.repository.SkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skills") // ✅ FIXED: Removed "/api" to match Frontend
public class SkillController {

    private final SkillRepository skillRepository;

    public SkillController(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    // CREATE SKILL
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> addSkill(@RequestBody Skill skill) {
        
        if (skill.getName() == null || skill.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Skill name cannot be empty");
        }

        if (skillRepository.existsByName(skill.getName())) {
             return ResponseEntity.badRequest().body("Skill already exists");
        }

        Skill savedSkill = skillRepository.save(skill);
        return ResponseEntity.ok(savedSkill);
    }

    // GET ALL SKILLS
    @GetMapping
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    // DELETE SKILL
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSkill(@PathVariable Long id) {
        try {
            if (!skillRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            skillRepository.deleteById(id);
            return ResponseEntity.ok("Skill deleted successfully");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Cannot delete skill: Students are currently enrolled in it.");
        }
    }
}