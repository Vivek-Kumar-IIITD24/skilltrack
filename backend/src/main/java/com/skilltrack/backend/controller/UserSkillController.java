package com.skilltrack.backend.controller;

import com.skilltrack.backend.dto.UserSkillRequest;
import com.skilltrack.backend.dto.UserSkillResponse;
import com.skilltrack.backend.entity.Role; // ✅ Import Role Enum
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
@RequestMapping("/user-skills") 
public class UserSkillController {

    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public UserSkillController(UserSkillRepository userSkillRepository, UserRepository userRepository, SkillRepository skillRepository) {
        this.userSkillRepository = userSkillRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    public static class EnrollRequest {
        public Long skillId;
    }

    @PostMapping
    public ResponseEntity<?> enrollSelf(@RequestBody EnrollRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long skillId = request.skillId;

        if (userSkillRepository.existsByUserIdAndSkillId(user.getId(), skillId)) {
            return ResponseEntity.status(409).body("You are already enrolled in this skill!");
        }

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        UserSkill enrollment = new UserSkill(user, skill);
        userSkillRepository.save(enrollment);

        return ResponseEntity.ok(Map.of("message", "Enrolled successfully!"));
    }

    @GetMapping("/me")
    public List<Map<String, Object>> getMySkills() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());

        return skills.stream().map(us -> {
            Map<String, Object> map = new HashMap<>();
            map.put("userName", user.getName());
            map.put("skillId", us.getSkill().getId());
            map.put("skillName", us.getSkill().getName());
            map.put("description", us.getSkill().getDescription());
            map.put("progress", us.getProgress());
            map.put("status", us.getStatus());
            map.put("videoUrl", us.getSkill().getVideoUrl() != null ? us.getSkill().getVideoUrl() : "");
            map.put("docsUrl", us.getSkill().getDocsUrl() != null ? us.getSkill().getDocsUrl() : "");
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {
        List<User> students = userRepository.findAll().stream()
                // ✅ FIXED: Compare Enum to Enum
                .filter(u -> u.getRole() == Role.STUDENT)
                .collect(Collectors.toList());

        List<Map<String, Object>> leaderboard = students.stream().map(student -> {
            List<UserSkill> skills = userSkillRepository.findByUserId(student.getId());
            long completedCount = skills.stream().filter(us -> us.getProgress() >= 100).count();
            double avgProgress = skills.isEmpty() ? 0 : 
                skills.stream().mapToInt(UserSkill::getProgress).average().orElse(0.0);

            Map<String, Object> entry = new HashMap<>();
            entry.put("name", student.getName());
            entry.put("completions", completedCount);
            entry.put("avgProgress", Math.round(avgProgress));
            entry.put("totalEnrolled", skills.size());
            return entry;
        })
        .sorted((a, b) -> {
            int comp = Long.compare((long) b.get("completions"), (long) a.get("completions"));
            if (comp != 0) return comp;
            return Long.compare((long) b.get("avgProgress"), (long) a.get("avgProgress"));
        })
        .collect(Collectors.toList());

        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/{skillId}/certificate")
    public ResponseEntity<?> getCertificate(@PathVariable Long skillId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userSkillRepository.findByUserId(user.getId()).stream()
                .filter(us -> us.getSkill().getId().equals(skillId))
                .findFirst()
                .map(us -> {
                    if (us.getProgress() < 100) {
                        return ResponseEntity.status(403).body("Verification failed: Progress is currently " + us.getProgress() + "%. You must reach 100%.");
                    }
                    Map<String, Object> certData = new HashMap<>();
                    certData.put("studentName", user.getName());
                    certData.put("skillName", us.getSkill().getName());
                    certData.put("completionDate", LocalDate.now().toString());
                    certData.put("certificateId", "CERT-" + us.getId() + "-" + user.getId());
                    return ResponseEntity.ok(certData);
                })
                .orElse(ResponseEntity.status(404).body("Skill record not found for this user"));
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

    @PutMapping("/update")
    public ResponseEntity<?> updateProgress(@RequestBody UserSkillRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        return userSkillRepository.findByUserId(user.getId()).stream()
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