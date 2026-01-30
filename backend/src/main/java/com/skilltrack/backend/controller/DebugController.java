package com.skilltrack.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

@RestController
@RequestMapping("/debug")
public class DebugController {

    @Value("${gemini.api.key}")
    private String apiKey;

    @GetMapping("/test-key")
    public ResponseEntity<String> testGeminiKey() {
        try {
            System.out.println(">>> 🧪 Testing Gemini API Key...");
            
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
            String jsonBody = "{ \"contents\": [{ \"parts\": [{ \"text\": \"Reply with 'OK' if you can hear me.\" }] }] }";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            RestTemplate rt = new RestTemplate();
            ResponseEntity<String> response = rt.postForEntity(url, entity, String.class);

            return ResponseEntity.ok("✅ SUCCESS! Your API Key is working.\n\nResponse from Google:\n" + response.getBody());

        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode())
                .body("❌ GOOGLE REJECTED YOUR KEY!\n" +
                      "Status Code: " + e.getStatusCode() + "\n" +
                      "Error Message: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("❌ CONNECTION ERROR (Check internet/firewall):\n" + e.getMessage());
        }
    }
}