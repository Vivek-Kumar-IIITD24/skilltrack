package com.skilltrack.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_skills")
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    private int progress; // 0 to 100
    
    // Status (ENROLLED, IN_PROGRESS, COMPLETED)
    private String status; 

    // Constructors
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