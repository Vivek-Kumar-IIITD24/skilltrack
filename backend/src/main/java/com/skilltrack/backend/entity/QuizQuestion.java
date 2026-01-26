package com.skilltrack.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long lessonId;

    @Column(length = 1000)
    private String question;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    
    private String correctAnswer; // "A", "B", "C", or "D"

    public QuizQuestion() {}

    public QuizQuestion(Long lessonId, String question, String a, String b, String c, String d, String correct) {
        this.lessonId = lessonId;
        this.question = question;
        this.optionA = a;
        this.optionB = b;
        this.optionC = c;
        this.optionD = d;
        this.correctAnswer = correct;
    }

    // Getters
    public Long getId() { return id; }
    public Long getLessonId() { return lessonId; }
    public String getQuestion() { return question; }
    public String getOptionA() { return optionA; }
    public String getOptionB() { return optionB; }
    public String getOptionC() { return optionC; }
    public String getOptionD() { return optionD; }
    
    // We might want to hide the correct answer from the frontend in some designs, 
    // but for now, we'll send it so the frontend can validate immediately.
    public String getCorrectAnswer() { return correctAnswer; } 
}