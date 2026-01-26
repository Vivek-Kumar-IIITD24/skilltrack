package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByLessonId(Long lessonId);
    void deleteByLessonId(Long lessonId);
}