package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    
    // Find all skills for a specific user
    List<UserSkill> findByUserId(Long userId);

    // ✅ CRITICAL: Check if a user is already enrolled in a specific skill
    boolean existsByUserIdAndSkillId(Long userId, Long skillId);

    // Find a specific enrollment record
    Optional<UserSkill> findByUserIdAndSkillId(Long userId, Long skillId);
}