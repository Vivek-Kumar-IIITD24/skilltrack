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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    // ✅ Student: Get my own skills
    @GetMapping("/me")
    public List<UserSkillResponse> getMySkills() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());

        return skills.stream().map(us -> new UserSkillResponse(
                user.getName(), // Pass student name
                us.getSkill().getId(), 
                us.getSkill().getName(), 
                us.getSkill().getDescription(),
                us.getProgress(),
                us.getStatus()
        )).collect(Collectors.toList());
    }

    // ✅ Admin: Get ALL student progress records
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSkillResponse> getAllProgress() {
        return userSkillRepository.findAll().stream().map(us -> new UserSkillResponse(
                us.getUser().getName(), // The student's name
                us.getSkill().getId(), 
                us.getSkill().getName(), 
                us.getSkill().getDescription(),
                us.getProgress(),
                us.getStatus()
        )).collect(Collectors.toList());
    }

    @PostMapping("/assign")
    public String assignSkill(@RequestBody UserSkillRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setProgress(0);
        userSkill.setStatus("IN_PROGRESS");

        userSkillRepository.save(userSkill);
        return "Skill assigned successfully";
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProgress(@RequestBody UserSkillRequest request) {
        return userSkillRepository.findByUserId(request.getUserId()).stream()
                .filter(us -> us.getSkill().getId().equals(request.getSkillId()))
                .findFirst()
                .map(userSkill -> {
                    userSkill.setProgress(request.getProgress());
                    
                    if (request.getProgress() >= 100) {
                        userSkill.setStatus("COMPLETED");
                    } else if (request.getProgress() > 0) {
                        userSkill.setStatus("IN_PROGRESS");
                    } else {
                        userSkill.setStatus("ENROLLED");
                    }

                    userSkillRepository.save(userSkill);
                    return ResponseEntity.ok("Progress updated");
                })
                .orElse(ResponseEntity.status(404).body("Skill record not found"));
    }
}