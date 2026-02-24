package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.Lesson;
import com.skilltrack.backend.entity.LessonProgress;
import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.entity.UserSkill;
import com.skilltrack.backend.repository.LessonProgressRepository;
import com.skilltrack.backend.repository.LessonRepository; // ✅ Added
import com.skilltrack.backend.repository.SkillRepository;
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.repository.UserSkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/progress")
public class LessonProgressController {

    private final LessonProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final LessonRepository lessonRepository; // ✅ Added to find Skill from Lesson

    public LessonProgressController(LessonProgressRepository progressRepository, 
                                    UserRepository userRepository,
                                    UserSkillRepository userSkillRepository, 
                                    SkillRepository skillRepository,
                                    LessonRepository lessonRepository) {
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.skillRepository = skillRepository;
        this.lessonRepository = lessonRepository;
    }

    // 1. SAVE PROGRESS & UPDATE COURSE PERCENTAGE
    @PostMapping("/{lessonId}")
    public ResponseEntity<?> saveProgress(
            @PathVariable Long lessonId,
            @RequestParam int position,
            @RequestParam int amount) {

        Long userId = getAuthenticatedUserId();

        // 🔍 DEBUG LOG
        System.out.println(">>> 💾 Saving Progress | User ID: " + userId + " | Lesson ID: " + lessonId + " | Pos: " + position);

        // A. Save Lesson Progress
        Optional<LessonProgress> progressOpt = progressRepository.findByUserIdAndLessonId(userId, lessonId);

        LessonProgress progress;
        if (progressOpt.isPresent()) {
            progress = progressOpt.get();
            if (position > progress.getLastPosition()) {
                progress.setLastPosition(position);
            }
            progress.setTotalWatched(progress.getTotalWatched() + amount);
        } else {
            System.out.println(">>> 🆕 New Progress Record for User " + userId);
            progress = new LessonProgress();
            progress.setUserId(userId);
            progress.setLessonId(lessonId);
            progress.setLastPosition(position);
            progress.setTotalWatched(amount);
            progress.setIsCompleted(false);
        }

        progressRepository.save(progress);

        // ✅ NEW: Trigger Course Percentage Calculation on Heartbeat
        Optional<Lesson> lessonOpt = lessonRepository.findById(lessonId);
        if (lessonOpt.isPresent()) {
            Skill skill = lessonOpt.get().getSkill();
            updateUserSkillProgress(userId, skill);
        }
        
        return ResponseEntity.ok("Progress Saved");
    }

    // 2. GET PROGRESS
    @GetMapping("/{lessonId}")
    public ResponseEntity<Integer> getProgress(@PathVariable Long lessonId) {
        Long userId = getAuthenticatedUserId();
        
        System.out.println(">>> 📥 Fetching Progress | User ID: " + userId + " | Lesson ID: " + lessonId);

        Optional<LessonProgress> progress = progressRepository.findByUserIdAndLessonId(userId, lessonId);
        
        return progress.map(p -> {
            System.out.println(">>> ✅ Found existing progress: " + p.getLastPosition() + "s");
            return ResponseEntity.ok(p.getLastPosition());
        }).orElseGet(() -> {
            System.out.println(">>> ⚪ No progress found. Starting at 0s");
            return ResponseEntity.ok(0);
        });
    }

    // 3. GET OVERALL COURSE PROGRESS
    @GetMapping("/course/{skillId}")
    public ResponseEntity<Integer> getCourseProgress(@PathVariable Long skillId) {
        Long userId = getAuthenticatedUserId();
        Optional<UserSkill> userSkill = userSkillRepository.findByUserIdAndSkillId(userId, skillId);
        return userSkill.map(us -> ResponseEntity.ok(us.getProgress())).orElse(ResponseEntity.ok(0));
    }

    // 4. VERIFY LESSON & RECALCULATE PERCENTAGE
    @PostMapping("/{lessonId}/complete/{skillId}")
    public ResponseEntity<?> markLessonComplete(@PathVariable Long lessonId, @PathVariable Long skillId) {
        try {
            Long userId = getAuthenticatedUserId();
            System.out.println(">>> 🏆 Completing Lesson | User ID: " + userId);
            
            // A. Mark Lesson as Completed
            Optional<LessonProgress> progressOpt = progressRepository.findByUserIdAndLessonId(userId, lessonId);
            LessonProgress progress;
            
            if (progressOpt.isPresent()) {
                progress = progressOpt.get();
            } else {
                progress = new LessonProgress();
                progress.setUserId(userId);
                progress.setLessonId(lessonId);
            }

            progress.setIsCompleted(true); 
            progressRepository.save(progress);

            // B. Recalculate Course Percentage
            Skill skill = skillRepository.findById(skillId).orElseThrow();
            updateUserSkillProgress(userId, skill);

            // Return updated percentage
            UserSkill userSkill = userSkillRepository.findByUserIdAndSkillId(userId, skillId).orElseThrow();
            return ResponseEntity.ok(userSkill.getProgress());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error verifying lesson: " + e.getMessage());
        }
    }

    // ✅ HELPER: Calculates and Updates UserSkill Progress
    private void updateUserSkillProgress(Long userId, Skill skill) {
        int totalLessons = skill.getLessons().size();
        
        UserSkill userSkill = userSkillRepository.findByUserIdAndSkillId(userId, skill.getId()).orElse(new UserSkill());
        if(userSkill.getId() == null) {
            userSkill.setUserId(userId);
            userSkill.setSkillId(skill.getId());
        }

        // Calculate how many distinct lessons of THIS skill are completed
        List<Long> skillLessonIds = skill.getLessons().stream().map(Lesson::getId).toList();
        
        long completedCount = progressRepository.findAll().stream()
                .filter(p -> p.getUserId().equals(userId) && p.getIsCompleted() && skillLessonIds.contains(p.getLessonId()))
                .count();

        int percentage = (totalLessons > 0) ? (int) (((double) completedCount / totalLessons) * 100) : 0;
        if (percentage > 100) percentage = 100;

        userSkill.setProgress(percentage);
        
        //  Updates timestamp whenever progress changes
        userSkill.setUpdatedAt(java.time.LocalDateTime.now());
        
        if (percentage == 100) {
             userSkill.setStatus("COMPLETED");
        }
        
        userSkillRepository.save(userSkill);
        System.out.println(">>> 📊 Course Progress Updated: " + percentage + "% (" + completedCount + "/" + totalLessons + ")");
    }

    private Long getAuthenticatedUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}