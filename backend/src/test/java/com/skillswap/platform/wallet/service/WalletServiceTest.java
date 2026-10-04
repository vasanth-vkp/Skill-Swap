package com.skillswap.platform.wallet.service;

import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.wallet.dto.CreditTransactionDto;
import com.skillswap.platform.wallet.dto.WalletSummaryDto;
import com.skillswap.platform.wallet.entity.CreditTransaction;
import com.skillswap.platform.wallet.entity.Wallet;
import com.skillswap.platform.wallet.repository.CreditTransactionRepository;
import com.skillswap.platform.wallet.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private CreditTransactionRepository creditTransactionRepository;

    @InjectMocks
    private WalletService walletService;

    private User requester;
    private User provider;
    private Skill skill;
    private ExchangeRequest exchange;
    private Wallet requesterWallet;
    private Wallet providerWallet;

    @BeforeEach
    void setUp() {
        requester = new User("Requester Alice", "alice@example.com", "hash", "Seattle, WA");
        requester.setId(1L);

        provider = new User("Provider Bob", "bob@example.com", "hash", "Seattle, WA");
        provider.setId(2L);

        skill = new Skill("Python Programming", "Technology");
        skill.setId(10L);

        exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.50"), "Learn Python basics");
        exchange.setId(100L);

        requesterWallet = new Wallet(1L, new BigDecimal("5.00"));
        providerWallet = new Wallet(2L, new BigDecimal("2.00"));
    }

    @Test
    @DisplayName("settleExchange should atomically deduct duration from requester, add to provider, and record transaction")
    void shouldSettleExchangeAtomically() {
        when(creditTransactionRepository.existsByExchangeId(100L)).thenReturn(false);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(requesterWallet));
        when(walletRepository.findByUserId(2L)).thenReturn(Optional.of(providerWallet));

        walletService.settleExchange(exchange);

        assertThat(requesterWallet.getBalance()).isEqualByComparingTo("3.50");
        assertThat(providerWallet.getBalance()).isEqualByComparingTo("3.50");

        verify(walletRepository, times(1)).save(requesterWallet);
        verify(walletRepository, times(1)).save(providerWallet);

        ArgumentCaptor<CreditTransaction> captor = ArgumentCaptor.forClass(CreditTransaction.class);
        verify(creditTransactionRepository, times(1)).save(captor.capture());

        CreditTransaction tx = captor.getValue();
        assertThat(tx.getExchange()).isEqualTo(exchange);
        assertThat(tx.getSender()).isEqualTo(requester);
        assertThat(tx.getReceiver()).isEqualTo(provider);
        assertThat(tx.getAmount()).isEqualByComparingTo("1.50");
        assertThat(tx.getType()).isEqualTo("EXCHANGE_TRANSFER");
    }

    @Test
    @DisplayName("settleExchange should be idempotent and skip transfer if transaction already exists")
    void shouldBeIdempotentWhenAlreadySettled() {
        when(creditTransactionRepository.existsByExchangeId(100L)).thenReturn(true);

        walletService.settleExchange(exchange);

        verify(walletRepository, never()).findByUserId(any());
        verify(walletRepository, never()).save(any());
        verify(creditTransactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("settleExchange should throw IllegalStateException when requester has insufficient balance")
    void shouldThrowWhenRequesterHasInsufficientBalance() {
        requesterWallet.setBalance(new BigDecimal("1.00")); // required is 1.50
        when(creditTransactionRepository.existsByExchangeId(100L)).thenReturn(false);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(requesterWallet));

        assertThatThrownBy(() -> walletService.settleExchange(exchange))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("insufficient balance");

        verify(walletRepository, never()).save(any());
        verify(creditTransactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("recordInitialGrant should record an INITIAL_GRANT credit transaction with null sender")
    void shouldRecordInitialGrant() {
        walletService.recordInitialGrant(requester, new BigDecimal("5.00"));

        ArgumentCaptor<CreditTransaction> captor = ArgumentCaptor.forClass(CreditTransaction.class);
        verify(creditTransactionRepository, times(1)).save(captor.capture());

        CreditTransaction tx = captor.getValue();
        assertThat(tx.getSender()).isNull();
        assertThat(tx.getReceiver()).isEqualTo(requester);
        assertThat(tx.getAmount()).isEqualByComparingTo("5.00");
        assertThat(tx.getType()).isEqualTo("INITIAL_GRANT");
    }

    @Test
    @DisplayName("getWalletSummary should return aggregated balance, total earned, and total spent")
    void shouldReturnWalletSummary() {
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(requesterWallet));
        when(creditTransactionRepository.calculateTotalEarned(1L)).thenReturn(new BigDecimal("3.00"));
        when(creditTransactionRepository.calculateTotalSpent(1L)).thenReturn(new BigDecimal("1.50"));
        when(creditTransactionRepository.countCompletedExchanges(1L)).thenReturn(2L);

        WalletSummaryDto summary = walletService.getWalletSummary(1L);

        assertThat(summary.balance()).isEqualByComparingTo("5.00");
        assertThat(summary.totalEarned()).isEqualByComparingTo("3.00");
        assertThat(summary.totalSpent()).isEqualByComparingTo("1.50");
        assertThat(summary.completedExchangesCount()).isEqualTo(2L);
    }

    @Test
    @DisplayName("getTransactionHistory should map transaction list with proper direction and counterparties")
    void shouldReturnTransactionHistoryWithDirections() {
        CreditTransaction grant = new CreditTransaction(null, null, requester, new BigDecimal("5.00"), "INITIAL_GRANT");
        grant.setId(1L);

        CreditTransaction earned = new CreditTransaction(exchange, provider, requester, new BigDecimal("2.00"), "EXCHANGE_TRANSFER");
        earned.setId(2L);

        CreditTransaction spent = new CreditTransaction(exchange, requester, provider, new BigDecimal("1.50"), "EXCHANGE_TRANSFER");
        spent.setId(3L);

        when(creditTransactionRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(spent, earned, grant));

        List<CreditTransactionDto> history = walletService.getTransactionHistory(1L);

        assertThat(history).hasSize(3);

        // spent check
        assertThat(history.get(0).direction()).isEqualTo("SPENT");
        assertThat(history.get(0).counterpartyName()).isEqualTo("Provider Bob");
        assertThat(history.get(0).amount()).isEqualByComparingTo("1.50");

        // earned check
        assertThat(history.get(1).direction()).isEqualTo("EARNED");
        assertThat(history.get(1).counterpartyName()).isEqualTo("Provider Bob");
        assertThat(history.get(1).amount()).isEqualByComparingTo("2.00");

        // initial grant check
        assertThat(history.get(2).direction()).isEqualTo("INITIAL_GRANT");
        assertThat(history.get(2).counterpartyName()).isEqualTo("SkillSwap Platform");
        assertThat(history.get(2).amount()).isEqualByComparingTo("5.00");
    }
}
