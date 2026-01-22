package com.skilltrack.backend.dto;

public class UserSkillResponse {
    private String studentName; // ✅ NEW: To show who is learning
    private Long skillId;
    private String skillName;
    private String description;
    private int progress;
    private String status;

    // Updated Constructor
    public UserSkillResponse(String studentName, Long skillId, String skillName, String description, int progress, String status) {
        this.studentName = studentName;
        this.skillId = skillId;
        this.skillName = skillName;
        this.description = description;
        this.progress = progress;
        this.status = status;
    }

    // Getters
    public String getStudentName() { return studentName; }
    public Long getSkillId() { return skillId; }
    public String getSkillName() { return skillName; }
    public String getDescription() { return description; }
    public int getProgress() { return progress; }
    public String getStatus() { return status; }
}