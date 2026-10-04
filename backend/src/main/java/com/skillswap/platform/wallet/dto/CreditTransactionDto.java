package com.skillswap.platform.wallet.dto;

import com.skillswap.platform.wallet.entity.CreditTransaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

public record CreditTransactionDto(
        Long id,
        Long exchangeId,
        BigDecimal amount,
        String type,
        String direction,
        String counterpartyName,
        Long counterpartyId,
        String skillTitle,
        Instant createdAt
) {
    public static CreditTransactionDto fromEntity(CreditTransaction tx, Long currentUserId) {
        Long exchangeId = tx.getExchange() != null ? tx.getExchange().getId() : null;
        String skillTitle = null;
        if (tx.getExchange() != null && tx.getExchange().getSkill() != null) {
            skillTitle = tx.getExchange().getSkill().getName();
        }

        String direction;
        String counterpartyName;
        Long counterpartyId = null;

        if (tx.getSender() == null) {
            direction = "INITIAL_GRANT";
            counterpartyName = "SkillSwap Platform";
            if (skillTitle == null) {
                skillTitle = "Platform Welcome Grant";
            }
        } else if (Objects.equals(tx.getReceiver().getId(), currentUserId)) {
            direction = "EARNED";
            counterpartyName = tx.getSender().getName();
            counterpartyId = tx.getSender().getId();
        } else {
            direction = "SPENT";
            counterpartyName = tx.getReceiver().getName();
            counterpartyId = tx.getReceiver().getId();
        }

        return new CreditTransactionDto(
                tx.getId(),
                exchangeId,
                tx.getAmount(),
                tx.getType(),
                direction,
                counterpartyName,
                counterpartyId,
                skillTitle,
                tx.getCreatedAt()
        );
    }
}
