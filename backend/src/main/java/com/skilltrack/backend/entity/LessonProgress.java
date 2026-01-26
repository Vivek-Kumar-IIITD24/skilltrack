package com.skilltrack.backend.entity;

import jakarta.persistence.*;

@Entity
// ✅ CHANGED: Renamed table to 'lesson_progress_v2' to fix database conflict
// ✅ ADDED: Unique constraint to prevent duplicate rows (Fixes the 409 error too!)
@Table(name = "lesson_progress_v2", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "lessonId"})
})
public class LessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long lessonId;
    
    private int lastPosition; 
    private int totalWatched; 
    
    private boolean isCompleted;

    public LessonProgress() {}

    public LessonProgress(Long userId, Long lessonId) {
        this.userId = userId;
        this.lessonId = lessonId;
        this.lastPosition = 0;
        this.totalWatched = 0;
        this.isCompleted = false;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }
    public int getLastPosition() { return lastPosition; }
    public void setLastPosition(int lastPosition) { this.lastPosition = lastPosition; }
    public int getTotalWatched() { return totalWatched; }
    public void setTotalWatched(int totalWatched) { this.totalWatched = totalWatched; }
    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }
}