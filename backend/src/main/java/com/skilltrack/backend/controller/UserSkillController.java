package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.Lesson;
import com.skilltrack.backend.entity.LessonProgress;
import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.entity.UserSkill;
import com.skilltrack.backend.repository.LessonProgressRepository;
import com.skilltrack.backend.repository.SkillRepository;
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.repository.UserSkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user-skills") 
public class UserSkillController {

    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final LessonProgressRepository lessonProgressRepository;

    public UserSkillController(UserSkillRepository userSkillRepository, 
                               UserRepository userRepository, 
                               SkillRepository skillRepository,
                               LessonProgressRepository lessonProgressRepository) {
        this.userSkillRepository = userSkillRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.lessonProgressRepository = lessonProgressRepository;
    }

    public static class EnrollRequest {
        public Long skillId;
    }

    // 1. ENROLL
    @PostMapping
    public ResponseEntity<?> enrollSelf(@RequestBody EnrollRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Long skillId = request.skillId;
        if (userSkillRepository.existsByUserIdAndSkillId(user.getId(), skillId)) {
            return ResponseEntity.status(409).body("You are already enrolled!");
        }

        Skill skill = skillRepository.findById(skillId).orElseThrow(() -> new RuntimeException("Skill not found"));
        
        // ✅ FIX: Constructor now takes IDs
        UserSkill enrollment = new UserSkill(user.getId(), skill.getId());
        enrollment.setUpdatedAt(java.time.LocalDateTime.now()); // Explicitly set timestamp
        userSkillRepository.save(enrollment);

        return ResponseEntity.ok(Map.of("message", "Enrolled successfully!"));
    }

    // 2. GET MY SKILLS
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getMySkills() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkill> enrollments = userSkillRepository.findByUserId(user.getId());

        List<Map<String, Object>> result = enrollments.stream().map(enrollment -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", enrollment.getId());
            map.put("status", enrollment.getStatus());
            
            // ✅ FIX: Manually fetch the Skill object using the stored ID
            Optional<Skill> skillOpt = skillRepository.findById(enrollment.getSkillId());
            
            if (skillOpt.isPresent()) {
                Skill skill = skillOpt.get();
                // Now we can calculate progress because we have the Skill object
                map.put("progress", calculateRealProgress(user.getId(), skill)); 

                Map<String, Object> skillMap = new HashMap<>();
                skillMap.put("id", skill.getId());
                skillMap.put("name", skill.getName());
                skillMap.put("level", skill.getLevel());
                skillMap.put("lessonCount", skill.getLessons() != null ? skill.getLessons().size() : 0);
                
                map.put("skill", skillMap);
            } else {
                map.put("skill", null);
                map.put("progress", 0);
            }
            
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // 3. UNENROLL
    @DeleteMapping("/{skillId}")
    public ResponseEntity<?> unenrollUser(@PathVariable Long skillId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Optional<UserSkill> enrollment = userSkillRepository.findByUserIdAndSkillId(user.getId(), skillId);
        
        if (enrollment.isPresent()) {
            userSkillRepository.delete(enrollment.get());
            System.out.println(">>> 🗑️ User " + user.getName() + " dropped course ID " + skillId);
            return ResponseEntity.ok("Unenrolled successfully.");
        } else {
            return ResponseEntity.status(404).body("Enrollment not found.");
        }
    }

    // 4. CERTIFICATE VERIFICATION
    @GetMapping("/{skillId}/certificate")
    public ResponseEntity<?> verifyAndClaimCertificate(@PathVariable Long skillId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Optional<UserSkill> enrollmentOpt = userSkillRepository.findByUserIdAndSkillId(user.getId(), skillId);
        if (enrollmentOpt.isEmpty()) {
            return ResponseEntity.status(404).body("You are not enrolled in this course.");
        }

        UserSkill enrollment = enrollmentOpt.get();
        // ✅ FIX: Fetch Skill manually
        Skill skill = skillRepository.findById(enrollment.getSkillId()).orElseThrow(() -> new RuntimeException("Skill not found"));

        int totalCourseSeconds = skill.getLessons().stream()
                .mapToInt(l -> l.getDuration() > 0 ? l.getDuration() : 600)
                .sum();
        if (totalCourseSeconds == 0) totalCourseSeconds = 1;

        int totalUserWatchedSeconds = 0;
        for (Lesson lesson : skill.getLessons()) {
            Optional<LessonProgress> progress = lessonProgressRepository.findByUserIdAndLessonId(user.getId(), lesson.getId());
            if (progress.isPresent()) {
                totalUserWatchedSeconds += progress.get().getTotalWatched();
            }
        }

        double percentage = ((double) totalUserWatchedSeconds / totalCourseSeconds) * 100;

        if (percentage < 90.0) {
            return ResponseEntity.status(403).body("Course not completed! You have only watched " + (int)percentage + "% of the actual content.");
        }

        enrollment.setStatus("COMPLETED");
        enrollment.setProgress(100);
        enrollment.setUpdatedAt(java.time.LocalDateTime.now());
        userSkillRepository.save(enrollment);

        Map<String, Object> certData = new HashMap<>();
        certData.put("studentName", user.getName());
        certData.put("skillName", skill.getName());
        certData.put("completionDate", LocalDate.now().toString());
        certData.put("certificateId", "CERT-" + skill.getId() + "-" + user.getId() + "-" + System.currentTimeMillis() % 10000);
        certData.put("score", (int)percentage + "%");

        return ResponseEntity.ok(certData);
    }

    private int calculateRealProgress(Long userId, Skill skill) {
        if (skill.getLessons() == null || skill.getLessons().isEmpty()) return 0;
        
        int totalSeconds = skill.getLessons().stream().mapToInt(l -> l.getDuration() > 0 ? l.getDuration() : 600).sum();
        int watchedSeconds = 0;
        
        for (Lesson lesson : skill.getLessons()) {
            Optional<LessonProgress> p = lessonProgressRepository.findByUserIdAndLessonId(userId, lesson.getId());
            if (p.isPresent()) watchedSeconds += p.get().getTotalWatched();
        }
        
        if (totalSeconds == 0) return 0;
        return Math.min(100, (int)(((double)watchedSeconds / totalSeconds) * 100));
    }
    
    // 5. STATS
    @GetMapping("/stats")
    public ResponseEntity<?> getStudentStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

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
}