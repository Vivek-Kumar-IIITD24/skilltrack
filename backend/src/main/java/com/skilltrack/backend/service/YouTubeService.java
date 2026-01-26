package com.skilltrack.backend.service;

import com.skilltrack.backend.entity.Lesson;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class YouTubeService {

    // 🔴 KEEP YOUR API KEY HERE
    private final String API_KEY = "AIzaSyDpokBbSRIoQ4mGbXETKjRLmoj-C_gFKr4"; 
    
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
                    
                    if ("Private video".equals(title) || "Deleted video".equals(title)) continue;

                    Lesson lesson = new Lesson();
                    lesson.setTitle(title);
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
        
        Lesson lesson = new Lesson();
        lesson.setVideoId(videoId);
        lesson.setLessonOrder(1);
        lessons.add(lesson);

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

                    // Find matching lesson and update it
                    for (Lesson l : lessons) {
                        if (l.getVideoId().equals(id)) {
                            l.setDuration(parseDuration(durationIso));
                            // Update title if the playlist one was truncated or generic
                            if (l.getTitle() == null || l.getTitle().isEmpty()) l.setTitle(fullTitle);
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ Warning: Could not fetch details batch: " + e.getMessage());
            }
        }
        return lessons;
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