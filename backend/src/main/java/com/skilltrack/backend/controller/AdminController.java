package com.skilltrack.backend.controller;

import com.skilltrack.backend.repository.SkillRepository; // Or CourseRepository if you renamed it
import com.skilltrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository; // This counts your Courses

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 1. Count Total Users
        long totalUsers = userRepository.count();
        
        // 2. Count Total Courses (Skills)
        long totalCourses = skillRepository.count();
        
        // 3. (Optional) Count "Premium" users if you had that logic
        // long activeUsers = userRepository.countByRole("STUDENT");

        stats.put("totalUsers", totalUsers);
        stats.put("totalCourses", totalCourses);
        stats.put("revenue", totalUsers * 0); // Placeholder for future revenue

        return ResponseEntity.ok(stats);
    }
}