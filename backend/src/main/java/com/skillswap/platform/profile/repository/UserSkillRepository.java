package com.skillswap.platform.profile.repository;

import com.skillswap.platform.profile.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUserId(Long userId);

    List<UserSkill> findByUserIdAndType(Long userId, String type);

    boolean existsByUserIdAndSkillIdAndType(Long userId, Long skillId, String type);

    Optional<UserSkill> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
