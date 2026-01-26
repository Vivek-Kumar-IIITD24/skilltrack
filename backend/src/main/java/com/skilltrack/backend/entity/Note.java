package com.skilltrack.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long lessonId;

    private String fileUrl; // ✅ NEW: Stores path to image/PDF (null if text note)
    
    @Column(length = 1000)
    private String content;
    
    private int timestampSeconds; // e.g., 125 (2m 05s)
    private LocalDateTime createdAt;

    public Note() {}

    public Note(Long userId, Long lessonId, String content, int timestampSeconds) {
        this.userId = userId;
        this.lessonId = lessonId;
        this.content = content;
        this.timestampSeconds = timestampSeconds;
        this.createdAt = LocalDateTime.now();
    }

    // ✅ NEW: Constructor for File Uploads
    public Note(Long userId, Long lessonId, String fileName, String fileUrl) {
        this.userId = userId;
        this.lessonId = lessonId;
        this.content = fileName; // We use content to store the display name (e.g. "Page 1")
        this.fileUrl = fileUrl;
        this.timestampSeconds = 0; // Files usually aren't timestamped to a second
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }
    public String getContent() { return content; }
    public String getFileUrl() { return fileUrl; } // ✅ Getter
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; } // ✅ Setter
    public void setContent(String content) { this.content = content; }
    public int getTimestampSeconds() { return timestampSeconds; }
    public void setTimestampSeconds(int timestampSeconds) { this.timestampSeconds = timestampSeconds; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}