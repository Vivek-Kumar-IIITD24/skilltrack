package com.skilltrack.backend.controller;

import com.skilltrack.backend.repository.SkillRepository; // Or CourseRepository if you renamed it
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.repository.UserSkillRepository;

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
    private SkillRepository skillRepository; 

    @Autowired
    private UserSkillRepository userSkillRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // 1. Count Total Users (Students)
        // Assuming you have a 'role' column. If not, just count all users.
        long totalUsers = userRepository.count(); 
        long activeStudents = totalUsers; // For now, treat all as active students
        
        // 2. Count Total Courses (Skills)
        long totalCourses = skillRepository.count();

        // 3. Count Completions
        long completions = userSkillRepository.countByStatus("COMPLETED");

        // 4. Recent Activity (Latest 5 Enrollments)
        java.util.List<Map<String, Object>> recentActivity = 
            userSkillRepository.findRecentActivity(
                org.springframework.data.domain.PageRequest.of(0, 5)
            );

        stats.put("totalUsers", totalUsers);
        stats.put("activeStudents", activeStudents);
        stats.put("totalCourses", totalCourses);
        stats.put("completions", completions);
        stats.put("recentActivity", recentActivity);

        return ResponseEntity.ok(stats);
    }
}