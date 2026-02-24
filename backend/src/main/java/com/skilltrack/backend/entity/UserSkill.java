package com.skilltrack.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_skills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "skill_id"})
})
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ CHANGED: Store ID directly (Fixes "setUserId undefined" error)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // ✅ CHANGED: Store ID directly (Fixes "setSkillId undefined" error)
    @Column(name = "skill_id", nullable = false)
    private Long skillId;

    private int progress; // 0 to 100
    private String status; // "ENROLLED", "IN_PROGRESS", "COMPLETED"

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    public UserSkill() {}

    public UserSkill(Long userId, Long skillId) {
        this.userId = userId;
        this.skillId = skillId;
        this.progress = 0;
        this.status = "ENROLLED";
        this.updatedAt = java.time.LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = java.time.LocalDateTime.now();
    }

    public UserSkill(Long userId, Long skillId, int progress, String status) {
        this.userId = userId;
        this.skillId = skillId;
        this.progress = progress;
        this.status = status;
        this.updatedAt = java.time.LocalDateTime.now();
    }

    // ✅ Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}