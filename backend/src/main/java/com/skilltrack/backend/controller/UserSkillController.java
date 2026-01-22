package com.skilltrack.backend.controller;

import com.skilltrack.backend.dto.UserSkillRequest;
import com.skilltrack.backend.dto.UserSkillResponse;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.entity.UserSkill;
import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.repository.UserSkillRepository;
import com.skilltrack.backend.repository.SkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user-skills")
public class UserSkillController {

    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public UserSkillController(UserSkillRepository userSkillRepository, UserRepository userRepository, SkillRepository skillRepository) {
        this.userSkillRepository = userSkillRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    // ✅ Get enrolled skills for the logged-in student
    @GetMapping("/me")
    public List<UserSkillResponse> getMySkills() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());

        return skills.stream().map(us -> new UserSkillResponse(
                us.getSkill().getId(), 
                us.getSkill().getName(), 
                us.getSkill().getDescription(),
                us.getProgress(),
                us.getStatus()
        )).collect(Collectors.toList());
    }

    // ✅ Enroll in a new skill
    @PostMapping("/assign")
    public String assignSkill(@RequestBody UserSkillRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setProgress(0); // Always start at 0
        userSkill.setStatus("IN_PROGRESS");

        userSkillRepository.save(userSkill);
        return "Skill assigned successfully";
    }

    // ✅ NEW: Simplified Update Progress using Skill ID and User ID
    // This allows the Frontend to just send { "userId": 1, "skillId": 5, "progress": 50 }
    @PutMapping("/update")
    public ResponseEntity<?> updateProgress(@RequestBody UserSkillRequest request) {
        // 1. Find the specific record linking this user and skill
        return userSkillRepository.findByUserId(request.getUserId()).stream()
                .filter(us -> us.getSkill().getId().equals(request.getSkillId()))
                .findFirst()
                .map(userSkill -> {
                    // 2. Update progress
                    userSkill.setProgress(request.getProgress());
                    
                    // 3. Logic: Update status based on percentage
                    if (request.getProgress() >= 100) {
                        userSkill.setStatus("COMPLETED");
                    } else if (request.getProgress() > 0) {
                        userSkill.setStatus("IN_PROGRESS");
                    } else {
                        userSkill.setStatus("ENROLLED");
                    }

                    userSkillRepository.save(userSkill);
                    return ResponseEntity.ok("Progress updated to " + request.getProgress() + "%");
                })
                .orElse(ResponseEntity.status(404).body("Skill record not found for this user"));
    }
}