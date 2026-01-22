package com.skilltrack.backend.dto;

public class UserSkillResponse {
    private Long skillId;       // The ID of the skill (e.g., 3 for Java)
    private String skillName;   // "Java OPPS"
    private String description; // "Learn Objects..."
    private int progress;       // 45
    private String status;      // "IN_PROGRESS"

    // Constructor
    public UserSkillResponse(Long skillId, String skillName, String description, int progress, String status) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.description = description;
        this.progress = progress;
        this.status = status;
    }

    // Getters
    public Long getSkillId() { return skillId; }
    public String getSkillName() { return skillName; }
    public String getDescription() { return description; }
    public int getProgress() { return progress; }
    public String getStatus() { return status; }
}