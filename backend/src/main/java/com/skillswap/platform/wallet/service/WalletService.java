package com.skillswap.platform.wallet.service;

import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.wallet.dto.CreditTransactionDto;
import com.skillswap.platform.wallet.dto.WalletSummaryDto;
import com.skillswap.platform.wallet.entity.CreditTransaction;
import com.skillswap.platform.wallet.entity.Wallet;
import com.skillswap.platform.wallet.repository.CreditTransactionRepository;
import com.skillswap.platform.wallet.repository.WalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);

    private final WalletRepository walletRepository;
    private final CreditTransactionRepository creditTransactionRepository;

    public WalletService(
            WalletRepository walletRepository,
            CreditTransactionRepository creditTransactionRepository
    ) {
        this.walletRepository = walletRepository;
        this.creditTransactionRepository = creditTransactionRepository;
    }

    public void settleExchange(ExchangeRequest exchange) {
        if (exchange == null || exchange.getId() == null) {
            throw new IllegalArgumentException("Exchange request must not be null and must have an ID");
        }

        // Idempotency guard (WALL-04)
        if (creditTransactionRepository.existsByExchangeId(exchange.getId())) {
            log.warn("Exchange {} has already been settled. Skipping duplicate settlement.", exchange.getId());
            return;
        }

        BigDecimal amount = exchange.getDuration() != null ? exchange.getDuration() : new BigDecimal("1.00");
        Long requesterId = exchange.getRequester().getId();
        Long providerId = exchange.getProvider().getId();

        Wallet requesterWallet = walletRepository.findByUserId(requesterId)
                .orElseThrow(() -> new IllegalStateException("Wallet not found for requester ID: " + requesterId));

        // Solvency check (WALL-04)
        if (requesterWallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Requester has insufficient balance (balance: "
                    + requesterWallet.getBalance() + ", required: " + amount + ") for settlement");
        }

        Wallet providerWallet = walletRepository.findByUserId(providerId)
                .orElseGet(() -> {
                    Wallet w = new Wallet(providerId, BigDecimal.ZERO);
                    return walletRepository.save(w);
                });

        // Deduct from requester (service recipient)
        requesterWallet.setBalance(requesterWallet.getBalance().subtract(amount));
        walletRepository.save(requesterWallet);

        // Add to provider (service deliverer)
        providerWallet.setBalance(providerWallet.getBalance().add(amount));
        walletRepository.save(providerWallet);

        // Record immutable audit ledger entry (WALL-03)
        CreditTransaction transaction = new CreditTransaction(
                exchange,
                exchange.getRequester(),
                exchange.getProvider(),
                amount,
                "EXCHANGE_TRANSFER"
        );
        creditTransactionRepository.save(transaction);

        log.info("Settled exchange {}: transferred {} credits from requester {} to provider {}",
                exchange.getId(), amount, requesterId, providerId);
    }

    public void recordInitialGrant(User user, BigDecimal amount) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("User must not be null and must have an ID");
        }
        CreditTransaction grant = new CreditTransaction(
                null,
                null,
                user,
                amount != null ? amount : new BigDecimal("5.00"),
                "INITIAL_GRANT"
        );
        creditTransactionRepository.save(grant);
        log.info("Recorded initial grant of {} credits for user {}", amount, user.getId());
    }

    @Transactional(readOnly = true)
    public WalletSummaryDto getWalletSummary(Long userId) {
        BigDecimal balance = walletRepository.findByUserId(userId)
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);

        BigDecimal totalEarned = creditTransactionRepository.calculateTotalEarned(userId);
        BigDecimal totalSpent = creditTransactionRepository.calculateTotalSpent(userId);
        long completedCount = creditTransactionRepository.countCompletedExchanges(userId);

        return new WalletSummaryDto(
                balance,
                totalEarned != null ? totalEarned : BigDecimal.ZERO,
                totalSpent != null ? totalSpent : BigDecimal.ZERO,
                completedCount
        );
    }

    @Transactional(readOnly = true)
    public List<CreditTransactionDto> getTransactionHistory(Long userId) {
        List<CreditTransaction> transactions = creditTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return transactions.stream()
                .map(tx -> CreditTransactionDto.fromEntity(tx, userId))
                .collect(Collectors.toList());
    }
}
