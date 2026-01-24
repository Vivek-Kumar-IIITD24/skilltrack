package com.skilltrack.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String level; 
    private String category;

    // ✅ NEW: Content Links (These were missing in your current branch)
    private String videoUrl; 
    private String docsUrl;

    public Skill() {}

    public Skill(String name, String description, String level, String category, String videoUrl, String docsUrl) {
        this.name = name;
        this.description = description;
        this.level = level;
        this.category = category;
        this.videoUrl = videoUrl;
        this.docsUrl = docsUrl;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    // ✅ The missing Getters that caused the error
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getDocsUrl() { return docsUrl; }
    public void setDocsUrl(String docsUrl) { this.docsUrl = docsUrl; }
}