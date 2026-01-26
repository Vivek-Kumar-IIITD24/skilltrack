package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.Lesson;
import com.skilltrack.backend.entity.QuizQuestion;
import com.skilltrack.backend.repository.LessonRepository; // ✅ Now this works
import com.skilltrack.backend.repository.QuizRepository;
import com.skilltrack.backend.service.GeminiService;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quiz")
public class QuizController {

    private final QuizRepository quizRepository;
    private final LessonRepository lessonRepository; // ✅ Required to get Title
    private final GeminiService geminiService;

    public QuizController(QuizRepository quizRepository, LessonRepository lessonRepository, GeminiService geminiService) {
        this.quizRepository = quizRepository;
        this.lessonRepository = lessonRepository;
        this.geminiService = geminiService;
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<?> getQuiz(@PathVariable Long lessonId) {
        // 1. Check if quiz already exists in DB (Save money/time)
        List<QuizQuestion> existingQuiz = quizRepository.findByLessonId(lessonId);
        if (!existingQuiz.isEmpty()) {
            return ResponseEntity.ok(existingQuiz);
        }

        // 2. Fetch Lesson Metadata (Title is needed for AI Prompt)
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) {
            return ResponseEntity.notFound().build();
        }

        // 3. Generate with Gemini AI
        System.out.println(">>> 🤖 Generating AI Quiz for: " + lesson.getTitle());
        String jsonResponse = geminiService.generateQuizContent(lesson.getTitle(), "Programming/Education Context");

        try {
            // 4. Parse JSON and Save to DB
            JSONArray questionsArray = new JSONArray(jsonResponse);
            for (int i = 0; i < questionsArray.length(); i++) {
                JSONObject q = questionsArray.getJSONObject(i);
                
                QuizQuestion newQ = new QuizQuestion(
                    lessonId,
                    q.getString("question"),
                    q.getString("A"),
                    q.getString("B"),
                    q.getString("C"),
                    q.getString("D"),
                    q.getString("answer")
                );
                quizRepository.save(newQ);
            }
            
            // 5. Return the newly saved quiz
            return ResponseEntity.ok(quizRepository.findByLessonId(lessonId));

        } catch (Exception e) {
            System.out.println(">>> ❌ AI Generation Failed: " + e.getMessage());
            // Fallback: If AI fails, return empty list or error
            return ResponseEntity.status(500).body("Failed to generate quiz");
        }
    }
}