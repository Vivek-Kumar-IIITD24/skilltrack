package com.skilltrack.backend.repository;

import com.skilltrack.backend.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    
    List<UserSkill> findByUserId(Long userId);

    // ✅ Count by status for stats
    long countByStatus(String status);
    
    // ✅ LEADERBOARD QUERY
    @Query("SELECT new map(u.id as userId, u.name as name, COUNT(us) as completedSkills) " +
           "FROM UserSkill us, User u " +  // Implicit join since no relationship mapping
           "WHERE us.userId = u.id AND us.status = 'COMPLETED' " +
           "GROUP BY u.id, u.name " +
           "ORDER BY completedSkills DESC")
    List<Map<String, Object>> findTopUsers();

    // ✅ RECENT ACTIVITY QUERY (Join User + Skill)
    // Fetches top 5 most recent activities (enrollments/updates) based on ID order
    @Query("SELECT new map(u.name as userName, s.name as courseTitle, us.status as status, us.updatedAt as timestamp) " +
           "FROM UserSkill us, User u, Skill s " +
           "WHERE us.userId = u.id AND us.skillId = s.id " +
           "ORDER BY us.updatedAt DESC")
    List<Map<String, Object>> findRecentActivity(org.springframework.data.domain.Pageable pageable);

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