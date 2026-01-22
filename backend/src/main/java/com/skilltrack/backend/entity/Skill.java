package com.skilltrack.backend.entity;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 255)
    private String description;

    // ✅ NEW: Skill Level (Beginner, Intermediate, Advanced)
    // Defaulting to 'Beginner' to handle existing data safely
    @Column(nullable = false)
    private String level = "Beginner";

    // ✅ Cascade relationship to allow deletion even if students are enrolled
    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore 
    private List<UserSkill> userSkills;

    // 🔹 Constructors
    public Skill() {}

    // Updated constructor to include level
    public Skill(String name, String description, String level) {
        this.name = name;
        this.description = description;
        this.level = level;
    }

    // 🔹 Getters & Setters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // ✅ NEW: Getter and Setter for level
    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public List<UserSkill> getUserSkills() {
        return userSkills;
    }

    public void setUserSkills(List<UserSkill> userSkills) {
        this.userSkills = userSkills;
    }
}