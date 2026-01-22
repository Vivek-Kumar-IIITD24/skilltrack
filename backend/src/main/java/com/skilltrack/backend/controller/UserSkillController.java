package com.skilltrack.backend.controller;

import com.skilltrack.backend.dto.UserSkillRequest;
import com.skilltrack.backend.dto.UserSkillResponse;
import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.entity.UserSkill;
import com.skilltrack.backend.repository.SkillRepository;
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.repository.UserSkillRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-skills")
public class UserSkillController {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

    public UserSkillController(
            UserRepository userRepository,
            SkillRepository skillRepository,
            UserSkillRepository userSkillRepository
    ) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
    }

    // ✅ ADMIN assigns skill
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/assign") 
    public ResponseEntity<?> assignSkill(@RequestBody UserSkillRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        UserSkill userSkill = new UserSkill(
                user,
                skill,
                request.getProgress()
        );

        userSkillRepository.save(userSkill);

        return ResponseEntity.ok("Skill assigned successfully");
    }

    // ✅ STUDENT / ADMIN — view own skills
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN')")
    @GetMapping("/me")
    public ResponseEntity<List<UserSkillResponse>> mySkills(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkillResponse> response = userSkillRepository.findByUser(user)
                .stream()
                .map(us -> new UserSkillResponse(
                        us.getSkill().getId(),
                        us.getSkill().getName(),
                        us.getSkill().getDescription(),
                        us.getProgress()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    // ✅ ADMIN — view any user's skills
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserSkillResponse>> userSkills(@PathVariable Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkillResponse> response = userSkillRepository.findByUser(user)
                .stream()
                .map(us -> new UserSkillResponse(
                        us.getSkill().getId(),
                        us.getSkill().getName(),
                        us.getSkill().getDescription(),
                        us.getProgress()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }
}