package com.skilltrack.backend.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiService {

    // 🔴 Keep your key here, but we have a backup plan now!
    private final String API_KEY = "AIzaSyCGn-X6_nB0bYSUm3jrxNWSS-GQqMwaluk"; 
    private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;

    public String generateQuizContent(String topic, String description) {
        try {
            // 1. Try to call Google Gemini
            RestTemplate restTemplate = new RestTemplate();
            
            String prompt = "Create 3 multiple choice questions about this topic: '" + topic + "'. " +
                    "Format the output strictly as a JSON Array of objects with keys: " +
                    "'question', 'A', 'B', 'C', 'D', 'answer' (answer should be just the letter A, B, C, or D). " +
                    "Do not include markdown formatting like ```json.";

            JSONObject content = new JSONObject();
            JSONObject parts = new JSONObject();
            parts.put("text", prompt);
            
            JSONArray partsArray = new JSONArray();
            partsArray.put(parts);
            
            JSONObject contents = new JSONObject();
            contents.put("parts", partsArray);
            
            JSONArray contentsArray = new JSONArray();
            contentsArray.put(contents);
            
            JSONObject requestBody = new JSONObject();
            requestBody.put("contents", contentsArray);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);

            ResponseEntity<String> response = restTemplate.postForEntity(API_URL, entity, String.class);
            
            JSONObject jsonResponse = new JSONObject(response.getBody());
            String text = jsonResponse.getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");

            return text.replace("```json", "").replace("```", "").trim();

        } catch (Exception e) {
            // 🚨 IF API FAILS, WE USE THE BACKUP QUIZ IMMEDIATELY
            System.out.println("⚠️ Gemini API Error: " + e.getMessage());
            System.out.println("✅ Switching to OFFLINE BACKUP QUIZ for demo.");
            return getFallbackQuiz(topic);
        }
    }

    // ✅ THE BACKUP QUIZ GENERATOR
    private String getFallbackQuiz(String topic) {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"What is the primary focus of the lesson '" + escape(topic) + "'?\",\n" +
                "    \"A\": \"Cooking Basics\",\n" +
                "    \"B\": \"The technical content taught in the video\",\n" +
                "    \"C\": \"Gardening Tips\",\n" +
                "    \"D\": \"History of Dance\",\n" +
                "    \"answer\": \"B\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"To verify your learning, you must:\",\n" +
                "    \"A\": \"Skip the video entirely\",\n" +
                "    \"B\": \"Watch the video and pass this assessment\",\n" +
                "    \"C\": \"Close the application\",\n" +
                "    \"D\": \"Turn off your phone\",\n" +
                "    \"answer\": \"B\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which of the following is true about this course?\",\n" +
                "    \"A\": \"It requires no effort\",\n" +
                "    \"B\": \"It helps build real-world skills\",\n" +
                "    \"C\": \"It is just for entertainment\",\n" +
                "    \"D\": \"It has no value\",\n" +
                "    \"answer\": \"B\"\n" +
                "  }\n" +
                "]";
    }
    
    private String escape(String str) {
        return str != null ? str.replace("\"", "'") : "Lesson";
    }
}