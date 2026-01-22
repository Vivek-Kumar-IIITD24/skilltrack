package com.skilltrack.backend.controller;

import com.skilltrack.backend.dto.UserSkillRequest;
import com.skilltrack.backend.dto.UserSkillResponse;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.entity.UserSkill;
import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.repository.UserSkillRepository;
import com.skilltrack.backend.repository.SkillRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user-skills")
public class UserSkillController {

    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public UserSkillController(UserSkillRepository userSkillRepository, UserRepository userRepository, SkillRepository skillRepository) {
        this.userSkillRepository = userSkillRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    // ✅ THIS IS THE FIX: The endpoint React was looking for
    @GetMapping("/me")
    public List<UserSkillResponse> getMySkills() {
        // 1. Get the logged-in user's email from the Token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 2. Find the User
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Find their skills
        List<UserSkill> skills = userSkillRepository.findByUserId(user.getId());

        // 4. Convert to JSON format
        return skills.stream().map(us -> new UserSkillResponse(
                us.getSkill().getId(),       // Return the Skill ID
                us.getSkill().getName(),     // Return Skill Name
                us.getSkill().getDescription(),
                us.getProgress(),
                us.getStatus()
        )).collect(Collectors.toList());
    }

    // (This is the existing endpoint you used in Postman)
    @PostMapping("/assign")
    public String assignSkill(@RequestBody UserSkillRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setProgress(request.getProgress());
        userSkill.setStatus("IN_PROGRESS");

        userSkillRepository.save(userSkill);
        return "Skill assigned successfully";
    }
}