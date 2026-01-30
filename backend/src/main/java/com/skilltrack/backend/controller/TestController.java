package com.skilltrack.backend.controller;

import com.skilltrack.backend.service.GeminiService; // ✅ Using Gemini Service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {
    
    @Autowired
    private GeminiService geminiService; // ✅ Inject Gemini Service
    
    @GetMapping("/gemini")
    public ResponseEntity<?> testGeminiConnection() {
        System.out.println(">>> 🧪 Testing Gemini Pro API Connection...");
        
        try {
            // 1. Create Dummy Data (No need for a real YouTube video)
            String testTitle = "Introduction to Java";
            String testVideoId = "test_id_123"; // Will fail transcript fetch but verify API logic
            String testDescription = "This is a basic tutorial about Java variables, loops, and classes.";

            // 2. Call the Real Service
            // This verifies: API Key is valid, Model exists, and JSON parsing works
            String jsonResponse = geminiService.generateVideoSpecificQuiz(testTitle, testVideoId, testDescription);
            
            System.out.println(">>> ✅ Test Successful! Gemini responded.");
            
            // 3. Return the AI's actual response to the browser
            return ResponseEntity.ok(jsonResponse);

        } catch (Exception e) {
            System.err.println(">>> ❌ Test Failed: " + e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("status", "FAILED");
            error.put("error", e.getMessage());
            error.put("tip", "Check your API Key in application.properties");
            
            return ResponseEntity.status(500).body(error);
        }
    }
}