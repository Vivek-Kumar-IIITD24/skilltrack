package com.skilltrack.backend.controller;

import com.skilltrack.backend.repository.UserSkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/leaderboard")
public class LeaderboardController {

    @Autowired
    private UserSkillRepository userSkillRepository;

    @GetMapping
    public ResponseEntity<?> getLeaderboard() {
        try {
            // Note: The repository method returns List<Object> where each object is a Map
            // But due to type erasure, safe casting is tricky. 
            // Let's rely on the query result being mappable.
            List<?> result = userSkillRepository.findTopUsers();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error fetching leaderboard: " + e.getMessage());
        }
    }
}
