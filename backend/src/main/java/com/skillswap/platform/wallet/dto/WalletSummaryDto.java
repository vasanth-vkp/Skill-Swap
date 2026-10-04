package com.skillswap.platform.wallet.dto;

import java.math.BigDecimal;

public record WalletSummaryDto(
        BigDecimal balance,
        BigDecimal totalEarned,
        BigDecimal totalSpent,
        long completedExchangesCount
) {}
