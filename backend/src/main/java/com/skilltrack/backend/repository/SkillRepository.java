package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findByName(String name);

    boolean existsByName(String name);
}
