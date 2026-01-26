package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    
    List<UserSkill> findByUserId(Long userId);
    
    // ✅ ADD THIS: Used for Safety Check
    List<UserSkill> findBySkillId(Long skillId);

    boolean existsByUserIdAndSkillId(Long userId, Long skillId);

    Optional<UserSkill> findByUserIdAndSkillId(Long userId, Long skillId);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);

    @Modifying
    @Transactional
    void deleteBySkillId(Long skillId);
}