package com.skilltrack.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_skills",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"user_id", "skill_id"})
       })
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 User
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 🔗 Skill
    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    // 📊 Progress (0–100)
    @Column(nullable = false)
    private int progress;

    // 🔹 Constructors
    public UserSkill() {}

    public UserSkill(User user, Skill skill, int progress) {
        this.user = user;
        this.skill = skill;
        this.progress = progress;
    }

    // 🔹 Getters & Setters
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }
}
