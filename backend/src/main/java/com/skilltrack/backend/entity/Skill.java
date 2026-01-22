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

    @Column(nullable = false)
    private String level = "Beginner";

    // ✅ NEW: Skill Category (e.g., Frontend, Backend, Data Science)
    @Column(nullable = false)
    private String category = "General";

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore 
    private List<UserSkill> userSkills;

    public Skill() {}

    // Updated constructor to include level and category
    public Skill(String name, String description, String level, String category) {
        this.name = name;
        this.description = description;
        this.level = level;
        this.category = category;
    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    // ✅ NEW: Getter and Setter for Category
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<UserSkill> getUserSkills() { return userSkills; }
    public void setUserSkills(List<UserSkill> userSkills) { this.userSkills = userSkills; }
}