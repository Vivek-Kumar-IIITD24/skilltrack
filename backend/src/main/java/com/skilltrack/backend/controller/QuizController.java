package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.Lesson;
import com.skilltrack.backend.entity.QuizQuestion;
import com.skilltrack.backend.repository.LessonRepository;
import com.skilltrack.backend.repository.QuizRepository;
import com.skilltrack.backend.service.GeminiService; // ✅ MUST BE GEMINI
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quiz")
public class QuizController {

    @Autowired private QuizRepository quizRepository;
    @Autowired private LessonRepository lessonRepository;
    @Autowired private GeminiService geminiService; // ✅ MUST BE GEMINI

    @GetMapping("/{lessonId}")
    public ResponseEntity<?> getQuiz(@PathVariable Long lessonId) {
        System.out.println(">>> 🎯 Requesting Quiz for Lesson ID: " + lessonId);

        // 1. FORCE DELETE (To retry AI)
        List<QuizQuestion> existing = quizRepository.findByLessonId(lessonId);
        if (!existing.isEmpty()) {
            System.out.println(">>> ♻️ Deleting existing quiz to force Gemini Pro...");
            quizRepository.deleteAll(existing);
        }

        // 2. Fetch Lesson
        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) return ResponseEntity.notFound().build();

        String desc = (lesson.getDescription() != null) ? lesson.getDescription() : lesson.getTitle();

        // 3. Generate
        try {
            System.out.println(">>> 🤖 Calling Gemini 1.5 Pro Service...");
            String jsonResponse = geminiService.generateVideoSpecificQuiz(lesson.getTitle(), lesson.getVideoId(), desc);
            
            if (saveQuizToDb(lessonId, jsonResponse)) {
                List<QuizQuestion> newQuiz = quizRepository.findByLessonId(lessonId);
                System.out.println(">>> ✅ Successfully generated " + newQuiz.size() + " questions");
                System.out.println(">>> 📤 Sending quiz to Mobile App...");
                return ResponseEntity.ok(newQuiz);
            } else {
                throw new Exception("Database save failed");
            }
            
        } catch (Exception e) {
            System.err.println(">>> ❌ Error: " + e.getMessage());
            System.out.println(">>> ⚠️ Loading Fallback Quiz.");
            String fallback = geminiService.getFallbackQuiz(lesson.getTitle());
            saveQuizToDb(lessonId, fallback);
            return ResponseEntity.ok(quizRepository.findByLessonId(lessonId));
        }
    }

    private boolean saveQuizToDb(Long lessonId, String jsonString) {
        try {
            JSONArray questionsArray = new JSONArray(jsonString);
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
            return true;
        } catch (Exception e) {
            System.err.println(">>> ❌ Save Failed: " + e.getMessage());
            return false;
        }
    }
}