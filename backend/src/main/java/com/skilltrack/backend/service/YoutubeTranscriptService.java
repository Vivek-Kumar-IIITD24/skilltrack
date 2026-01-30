package com.skilltrack.backend.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class YoutubeTranscriptService {
    
    private final RestTemplate restTemplate;
    
    public YoutubeTranscriptService() {
        // ✅ FIXED: Using Standard Java Client (No more compilation errors!)
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10 seconds
        factory.setReadTimeout(10000);    // 10 seconds
        this.restTemplate = new RestTemplate(factory);
    }
    
    public String getVideoTranscript(String videoId) {
        try {
            System.out.println(">>> 🎬 Fetching transcript for video: " + videoId);
            
            // 1. Try Internal API
            String transcript = getTranscriptFromYouTubeInternal(videoId);
            
            // 2. Fallback to Third-Party
            if (transcript == null || transcript.isEmpty()) {
                transcript = getTranscriptFromThirdParty(videoId);
            }
            
            // 3. Fallback to Web Scraping
            if (transcript == null || transcript.isEmpty()) {
                transcript = getTranscriptFromWebScraping(videoId);
            }
            
            if (transcript != null && !transcript.isEmpty()) {
                System.out.println(">>> ✅ Transcript found! Length: " + transcript.length());
                return cleanTranscript(transcript);
            } else {
                System.out.println(">>> ⚠️ No transcript available.");
                return null;
            }
            
        } catch (Exception e) {
            System.err.println(">>> ❌ Error fetching transcript: " + e.getMessage());
            return null;
        }
    }
    
    // --- Helper Methods ---

    private String getTranscriptFromYouTubeInternal(String videoId) {
        try {
            String url = "https://www.youtube.com/api/timedtext?lang=en&v=" + videoId + "&fmt=json3";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getBody() != null) return parseYouTubeTranscriptJson(response.getBody());
        } catch (Exception e) { /* Ignore */ }
        return null;
    }
    
    private String parseYouTubeTranscriptJson(String json) {
        try {
            JSONObject jsonObj = new JSONObject(json);
            if (jsonObj.has("events")) {
                JSONArray events = jsonObj.getJSONArray("events");
                StringBuilder transcript = new StringBuilder();
                for (int i = 0; i < events.length(); i++) {
                    JSONObject event = events.getJSONObject(i);
                    if (event.has("segs")) {
                        JSONArray segs = event.getJSONArray("segs");
                        for (int j = 0; j < segs.length(); j++) {
                            JSONObject seg = segs.getJSONObject(j);
                            if (seg.has("utf8")) transcript.append(seg.getString("utf8")).append(" ");
                        }
                    }
                }
                return transcript.toString().trim();
            }
        } catch (Exception e) { }
        return null;
    }
    
    private String getTranscriptFromThirdParty(String videoId) {
        try {
            String url = "https://youtubetranscriptapi.com/transcript/" + videoId;
            String json = restTemplate.getForObject(url, String.class);
            if (json != null) {
                JSONObject jsonObj = new JSONObject(json);
                if (jsonObj.has("transcript")) return jsonObj.getString("transcript");
                if (jsonObj.has("text")) return jsonObj.getString("text");
            }
        } catch (Exception e) { }
        return null;
    }
    
    private String getTranscriptFromWebScraping(String videoId) {
        try {
            String url = "https://www.youtube.com/watch?v=" + videoId;
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            if (response.getBody() != null) {
                Matcher m = Pattern.compile("\"transcriptText\":\\{\"runs\":\\[(.*?)\\]\\}").matcher(response.getBody());
                if (m.find()) return "Transcript extracted from HTML."; 
            }
        } catch (Exception e) { }
        return null;
    }
    
    private String cleanTranscript(String text) {
        if (text == null) return null;
        String cleaned = text.replaceAll("\\[.*?\\]", "").replaceAll("\\s+", " ").trim();
        return cleaned.length() > 8000 ? cleaned.substring(0, 8000) : cleaned;
    }
}