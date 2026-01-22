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

import java.time.LocalDate;
import java.util.HashMap;
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

    // ✅ NEW: Verify certificate eligibility and return data
    @GetMapping("/{skillId}/certificate")
    public ResponseEntity<?> getCertificate(@PathVariable Long skillId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userSkillRepository.findByUserId(user.getId()).stream()
                .filter(us -> us.getSkill().getId().equals(skillId))
                .findFirst()
                .map(us -> {
                    // Logic: Only allow certificate if progress is 100%
                    if (us.getProgress() < 100) {
                        return ResponseEntity.status(403).body("Skill not completed yet! Keep learning.");
                    }
                    
                    Map<String, Object> certData = new HashMap<>();
                    certData.put("studentName", user.getName());
                    certData.put("skillName", us.getSkill().getName());
                    certData.put("completionDate", LocalDate.now().toString());
                    certData.put("certificateId", "CERT-" + us.getId() + "-" + user.getId());
                    
                    return ResponseEntity.ok(certData);
                })
                .orElse(ResponseEntity.status(404).body("Skill not found for this user"));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStudentStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkill> userSkills = userSkillRepository.findByUserId(user.getId());

        int totalEnrolled = userSkills.size();
        long completed = userSkills.stream().filter(us -> us.getProgress() >= 100).count();
        long inProgress = userSkills.stream().filter(us -> us.getProgress() > 0 && us.getProgress() < 100).count();
        
        double avgProgress = userSkills.isEmpty() ? 0 : 
            userSkills.stream().mapToInt(UserSkill::getProgress).average().orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEnrolled", totalEnrolled);
        stats.put("completed", completed);
        stats.put("inProgress", inProgress);
        stats.put("averageProgress", Math.round(avgProgress));
        stats.put("userName", user.getName());
        stats.put("email", user.getEmail());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/me")
    public List<UserSkillResponse> getMySkills() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());

        return skills.stream().map(us -> new UserSkillResponse(
                user.getName(), 
                us.getSkill().getId(), 
                us.getSkill().getName(), 
                us.getSkill().getDescription(),
                us.getProgress(),
                us.getStatus()
        )).collect(Collectors.toList());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSkillResponse> getAllProgress() {
        return userSkillRepository.findAll().stream().map(us -> new UserSkillResponse(
                us.getUser().getName(), 
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