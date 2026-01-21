package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.entity.Skill;
import com.skilltrack.backend.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUser(User user);

    Optional<UserSkill> findByUserAndSkill(User user, Skill skill);
}
