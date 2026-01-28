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

    public UserSkill() {}

    public UserSkill(Long userId, Long skillId) {
        this.userId = userId;
        this.skillId = skillId;
        this.progress = 0;
        this.status = "ENROLLED";
    }

    public UserSkill(Long userId, Long skillId, int progress, String status) {
        this.userId = userId;
        this.skillId = skillId;
        this.progress = progress;
        this.status = status;
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
}