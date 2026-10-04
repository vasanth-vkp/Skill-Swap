package com.skillswap.platform.profile.entity;

import com.skillswap.platform.skill.entity.Skill;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_skills", uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_skill_type", columnNames = {"user_id", "skill_id", "type"})
})
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(nullable = false, length = 20)
    private String type; // 'OFFERED' or 'WANTED'

    @Column(length = 50)
    private String experience; // 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public UserSkill() {}

    public UserSkill(Long userId, Skill skill, String type, String experience) {
        this.userId = userId;
        this.skill = skill;
        this.type = type;
        this.experience = experience;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
