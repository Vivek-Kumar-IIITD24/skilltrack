package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    // This gives us the power to find a lesson (and its title) by ID
}