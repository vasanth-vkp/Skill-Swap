package com.skillswap.platform.exchange.repository;

import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.exchange.entity.ExchangeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExchangeRequestRepository extends JpaRepository<ExchangeRequest, Long> {

    List<ExchangeRequest> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    List<ExchangeRequest> findByProviderIdAndStatusOrderByCreatedAtDesc(Long providerId, ExchangeStatus status);

    List<ExchangeRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    List<ExchangeRequest> findByRequesterIdAndStatusOrderByCreatedAtDesc(Long requesterId, ExchangeStatus status);

    long countByProviderIdAndStatus(Long providerId, ExchangeStatus status);

    long countByRequesterIdAndStatus(Long requesterId, ExchangeStatus status);
}
