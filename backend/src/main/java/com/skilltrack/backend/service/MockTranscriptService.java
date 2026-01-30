package com.skilltrack.backend.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;

@Service
@Profile("test") // Only active in test profile
public class MockTranscriptService extends YoutubeTranscriptService {
    
    // Mock transcripts for common tutorial videos
    private final Map<String, String> mockTranscripts = new HashMap<>();
    
    public MockTranscriptService() {
        // Add mock transcripts for testing
        mockTranscripts.put("dQw4w9WgXcQ", 
            "Hello and welcome to this tutorial. In this video, we'll learn about GitHub Desktop installation on Windows 11. " +
            "First, open your web browser and go to desktop.github.com. Download the installer for Windows. " +
            "Once downloaded, run the setup.exe file. Follow the installation wizard. " +
            "After installation, launch GitHub Desktop. You'll need to sign in with your GitHub account. " +
            "Configure Git with your name and email. Now you can clone repositories. " +
            "Use the File menu to clone a repository. Enter the repository URL. Choose local path. " +
            "Make changes to files. See changes in GitHub Desktop. Write a commit message. " +
            "Click Commit to master. Push to origin to upload changes. That's it! You've installed GitHub Desktop.");
            
        mockTranscripts.put("test123", 
            "This is a test video about Spring Boot. We'll create a REST API. " +
            "First, create a new Spring Boot project. Add web dependency. Create a controller class. " +
            "Add GetMapping annotation. Return JSON response. Run the application. " +
            "Test with Postman. Deploy to production server.");
    }
    
    @Override
    public String getVideoTranscript(String videoId) {
        // Return mock transcript if available
        if (mockTranscripts.containsKey(videoId)) {
            System.out.println(">>> 📝 Using mock transcript for video: " + videoId);
            return mockTranscripts.get(videoId);
        }
        
        // Fallback to generic transcript
        return "This tutorial covers installation and setup. Steps include downloading, installing, configuring, and testing. " +
               "Key commands: git clone, git add, git commit, git push. Common issues: path configuration, permissions.";
    }
}