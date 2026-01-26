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
public class ProgressController {

    private final LessonProgressRepository progressRepository;
    private final UserRepository userRepository;

    public ProgressController(LessonProgressRepository progressRepository, UserRepository userRepository) {
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
    }

    // ❤️ THE ANTI-CHEAT HEARTBEAT
    @PostMapping("/{lessonId}")
    public ResponseEntity<?> updateProgress(
            @PathVariable Long lessonId, 
            @RequestParam int position,   
            @RequestParam int amount) {   
        
        try {
            User user = getCurrentUser();
            
            // 1. Try to find existing progress
            Optional<LessonProgress> existing = progressRepository.findByUserIdAndLessonId(user.getId(), lessonId);
            
            LessonProgress progress;
            if (existing.isPresent()) {
                // UPDATE existing record
                progress = existing.get();
                progress.setLastPosition(position);
                progress.setTotalWatched(progress.getTotalWatched() + amount);
            } else {
                // CREATE new record
                progress = new LessonProgress(user.getId(), lessonId);
                progress.setLastPosition(position);
                progress.setTotalWatched(amount);
            }
            
            progressRepository.save(progress);
            
            System.out.println(">>> 📊 User " + user.getName() + " | Pos: " + position + "s | Total: " + progress.getTotalWatched() + "s");
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            System.out.println(">>> ❌ Sync Error: " + e.getMessage());
            return ResponseEntity.status(500).body("Sync failed");
        }
    }

    // GET PROGRESS (For resuming)
    @GetMapping("/{lessonId}")
    public int getProgress(@PathVariable Long lessonId) {
        try {
            User user = getCurrentUser();
            return progressRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                    .map(LessonProgress::getLastPosition)
                    .orElse(0); 
        } catch (Exception e) {
            return 0;
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}