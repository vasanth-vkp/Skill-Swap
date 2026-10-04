package com.skillswap.platform.exchange.entity;

import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "exchange_requests")
public class ExchangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal duration = new BigDecimal("1.00");

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExchangeStatus status = ExchangeStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "provider_confirmed", nullable = false)
    private boolean providerConfirmed = false;

    @Column(name = "requester_confirmed", nullable = false)
    private boolean requesterConfirmed = false;

    @Column(name = "provider_confirmed_at")
    private Instant providerConfirmedAt;

    @Column(name = "requester_confirmed_at")
    private Instant requesterConfirmedAt;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disputed_by_id")
    private User disputedBy;

    @Column(name = "disputed_at")
    private Instant disputedAt;

    public ExchangeRequest() {}

    public ExchangeRequest(User requester, User provider, Skill skill, BigDecimal duration, String notes) {
        this.requester = requester;
        this.provider = provider;
        this.skill = skill;
        this.duration = duration != null ? duration : new BigDecimal("1.00");
        this.notes = notes;
        this.status = ExchangeStatus.PENDING;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public User getProvider() {
        return provider;
    }

    public void setProvider(User provider) {
        this.provider = provider;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public BigDecimal getDuration() {
        return duration;
    }

    public void setDuration(BigDecimal duration) {
        this.duration = duration;
    }

    public ExchangeStatus getStatus() {
        return status;
    }

    public void setStatus(ExchangeStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isProviderConfirmed() {
        return providerConfirmed;
    }

    public void setProviderConfirmed(boolean providerConfirmed) {
        this.providerConfirmed = providerConfirmed;
    }

    public boolean isRequesterConfirmed() {
        return requesterConfirmed;
    }

    public void setRequesterConfirmed(boolean requesterConfirmed) {
        this.requesterConfirmed = requesterConfirmed;
    }

    public Instant getProviderConfirmedAt() {
        return providerConfirmedAt;
    }

    public void setProviderConfirmedAt(Instant providerConfirmedAt) {
        this.providerConfirmedAt = providerConfirmedAt;
    }

    public Instant getRequesterConfirmedAt() {
        return requesterConfirmedAt;
    }

    public void setRequesterConfirmedAt(Instant requesterConfirmedAt) {
        this.requesterConfirmedAt = requesterConfirmedAt;
    }

    public String getDisputeReason() {
        return disputeReason;
    }

    public void setDisputeReason(String disputeReason) {
        this.disputeReason = disputeReason;
    }

    public User getDisputedBy() {
        return disputedBy;
    }

    public void setDisputedBy(User disputedBy) {
        this.disputedBy = disputedBy;
    }

    public Instant getDisputedAt() {
        return disputedAt;
    }

    public void setDisputedAt(Instant disputedAt) {
        this.disputedAt = disputedAt;
    }
}
