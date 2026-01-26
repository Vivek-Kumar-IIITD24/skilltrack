package com.skilltrack.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "user_skills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "skill_id"})
})
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties("userSkills")
    private User user; // ❌ Removed @OnDelete (Back to normal)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    @JsonIgnoreProperties("userSkills")
    private Skill skill; // ❌ Removed @OnDelete (Back to normal)

    private int progress; // 0 to 100
    private String status; // ENROLLED, IN_PROGRESS, COMPLETED

    public UserSkill() {}

    public UserSkill(User user, Skill skill) {
        this.user = user;
        this.skill = skill;
        this.progress = 0;
        this.status = "ENROLLED";
    }

    public UserSkill(User user, Skill skill, int progress, String status) {
        this.user = user;
        this.skill = skill;
        this.progress = progress;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}