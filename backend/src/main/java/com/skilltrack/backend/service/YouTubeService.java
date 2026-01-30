package com.skilltrack.backend.service;

import com.skilltrack.backend.entity.Lesson;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Base64;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class YouTubeService {

    // 🔴 Use application.properties for API key
    @Value("${youtube.api.key}")
    private String API_KEY;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Lesson> fetchLessonsFromUrl(String url) {
        String playlistId = extractPlaylistId(url);
        String videoId = extractVideoId(url);

        if (playlistId != null) {
            System.out.println(">>> 📦 Fetching Playlist: " + playlistId);
            return fetchPlaylist(playlistId);
        } else if (videoId != null) {
            System.out.println(">>> 🎥 Fetching Single Video: " + videoId);
            return fetchSingleVideo(videoId);
        } else {
            throw new RuntimeException("Invalid YouTube URL. Could not find Playlist or Video ID.");
        }
    }

    private List<Lesson> fetchPlaylist(String playlistId) {
        List<Lesson> allLessons = new ArrayList<>();
        List<String> allVideoIds = new ArrayList<>();
        String nextPageToken = null;
        int order = 1;

        // 1. LOOP TO FETCH ALL PAGES (50 at a time)
        do {
            try {
                String url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=" + playlistId + "&key=" + API_KEY;
                if (nextPageToken != null) {
                    url += "&pageToken=" + nextPageToken;
                }

                ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode items = root.path("items");

                for (JsonNode item : items) {
                    String vId = item.path("contentDetails").path("videoId").asText();
                    String title = item.path("snippet").path("title").asText();
                    String description = item.path("snippet").path("description").asText();
                    
                    if ("Private video".equals(title) || "Deleted video".equals(title)) continue;

                    Lesson lesson = new Lesson();
                    lesson.setTitle(title);
                    lesson.setDescription(description); // Store description for quiz generation
                    lesson.setVideoId(vId);
                    lesson.setLessonOrder(order++);
                    
                    allLessons.add(lesson);
                    allVideoIds.add(vId);
                }

                // Check if there is another page
                nextPageToken = root.has("nextPageToken") ? root.get("nextPageToken").asText() : null;

            } catch (Exception e) {
                System.out.println(">>> ❌ Error fetching page: " + e.getMessage());
                break;
            }
        } while (nextPageToken != null);

        System.out.println(">>> ✅ Found " + allLessons.size() + " videos. Fetching details...");

        // 2. FETCH DURATIONS IN BATCHES OF 50 (API Limit)
        return enrichLessonsWithDetails(allLessons, allVideoIds);
    }

    private List<Lesson> fetchSingleVideo(String videoId) {
        List<Lesson> lessons = new ArrayList<>();
        List<String> videoIds = new ArrayList<>();
        videoIds.add(videoId);
        
        // Fetch video details to get title and description
        try {
            String url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" + videoId + "&key=" + API_KEY;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode items = objectMapper.readTree(response.getBody()).path("items");
            
            if (items.size() > 0) {
                JsonNode item = items.get(0);
                String title = item.path("snippet").path("title").asText();
                String description = item.path("snippet").path("description").asText();
                
                Lesson lesson = new Lesson();
                lesson.setTitle(title);
                lesson.setDescription(description);
                lesson.setVideoId(videoId);
                lesson.setLessonOrder(1);
                lessons.add(lesson);
            }
        } catch (Exception e) {
            System.out.println(">>> ⚠️ Error fetching single video details: " + e.getMessage());
            Lesson lesson = new Lesson();
            lesson.setVideoId(videoId);
            lesson.setLessonOrder(1);
            lessons.add(lesson);
        }

        return enrichLessonsWithDetails(lessons, videoIds);
    }

    private List<Lesson> enrichLessonsWithDetails(List<Lesson> lessons, List<String> videoIds) {
        if (videoIds.isEmpty()) return lessons;

        // Process in batches of 50
        int batchSize = 50;
        for (int i = 0; i < videoIds.size(); i += batchSize) {
            int end = Math.min(i + batchSize, videoIds.size());
            List<String> batchIds = videoIds.subList(i, end);
            
            String idsParam = String.join(",", batchIds);
            String url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" + idsParam + "&key=" + API_KEY;

            try {
                ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
                JsonNode items = objectMapper.readTree(response.getBody()).path("items");

                for (JsonNode item : items) {
                    String id = item.path("id").asText();
                    String durationIso = item.path("contentDetails").path("duration").asText();
                    String fullTitle = item.path("snippet").path("title").asText();
                    String description = item.path("snippet").path("description").asText();

                    // Find matching lesson and update it
                    for (Lesson l : lessons) {
                        if (l.getVideoId().equals(id)) {
                            l.setDuration(parseDuration(durationIso));
                            // Update title if the playlist one was truncated or generic
                            if (l.getTitle() == null || l.getTitle().isEmpty()) {
                                l.setTitle(fullTitle);
                            }
                            // Update description
                            if (l.getDescription() == null || l.getDescription().isEmpty()) {
                                l.setDescription(description);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ Warning: Could not fetch details batch: " + e.getMessage());
            }
        }
        return lessons;
    }

    /**
     * NEW METHOD: Get video transcript using YouTube Data API
     * Note: This requires the video to have captions and proper permissions
     */
    public String getVideoTranscript(String videoId) {
        try {
            System.out.println(">>> 📝 Attempting to fetch transcript for video: " + videoId);
            
            // Method 1: Try to get captions list (requires OAuth for private captions)
            // String transcript = getCaptionsViaOfficialAPI(videoId);
            
            // Method 2: Use YouTube's internal timedtext API (works for public captions)
            String transcript = getTimedTextTranscript(videoId);
            
            if (transcript != null && !transcript.isEmpty()) {
                System.out.println(">>> ✅ Successfully fetched transcript. Length: " + transcript.length());
                return cleanTranscript(transcript);
            }
            
            // Method 3: Fallback - use video description
            System.out.println(">>> ⚠️ No transcript available, using video description as fallback");
            return getVideoDescription(videoId);
            
        } catch (Exception e) {
            System.err.println(">>> ❌ Error fetching transcript: " + e.getMessage());
            return getVideoDescription(videoId); // Fallback to description
        }
    }
    
    /**
     * Method 1: Get transcript via YouTube's timedtext API
     * This works for videos with public captions
     */
    private String getTimedTextTranscript(String videoId) {
        try {
            // Try different languages - English first
            String[] languages = {"en", "en-US", "en-GB", ""};
            
            for (String lang : languages) {
                String url = "https://www.youtube.com/api/timedtext?lang=" + lang + "&v=" + videoId + "&fmt=json3";
                
                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                headers.set("Accept", "application/json");
                
                HttpEntity<String> entity = new HttpEntity<>(headers);
                
                try {
                    ResponseEntity<String> response = restTemplate.exchange(
                        url, HttpMethod.GET, entity, String.class
                    );
                    
                    if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                        return parseTimedTextJson(response.getBody());
                    }
                } catch (Exception e) {
                    // Try next language
                    continue;
                }
            }
        } catch (Exception e) {
            System.out.println(">>> ⚠️ Timedtext API error: " + e.getMessage());
        }
        return null;
    }
    
    /**
     * Parse YouTube's timedtext JSON response
     */
    private String parseTimedTextJson(String json) {
        try {
            JsonNode jsonNode = objectMapper.readTree(json);
            StringBuilder transcript = new StringBuilder();
            
            if (jsonNode.has("events")) {
                for (JsonNode event : jsonNode.path("events")) {
                    if (event.has("segs")) {
                        for (JsonNode seg : event.path("segs")) {
                            if (seg.has("utf8")) {
                                transcript.append(seg.get("utf8").asText()).append(" ");
                            }
                        }
                    }
                }
            }
            
            String result = transcript.toString().trim();
            return result.isEmpty() ? null : result;
            
        } catch (Exception e) {
            System.err.println(">>> ❌ Error parsing timedtext JSON: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Method 2: Get video description (fallback when no transcript)
     */
    private String getVideoDescription(String videoId) {
        try {
            String url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + API_KEY;
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode items = objectMapper.readTree(response.getBody()).path("items");
            
            if (items.size() > 0) {
                String description = items.get(0).path("snippet").path("description").asText();
                if (description != null && !description.isEmpty()) {
                    // Clean and limit description
                    return cleanTranscript(description.substring(0, Math.min(description.length(), 1000)));
                }
            }
        } catch (Exception e) {
            System.err.println(">>> ❌ Error fetching video description: " + e.getMessage());
        }
        
        return "Tutorial video about installation and setup. Covers downloading, installing, configuring, and testing.";
    }
    
    /**
     * Clean and format transcript/description
     */
    private String cleanTranscript(String text) {
        if (text == null) return null;
        
        // Remove excessive whitespace and special markers
        String cleaned = text
            .replaceAll("\\s+", " ")
            .replaceAll("\\[Music\\]", "")
            .replaceAll("\\[Applause\\]", "")
            .replaceAll("\\[Laughter\\]", "")
            .trim();
        
        // Limit length for API calls
        if (cleaned.length() > 3000) {
            cleaned = cleaned.substring(0, 3000) + "...";
        }
        
        return cleaned;
    }
    
    /**
     * NEW: Get video details including potential transcript availability
     */
    public JsonNode getVideoDetails(String videoId) {
        try {
            String url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=" + videoId + "&key=" + API_KEY;
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            
            if (root.path("items").size() > 0) {
                JsonNode item = root.path("items").get(0);
                
                // Check if captions might be available
                boolean hasCaptions = item.path("contentDetails").path("caption").asText().equals("true");
                String status = item.path("status").path("uploadStatus").asText();
                
                System.out.println(">>> 📊 Video details - Has captions: " + hasCaptions + ", Status: " + status);
                
                return item;
            }
        } catch (Exception e) {
            System.err.println(">>> ❌ Error fetching video details: " + e.getMessage());
        }
        return null;
    }

    private String extractPlaylistId(String url) {
        Pattern pattern = Pattern.compile("[?&]list=([^#\\&]+)");
        Matcher matcher = pattern.matcher(url);
        return matcher.find() ? matcher.group(1) : null;
    }

    private String extractVideoId(String url) {
        String pattern = "(?:youtu\\.be\\/|youtube\\.com(?:\\/embed\\/|\\/v\\/|\\/watch\\?v=|\\/watch\\?.+&v=))([^#\\&?]*).*";
        Pattern compiledPattern = Pattern.compile(pattern);
        Matcher matcher = compiledPattern.matcher(url);
        return matcher.find() ? matcher.group(1) : null;
    }

    private int parseDuration(String isoDuration) {
        try {
            if (isoDuration == null || isoDuration.equals("P0D")) return 0;
            return (int) Duration.parse(isoDuration).getSeconds();
        } catch (Exception e) {
            return 600; // Fallback
        }
    }
}