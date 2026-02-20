package com.skilltrack.backend.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class YoutubeTranscriptService {
    
    private final RestTemplate restTemplate;
    
    public YoutubeTranscriptService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10 seconds
        factory.setReadTimeout(10000);    // 10 seconds
        this.restTemplate = new RestTemplate(factory);
    }
    
    public String getVideoTranscript(String videoId) {
        try {
            System.out.println(">>> 🎬 Fetching transcript for video: " + videoId);
            
            // 1. Try Extracting from Video Page (Most Reliable)
            String transcript = getTranscriptFromPageSource(videoId);
            
            // 2. Fallback to Third-Party API
            if (transcript == null || transcript.isEmpty()) {
                transcript = getTranscriptFromThirdParty(videoId);
            }
            
            if (transcript != null && !transcript.isEmpty()) {
                System.out.println(">>> ✅ Transcript found! Length: " + transcript.length());
                // Simple cleanup
                return transcript.replaceAll("&amp;", "&")
                                 .replaceAll("&quot;", "\"")
                                 .replaceAll("&#39;", "'")
                                 .replaceAll("<[^>]+>", "")
                                 .replaceAll("\\s+", " ")
                                 .trim();
            } else {
                System.out.println(">>> ⚠️ No transcript available.");
                return null;
            }
            
        } catch (Exception e) {
            System.err.println(">>> ❌ Error fetching transcript: " + e.getMessage());
            return null;
        }
    }
    
    private String getTranscriptFromPageSource(String videoId) {
        try {
            String url = "https://www.youtube.com/watch?v=" + videoId;
            HttpHeaders headers = new HttpHeaders();
            // Mimic a real browser to avoid blocks
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            headers.set("Accept-Language", "en-US,en;q=0.9");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            String html = response.getBody();
            if (html == null) return null;

            // Regex to find 'captionTracks' inside the HTML source
            // Improved regex to handle variations in JSON formatting
            Pattern pattern = Pattern.compile("(\"captionTracks\":\\s*\\[.*?\\])");
            Matcher matcher = pattern.matcher(html);
            
            String captionUrl = null;
            
            if (matcher.find()) {
                String potentialJson = matcher.group(1);
                 // Extract URL directly using regex instead of full JSON parsing which can be fragile
                 // Look for English track first
                 Pattern enUrlPattern = Pattern.compile("baseUrl\":\"(https:[^\"]+timedtext[^\"]+lang=en[^\"]*)\"");
                 Matcher enMatcher = enUrlPattern.matcher(potentialJson);
                 
                 if (enMatcher.find()) {
                     captionUrl = enMatcher.group(1).replace("\\u0026", "&");
                 } else {
                     // Fallback to any track
                     Pattern anyUrlPattern = Pattern.compile("baseUrl\":\"(https:[^\"]+timedtext[^\"]+)\"");
                     Matcher anyMatcher = anyUrlPattern.matcher(potentialJson);
                     if (anyMatcher.find()) {
                         captionUrl = anyMatcher.group(1).replace("\\u0026", "&");
                     }
                 }

                if (captionUrl != null) {
                    System.out.println(">>> 📄 Found Caption URL: " + captionUrl);
                    return fetchAndParseXmlTranscript(captionUrl);
                }
            } else {
                System.out.println(">>> ⚠️ No 'captionTracks' found in page source.");
            }
            
        } catch (Exception e) {
            System.err.println(">>> ⚠️ Page source extraction failed: " + e.getMessage());
        }
        return null;
    }

    private String fetchAndParseXmlTranscript(String url) {
        try {
            // Log the URL being fetched
            System.out.println("Fetching transcript from: " + url);

            // Fetch content from the caption URL
            // Force JSON3 format to ensure consistency
            if (!url.contains("&fmt=")) {
                url += "&fmt=json3";
            } else {
                // If fmt exists but isn't json3, replace it
                url = url.replaceAll("&fmt=[^&]*", "&fmt=json3");
            }
            
            System.out.println("Fetching transcript from: " + url);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            headers.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            String responseBody = response.getBody();
            
            if (responseBody == null || responseBody.isEmpty()) {
                System.out.println("❌ Response body is NULL or Empty. Status: " + response.getStatusCode());
                return null;
            }
            
            // Debug: Print start of content to verify format
            System.out.println(">>> 📄 Transcript Content Start: " + responseBody.substring(0, Math.min(responseBody.length(), 200)));

            // 1. Try XML Parsing (Preferred) - Regex looking for <text>
            if (responseBody.contains("<text")) {
                StringBuilder transcript = new StringBuilder();
                Pattern p = Pattern.compile("<text[^>]*>(.*?)</text>");
                Matcher m = p.matcher(responseBody);
                
                while (m.find()) {
                    String text = m.group(1);
                    // Decode HTML entities commonly found in transcripts
                    text = text.replace("&amp;#39;", "'")
                               .replace("&amp;quot;", "\"")
                               .replace("&amp;", "&");
                    transcript.append(text).append(" ");
                }
                
                String result = transcript.toString().trim();
                if (!result.isEmpty()) return result;
            }

             // 2. Try JSON Parsing (Fallback) - Regex looking for "utf8" values
             // YouTube sometimes returns nested JSON: { "events": [ { "segs": [ { "utf8": "..." } ] } ] }
             // Also check for "simpleText" which some formats use
             if (responseBody.contains("\"utf8\"") || responseBody.contains("\"simpleText\"")) {
                 System.out.println(">>> ⚠️ Parsing JSON transcript...");
                 Pattern jsonPattern = Pattern.compile("\"(utf8|simpleText)\":\\s*\"(.*?)\"");
                 Matcher jsonMatcher = jsonPattern.matcher(responseBody);
                 StringBuilder jsonTranscript = new StringBuilder();
                 while (jsonMatcher.find()) {
                     // Decode unicode escapes like \u0026
                     String text = jsonMatcher.group(2).replace("\\u0026", "&").replace("\\n", " ");
                     jsonTranscript.append(text).append(" ");
                 }
                 return jsonTranscript.toString().trim();
             }
            
            System.out.println("❌ Failed to parse transcript (Unknown format)");
            return null;
        } catch (Exception e) {
            System.err.println(">>> ❌ Transcript fetch/parsing failed: " + e.getMessage());
            return null;
        }
    }
    
    private String getTranscriptFromThirdParty(String videoId) {
        try {
            // Backup service
            String url = "https://youtubetranscriptapi.com/transcript/" + videoId;
            String json = restTemplate.getForObject(url, String.class);
            if (json != null) {
                JSONObject jsonObj = new JSONObject(json);
                if (jsonObj.has("transcript")) return jsonObj.getString("transcript");
                if (jsonObj.has("text")) return jsonObj.getString("text");
            }
        } catch (Exception e) { /* Ignore */ }
        return null;
    }
}