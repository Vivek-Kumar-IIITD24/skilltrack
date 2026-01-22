package com.skilltrack.backend.dto;

public class UserSkillResponse {

    private Long skillId;
    private String skillName;
    private String description;
    private int progress;

    public UserSkillResponse(
            Long skillId,
            String skillName,
            String description,
            int progress
    ) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.description = description;
        this.progress = progress;
    }

    public Long getSkillId() {
        return skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public String getDescription() {
        return description;
    }

    public int getProgress() {
        return progress;
    }
}
