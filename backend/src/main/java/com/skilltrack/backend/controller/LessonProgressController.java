package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.LessonProgress;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.repository.LessonProgressRepository;
import com.skilltrack.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/progress")
public class LessonProgressController {

    private final LessonProgressRepository progressRepository;
    private final UserRepository userRepository;

    public LessonProgressController(LessonProgressRepository progressRepository, UserRepository userRepository) {
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
    }

    // 1. SAVE PROGRESS
    @PostMapping("/{lessonId}")
    public ResponseEntity<?> saveProgress(
            @PathVariable Long lessonId,
            @RequestParam int position,
            @RequestParam int amount) {

        Long userId = getAuthenticatedUserId(); 

        // 🔍 DEBUG LOG: Check who the server thinks is logged in
        System.out.println(">>> 💾 Saving Progress | User ID: " + userId + " | Lesson ID: " + lessonId + " | Pos: " + position);

        // ✅ CRITICAL: Find specifically for this user
        Optional<LessonProgress> progressOpt = progressRepository.findByUserIdAndLessonId(userId, lessonId);

        LessonProgress progress;
        if (progressOpt.isPresent()) {
            progress = progressOpt.get();
            // Only update if the new position is further ahead
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
        return ResponseEntity.ok("Progress Saved");
    }

    // 2. GET PROGRESS
    @GetMapping("/{lessonId}")
    public ResponseEntity<Integer> getProgress(@PathVariable Long lessonId) {
        Long userId = getAuthenticatedUserId();
        
        // 🔍 DEBUG LOG: Check who is requesting data
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

    // 3. VERIFY LESSON
    @PostMapping("/{lessonId}/complete")
    public ResponseEntity<?> markLessonComplete(@PathVariable Long lessonId) {
        try {
            Long userId = getAuthenticatedUserId();
            System.out.println(">>> 🏆 Completing Lesson | User ID: " + userId);
            
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

            return ResponseEntity.ok("Lesson Verified Successfully");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error verifying lesson: " + e.getMessage());
        }
    }

    private Long getAuthenticatedUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}