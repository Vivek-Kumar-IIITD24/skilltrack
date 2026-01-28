package com.skilltrack.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lesson_progress_v2", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "lesson_id"})
})
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    private int lastPosition; // In seconds
    private int totalWatched; // In seconds (anti-cheat)
    
    // ✅ NEW FIELD: This is what was missing!
    private boolean isCompleted = false; 

    public LessonProgress() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

    public int getLastPosition() { return lastPosition; }
    public void setLastPosition(int lastPosition) { this.lastPosition = lastPosition; }

    public int getTotalWatched() { return totalWatched; }
    public void setTotalWatched(int totalWatched) { this.totalWatched = totalWatched; }

    // ✅ NEW GETTER & SETTER
    public boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(boolean isCompleted) { this.isCompleted = isCompleted; }
}