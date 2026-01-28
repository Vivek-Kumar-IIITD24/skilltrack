package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    
    // ✅ STRICT SEARCH: Requires BOTH User ID and Lesson ID.
    // If you use just "findByLessonId", everyone shares the same progress!
    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
}