package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.entity.UserSkill;
import com.skilltrack.backend.repository.SkillRepository;
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.repository.UserSkillRepository;
import com.skilltrack.backend.service.CertificateService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@RestController
@RequestMapping("/certificate")
public class CertificateController {

    private final CertificateService certificateService;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

    public CertificateController(CertificateService certificateService, UserRepository userRepository,
                                 SkillRepository skillRepository, UserSkillRepository userSkillRepository) {
        this.certificateService = certificateService;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
    }

    @GetMapping("/download/{skillId}")
    public ResponseEntity<?> downloadCertificate(@PathVariable Long skillId) {
        try {
            // 1. Get Logged-in User
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 2. Get Course Details
            Skill skill = skillRepository.findById(skillId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            // 3. Verify Completion (Security Check 🔒)
            Optional<UserSkill> userSkillOpt = userSkillRepository.findByUserIdAndSkillId(user.getId(), skillId);
            
            if (userSkillOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("You are not enrolled in this course.");
            }

            UserSkill userSkill = userSkillOpt.get();
            
            // Allow download if status is COMPLETED or progress is 100%
            if (!"COMPLETED".equalsIgnoreCase(userSkill.getStatus()) && userSkill.getProgress() < 100) {
                return ResponseEntity.status(403).body("Course not completed yet! Keep learning.");
            }

            // 4. Generate Certificate Data
            String date = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
            String verifyUrl = "https://skilltrack.com/verify/" + user.getId() + "/" + skillId; // Fake URL for demo

            byte[] pdfBytes = certificateService.generateCertificate(
                    user.getName(),
                    skill.getName(),
                    date,
                    verifyUrl
            );

            // 5. Return PDF File
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=certificate.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error generating certificate: " + e.getMessage());
        }
    }
}