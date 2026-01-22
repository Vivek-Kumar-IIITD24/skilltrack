package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    // ✅ Make sure this line exists!
    List<UserSkill> findByUserId(Long userId);
}

