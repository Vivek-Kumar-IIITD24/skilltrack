package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.Lesson;
import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.repository.SkillRepository;
import com.skilltrack.backend.repository.UserSkillRepository; 
import com.skilltrack.backend.service.YouTubeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/skills")
public class SkillController {

    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;

    @Autowired
    private YouTubeService youTubeService;

    public SkillController(SkillRepository skillRepository, UserSkillRepository userSkillRepository) {
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        System.out.println(">>> 🟢 SKILL CONTROLLER LOADED (With Safety Checks)");
    }

    @PostMapping("/import-secure")
    public ResponseEntity<?> importPlaylist(
            @RequestParam String title,
            @RequestParam String category,
            @RequestParam String playlistUrl) {

        String cleanTitle = title.trim();
        Optional<Skill> existingSkill = skillRepository.findByName(cleanTitle);
        if (existingSkill.isPresent()) {
            return ResponseEntity.ok(existingSkill.get());
        }

        try {
            Skill newSkill = new Skill();
            newSkill.setName(cleanTitle);
            newSkill.setCategory(category);
            newSkill.setLevel("All Levels");
            newSkill.setDescription("Imported from YouTube");
            newSkill.setVideoUrl(playlistUrl);
            newSkill.setDocsUrl("");

            List<Lesson> realLessons = youTubeService.fetchLessonsFromUrl(playlistUrl);
            for (Lesson lesson : realLessons) {
                newSkill.addLesson(lesson);
            }

            Skill savedSkill = skillRepository.save(newSkill);
            return ResponseEntity.ok(savedSkill);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Import Error: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSkillById(@PathVariable Long id) {
        Optional<Skill> skill = skillRepository.findById(id);
        if (skill.isPresent()) {
            return ResponseEntity.ok(skill.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 4. ✅ FIXED: SAFETY FIRST DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSkill(@PathVariable Long id) {
        try {
            if (!skillRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            // 🛑 SAFETY CHECK: Check if anyone is enrolled
            // We use the count logic. If the repository doesn't have countBySkillId, we can fetch list size.
            // Note: Efficient way is creating a count method, but fetching list is okay for now.
            int enrolledCount = userSkillRepository.findBySkillId(id).size(); // We need to add this method to Repo

            if (enrolledCount > 0) {
                // Return 409 Conflict with a clear message
                return ResponseEntity.status(409)
                    .body("Cannot delete this course because " + enrolledCount + " student(s) are currently enrolled.");
            }

            // Only delete if NO students are enrolled
            skillRepository.deleteById(id);
            System.out.println(">>> ✅ Skill Deleted Successfully");
            
            return ResponseEntity.ok("Skill deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Delete failed: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> addSkill(@RequestBody Skill skill) {
        if (skill.getName() == null || skill.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Skill name cannot be empty");
        }
        if (skillRepository.existsByName(skill.getName())) {
            return ResponseEntity.badRequest().body("Skill already exists");
        }
        Skill savedSkill = skillRepository.save(skill);
        return ResponseEntity.ok(savedSkill);
    }
}