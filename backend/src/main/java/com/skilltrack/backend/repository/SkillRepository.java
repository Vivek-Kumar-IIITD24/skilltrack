package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; // ✅ Import Optional

public interface SkillRepository extends JpaRepository<Skill, Long> {
    boolean existsByName(String name);
    
    // ✅ Add this to find the existing course
    Optional<Skill> findByName(String name); 
}