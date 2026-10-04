package com.skillswap.platform.wallet.repository;

import com.skillswap.platform.wallet.entity.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {

    boolean existsByExchangeId(Long exchangeId);

    Optional<CreditTransaction> findByExchangeId(Long exchangeId);

    @Query("SELECT t FROM CreditTransaction t WHERE t.sender.id = :userId OR t.receiver.id = :userId ORDER BY t.createdAt DESC")
    List<CreditTransaction> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM CreditTransaction t WHERE t.receiver.id = :userId AND t.type = 'EXCHANGE_TRANSFER'")
    BigDecimal calculateTotalEarned(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM CreditTransaction t WHERE t.sender.id = :userId AND t.type = 'EXCHANGE_TRANSFER'")
    BigDecimal calculateTotalSpent(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM CreditTransaction t WHERE (t.receiver.id = :userId OR t.sender.id = :userId) AND t.type = 'EXCHANGE_TRANSFER'")
    long countCompletedExchanges(@Param("userId") Long userId);
}
