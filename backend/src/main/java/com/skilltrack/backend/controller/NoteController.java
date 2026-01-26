package com.skilltrack.backend.controller;

import com.skilltrack.backend.entity.Note;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.repository.NoteRepository;
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.service.FileStorageService; // ✅ Import
import org.springframework.core.io.Resource; // ✅ Import
import org.springframework.core.io.UrlResource; // ✅ Import
import org.springframework.http.HttpHeaders; // ✅ Import
import org.springframework.http.MediaType; // ✅ Import
import org.springframework.http.ResponseEntity; // ✅ Import
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // ✅ Import

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService; // ✅ Service

    public NoteController(NoteRepository noteRepository, UserRepository userRepository, FileStorageService fileStorageService) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    // Existing Text Note Endpoint
    @PostMapping("/{lessonId}")
    public Note addNote(
            @PathVariable Long lessonId,
            @RequestParam String content,
            @RequestParam int timestamp) {
        
        User user = getCurrentUser();
        Note note = new Note(user.getId(), lessonId, content, timestamp);
        return noteRepository.save(note);
    }

    // ✅ NEW: File Upload Endpoint
    @PostMapping("/{lessonId}/upload")
    public Note uploadNote(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file) {
        
        User user = getCurrentUser();
        String fileName = fileStorageService.storeFile(file);
        
        // Save as Note (content = original filename, fileUrl = stored filename)
        Note note = new Note(user.getId(), lessonId, file.getOriginalFilename(), fileName);
        return noteRepository.save(note);
    }

    // ✅ NEW: Serve File Endpoint (To view image/PDF)
    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            Path filePath = fileStorageService.loadFile(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType("application/octet-stream"))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Existing Get Notes
    @GetMapping("/{lessonId}")
    public List<Note> getNotes(@PathVariable Long lessonId) {
        User user = getCurrentUser();
        return noteRepository.findByUserIdAndLessonIdOrderByTimestampSecondsAsc(user.getId(), lessonId);
    }

    // Existing Delete
    @DeleteMapping("/{noteId}")
    public void deleteNote(@PathVariable Long noteId) {
        noteRepository.deleteById(noteId);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}