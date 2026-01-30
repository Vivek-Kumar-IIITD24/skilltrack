package com.skilltrack.backend.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Service
public class GeminiService {

    @Autowired
    private YoutubeTranscriptService transcriptService;

    @Value("${gemini.api.key}")
    private String API_KEY;
    
    // Updated endpoint for Gemini 1.5 Flash (free tier)
    private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public String generateVideoSpecificQuiz(String title, String videoId, String description) {
        System.out.println("\n=== 🚀 STARTING QUIZ GENERATION WITH GEMINI ===");
        System.out.println(">>> 📹 Video Title: " + title);
        System.out.println(">>> 🆔 Video ID: " + videoId);
        
        // Get transcript
        String transcript = transcriptService.getVideoTranscript(videoId);
        
        String contextData;
        if (transcript != null && !transcript.isEmpty() && transcript.length() > 50) {
            System.out.println(">>> ✅ Using Transcript (Length: " + transcript.length() + ")");
            
            contextData = String.format(
                "VIDEO TITLE: %s\n" +
                "VIDEO DESCRIPTION: %s\n" +
                "TRANSCRIPT:\n%s",
                title,
                (description != null ? description.substring(0, Math.min(500, description.length())) : "No description"),
                transcript.length() > 3000 ? transcript.substring(0, 3000) + "..." : transcript
            );
        } else {
            System.out.println(">>> ⚠️ No usable transcript. Using Description.");
            
            contextData = String.format(
                "VIDEO TITLE: %s\n" +
                "VIDEO DESCRIPTION:\n%s",
                title, 
                (description != null ? description : "No description available")
            );
        }
        
        System.out.println(">>> 📝 Context prepared (Length: " + contextData.length() + ")");
        
        // GEMINI PROMPT - Simplified for better results
        String prompt = String.format(
            "You are an expert technical educator. Based on the following video content, create 5 multiple-choice quiz questions.\n\n" +
            "VIDEO CONTENT:\n%s\n\n" +
            "IMPORTANT REQUIREMENTS:\n" +
            "1. Questions must be specific to this video's content\n" +
            "2. Make questions practical and useful for learning\n" +
            "3. Each question must have exactly 4 options (A, B, C, D)\n" +
            "4. Clearly mark the correct answer\n" +
            "5. Return ONLY a JSON array\n\n" +
            "JSON FORMAT:\n" +
            "[{\"question\": \"What is...\", \"A\": \"Option 1\", \"B\": \"Option 2\", \"C\": \"Option 3\", \"D\": \"Option 4\", \"answer\": \"A\"}]\n\n" +
            "Return ONLY the JSON array. No markdown, no explanations.",
            contextData
        );

        System.out.println(">>> 🤖 Calling Gemini API...");
        String result = callGeminiAPI(prompt, title);
        System.out.println("=== ✅ QUIZ GENERATION COMPLETE ===\n");
        return result;
    }

    private String callGeminiAPI(String prompt, String title) {
        try {
            System.out.println(">>> 🔐 Checking Gemini API Key...");
            if (API_KEY == null || API_KEY.isEmpty() || API_KEY.contains("your-gemini-api-key")) {
                System.err.println(">>> ❌ GEMINI API KEY IS NOT SET!");
                System.err.println(">>> Please set gemini.api.key in application.properties");
                return getFallbackQuiz(title);
            }
            
            System.out.println(">>> 📡 API Key found (first 10 chars: " + API_KEY.substring(0, Math.min(10, API_KEY.length())) + "...)");

            RestTemplate restTemplate = new RestTemplate(new SimpleClientHttpRequestFactory());
            
            // Build Gemini request payload
            JSONObject contentPart = new JSONObject().put("text", prompt);
            JSONObject content = new JSONObject().put("parts", new JSONArray().put(contentPart));
            JSONObject requestBody = new JSONObject()
                .put("contents", new JSONArray().put(content))
                .put("generationConfig", new JSONObject()
                    .put("temperature", 0.7)
                    .put("topK", 1)
                    .put("topP", 0.95)
                    .put("maxOutputTokens", 2048));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String fullUrl = API_URL + API_KEY;
            System.out.println(">>> 🌐 Calling Gemini API at: " + fullUrl.substring(0, Math.min(60, fullUrl.length())) + "...");
            
            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                System.out.println(">>> ✅ Gemini API Success!");
                
                JSONObject jsonResponse = new JSONObject(response.getBody());
                String text = jsonResponse.getJSONArray("candidates").getJSONObject(0)
                        .getJSONObject("content").getJSONArray("parts").getJSONObject(0).getString("text");
                
                System.out.println(">>> 📦 Raw Response Received (Length: " + text.length() + ")");
                System.out.println(">>> 🔍 First 150 chars: " + text.substring(0, Math.min(150, text.length())));
                
                String cleaned = cleanJson(text);
                System.out.println(">>> ✨ Cleaned JSON (Length: " + cleaned.length() + ")");
                
                // Validate JSON
                try {
                    JSONArray questionsArray = new JSONArray(cleaned);
                    if (questionsArray.length() >= 3) {
                        System.out.println(">>> ✅ Valid JSON with " + questionsArray.length() + " questions");
                        return cleaned;
                    } else {
                        System.err.println(">>> ❌ Invalid JSON or too few questions: " + questionsArray.length());
                        return getFallbackQuiz(title);
                    }
                } catch (Exception e) {
                    System.err.println(">>> ❌ Failed to parse JSON: " + e.getMessage());
                    return getFallbackQuiz(title);
                }
            } else {
                System.err.println(">>> ❌ Gemini API Error Status: " + response.getStatusCode());
                return getFallbackQuiz(title);
            }
            
        } catch (HttpClientErrorException e) {
            System.err.println(">>> ❌ GEMINI HTTP ERROR: " + e.getStatusCode());
            System.err.println(">>> 📜 ERROR BODY: " + e.getResponseBodyAsString());
            return getFallbackQuiz(title);
        } catch (Exception e) {
            System.err.println(">>> ❌ GENERAL ERROR calling Gemini: " + e.getMessage());
            e.printStackTrace();
            return getFallbackQuiz(title);
        }
    }

    private String cleanJson(String text) {
        if (text == null) return "[]";
        
        // Remove markdown code blocks
        String cleaned = text
            .replace("```json", "")
            .replace("```", "")
            .trim();
        
        // Find JSON array
        int start = cleaned.indexOf("[");
        int end = cleaned.lastIndexOf("]");
        
        if (start != -1 && end != -1 && end > start) {
            String jsonArray = cleaned.substring(start, end + 1);
            
            // Fix common JSON formatting issues
            jsonArray = jsonArray
                .replaceAll("'", "\"")  // Replace single quotes with double quotes
                .replaceAll(",\\s*}", "}")  // Remove trailing commas
                .replaceAll(",\\s*\\]", "]");  // Remove trailing commas in arrays
            
            return jsonArray;
        }
        
        return "[]";
    }

    public String getFallbackQuiz(String topic) {
        System.out.println(">>> ⚠️ Using FALLBACK quiz for: " + topic);
        
        JSONArray quiz = new JSONArray();
        
        // Better fallback questions based on topic
        if (topic.toLowerCase().contains("github") || topic.toLowerCase().contains("git")) {
            quiz.put(createQuestion("What is the main purpose of GitHub Desktop?", 
                "Video editing", "Simplifying Git operations with GUI", 
                "Playing games", "Watching movies", "B"));
            quiz.put(createQuestion("Which action should you perform before pushing code?", 
                "Commit changes locally", "Delete the project", "Restart computer", "Nothing", "A"));
            quiz.put(createQuestion("What does 'Clone Repository' do in GitHub?", 
                "Deletes files", "Creates local copy of code", "Formats hard drive", "Sends email", "B"));
            quiz.put(createQuestion("Why use GitHub Desktop instead of command line?", 
                "More complex", "Easier for beginners", "Slower", "Less features", "B"));
            quiz.put(createQuestion("What is a 'commit' in GitHub Desktop?", 
                "A promise", "Saved snapshot of changes", "Error message", "File deletion", "B"));
        } else if (topic.toLowerCase().contains("install") || topic.toLowerCase().contains("setup")) {
            quiz.put(createQuestion("What's the first step in software installation?", 
                "Download installer", "Format computer", "Buy new hardware", "Call tech support", "A"));
            quiz.put(createQuestion("Why check system requirements before installing?", 
                "To waste time", "Ensure compatibility", "No reason", "For fun", "B"));
            quiz.put(createQuestion("What does 'Add to PATH' during installation mean?", 
                "Adds decorative path", "Makes program accessible from anywhere", "Creates new folder", "Changes wallpaper", "B"));
            quiz.put(createQuestion("After installation, you should:", 
                "Verify it works", "Uninstall immediately", "Ignore it", "Format PC", "A"));
            quiz.put(createQuestion("Common troubleshooting step for installation issues:", 
                "Run as Administrator", "Throw computer", "Ignore errors", "Buy new software", "A"));
        } else {
            // Generic fallback
            quiz.put(createQuestion("What is the main focus of this tutorial?", 
                "Technical learning", "Entertainment", "Cooking", "Sports", "A"));
            quiz.put(createQuestion("What should you do after watching this video?", 
                "Practice the concepts", "Forget everything", "Watch unrelated videos", "Sleep", "A"));
            quiz.put(createQuestion("This lesson teaches:", 
                "Practical skills", "Fiction writing", "Random trivia", "Nothing useful", "A"));
            quiz.put(createQuestion("If you encounter issues, you should:", 
                "Troubleshoot or research", "Give up", "Blame instructor", "Ignore", "A"));
            quiz.put(createQuestion("The goal of this video is to:", 
                "Teach useful skills", "Waste time", "Sell products", "Entertain briefly", "A"));
        }
        
        return quiz.toString();
    }

    private JSONObject createQuestion(String q, String a, String b, String c, String d, String ans) {
        JSONObject obj = new JSONObject();
        obj.put("question", q);
        obj.put("A", a);
        obj.put("B", b);
        obj.put("C", c);
        obj.put("D", d);
        obj.put("answer", ans);
        return obj;
    }
}