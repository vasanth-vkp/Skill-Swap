package com.skillswap.platform.user.repository;

import com.skillswap.platform.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query(value = """
        SELECT DISTINCT u FROM User u
        JOIN UserSkill us ON us.userId = u.id AND us.type = 'OFFERED'
        JOIN us.skill s
        WHERE (:category IS NULL OR :category = '' OR LOWER(s.category) = LOWER(:category))
          AND (:location IS NULL OR :location = '' OR LOWER(u.location) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:minRating IS NULL OR u.averageRating >= :minRating)
          AND (:keyword IS NULL OR :keyword = '' OR
               LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(u.bio) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """, countQuery = """
        SELECT COUNT(DISTINCT u) FROM User u
        JOIN UserSkill us ON us.userId = u.id AND us.type = 'OFFERED'
        JOIN us.skill s
        WHERE (:category IS NULL OR :category = '' OR LOWER(s.category) = LOWER(:category))
          AND (:location IS NULL OR :location = '' OR LOWER(u.location) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:minRating IS NULL OR u.averageRating >= :minRating)
          AND (:keyword IS NULL OR :keyword = '' OR
               LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(u.bio) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<User> searchProviders(
        @Param("category") String category,
        @Param("location") String location,
        @Param("minRating") Double minRating,
        @Param("keyword") String keyword,
        Pageable pageable
    );
}
