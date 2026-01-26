package com.skilltrack.backend.entity;

import jakarta.persistence.*; // Imports OneToMany, CascadeType, etc.
import java.util.ArrayList;
import java.util.List;

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

    // Existing Link fields
    private String videoUrl; 
    private String docsUrl;

    // ✅ NEW: The list of lessons inside this Course/Skill
    // "mappedBy" tells DB that 'skill' field in Lesson.java owns the relationship
    // "cascade = ALL" means if we save/delete a Skill, it automatically saves/deletes its Lessons
    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Lesson> lessons = new ArrayList<>();

    public Skill() {}

    public Skill(String name, String description, String level, String category, String videoUrl, String docsUrl) {
        this.name = name;
        this.description = description;
        this.level = level;
        this.category = category;
        this.videoUrl = videoUrl;
        this.docsUrl = docsUrl;
    }

    // ✅ NEW: Helper method to add a lesson and link it back to this skill
    public void addLesson(Lesson lesson) {
        lessons.add(lesson);
        lesson.setSkill(this);
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

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getDocsUrl() { return docsUrl; }
    public void setDocsUrl(String docsUrl) { this.docsUrl = docsUrl; }

    // ✅ NEW: Getter and Setter for lessons
    public List<Lesson> getLessons() { return lessons; }
    public void setLessons(List<Lesson> lessons) { this.lessons = lessons; }
}