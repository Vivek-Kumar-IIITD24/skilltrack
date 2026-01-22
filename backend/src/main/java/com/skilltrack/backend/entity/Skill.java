package com.skilltrack.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // 📝 Skill description
    @Column(length = 255)
    private String description;

    // 🔹 Constructors
    public Skill() {}

    public Skill(String name, String description) {
        this.name = name;
        this.description = description;
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
}
