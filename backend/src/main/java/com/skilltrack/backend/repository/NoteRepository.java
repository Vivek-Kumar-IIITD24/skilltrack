package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserIdAndLessonIdOrderByTimestampSecondsAsc(Long userId, Long lessonId);
}