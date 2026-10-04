package com.skillswap.platform.exchange;

import com.skillswap.platform.exchange.dto.CreateExchangeRequest;
import com.skillswap.platform.exchange.dto.ExchangeDto;
import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.exchange.entity.ExchangeStatus;
import com.skillswap.platform.exchange.repository.ExchangeRequestRepository;
import com.skillswap.platform.exchange.service.ExchangeService;
import com.skillswap.platform.profile.repository.UserSkillRepository;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.skill.repository.SkillRepository;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import com.skillswap.platform.wallet.entity.Wallet;
import com.skillswap.platform.wallet.repository.WalletRepository;
import com.skillswap.platform.wallet.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExchangeServiceTest {

    @Mock
    private ExchangeRequestRepository exchangeRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private UserSkillRepository userSkillRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private com.skillswap.platform.booking.repository.BookingRepository bookingRepository;

    @Mock
    private WalletService walletService;

    @Mock
    private com.skillswap.platform.notification.service.NotificationService notificationService;

    @InjectMocks
    private ExchangeService exchangeService;

    private User requester;
    private User provider;
    private Skill skill;
    private Wallet requesterWallet;

    @BeforeEach
    void setUp() {
        requester = new User("Requester Alice", "alice@example.com", "hash", "Seattle, WA");
        requester.setId(1L);

        provider = new User("Provider Bob", "bob@example.com", "hash", "Seattle, WA");
        provider.setId(2L);

        skill = new Skill("Python Programming", "Technology");
        skill.setId(10L);

        requesterWallet = new Wallet(1L, new BigDecimal("5.00"));
    }

    @Test
    @DisplayName("Should successfully create exchange request when inputs are valid")
    void shouldCreateExchangeRequestSuccessfully() {
        CreateExchangeRequest req = new CreateExchangeRequest(2L, 10L, new BigDecimal("2.00"), "Want to learn Python");

        when(userRepository.findById(1L)).thenReturn(Optional.of(requester));
        when(userRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(skillRepository.findById(10L)).thenReturn(Optional.of(skill));
        when(userSkillRepository.existsByUserIdAndSkillIdAndType(2L, 10L, "OFFERED")).thenReturn(true);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(requesterWallet));

        when(exchangeRequestRepository.save(any(ExchangeRequest.class))).thenAnswer(invocation -> {
            ExchangeRequest saved = invocation.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        ExchangeDto result = exchangeService.createExchangeRequest(1L, req);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getRequesterId()).isEqualTo(1L);
        assertThat(result.getProviderId()).isEqualTo(2L);
        assertThat(result.getSkillId()).isEqualTo(10L);
        assertThat(result.getStatus()).isEqualTo(ExchangeStatus.PENDING);
        assertThat(result.getDuration()).isEqualByComparingTo("2.00");
        assertThat(result.getNotes()).isEqualTo("Want to learn Python");

        verify(exchangeRequestRepository, times(1)).save(any(ExchangeRequest.class));
    }

    @Test
    @DisplayName("Should reject exchange request when requester tries to request themselves")
    void shouldRejectSelfExchangeRequest() {
        CreateExchangeRequest req = new CreateExchangeRequest(1L, 10L, new BigDecimal("1.00"), "Self request");

        assertThatThrownBy(() -> exchangeService.createExchangeRequest(1L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot request an exchange with yourself");

        verifyNoInteractions(exchangeRequestRepository);
    }

    @Test
    @DisplayName("Should reject exchange request when provider does not offer the requested skill")
    void shouldRejectWhenProviderDoesNotOfferSkill() {
        CreateExchangeRequest req = new CreateExchangeRequest(2L, 10L, new BigDecimal("1.00"), "Help me");

        when(userRepository.findById(1L)).thenReturn(Optional.of(requester));
        when(userRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(skillRepository.findById(10L)).thenReturn(Optional.of(skill));
        when(userSkillRepository.existsByUserIdAndSkillIdAndType(2L, 10L, "OFFERED")).thenReturn(false);

        assertThatThrownBy(() -> exchangeService.createExchangeRequest(1L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Provider does not offer the requested skill");
    }

    @Test
    @DisplayName("Should reject exchange request when requester has insufficient wallet balance")
    void shouldRejectWhenInsufficientWalletBalance() {
        CreateExchangeRequest req = new CreateExchangeRequest(2L, 10L, new BigDecimal("6.00"), "6 hours please");
        requesterWallet.setBalance(new BigDecimal("3.00"));

        when(userRepository.findById(1L)).thenReturn(Optional.of(requester));
        when(userRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(skillRepository.findById(10L)).thenReturn(Optional.of(skill));
        when(userSkillRepository.existsByUserIdAndSkillIdAndType(2L, 10L, "OFFERED")).thenReturn(true);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(requesterWallet));

        assertThatThrownBy(() -> exchangeService.createExchangeRequest(1L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Insufficient wallet balance");
    }

    @Test
    @DisplayName("Should allow provider to accept a pending exchange request")
    void shouldAllowProviderToAcceptPendingExchange() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.PENDING);

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));
        when(exchangeRequestRepository.save(any(ExchangeRequest.class))).thenAnswer(i -> i.getArgument(0));

        ExchangeDto result = exchangeService.acceptExchange(50L, 2L); // 2L is provider

        assertThat(result.getStatus()).isEqualTo(ExchangeStatus.ACCEPTED);
    }

    @Test
    @DisplayName("Should forbid non-provider from accepting exchange request")
    void shouldForbidNonProviderFromAcceptingExchange() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.PENDING);

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));

        assertThatThrownBy(() -> exchangeService.acceptExchange(50L, 1L)) // 1L is requester, not provider
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only the designated provider can accept");
    }

    @Test
    @DisplayName("Should allow provider to reject a pending exchange request")
    void shouldAllowProviderToRejectPendingExchange() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.PENDING);

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));
        when(exchangeRequestRepository.save(any(ExchangeRequest.class))).thenAnswer(i -> i.getArgument(0));

        ExchangeDto result = exchangeService.rejectExchange(50L, 2L);

        assertThat(result.getStatus()).isEqualTo(ExchangeStatus.REJECTED);
    }

    @Test
    @DisplayName("Should allow requester to cancel a pending exchange request")
    void shouldAllowRequesterToCancelPendingExchange() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.PENDING);

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));
        when(exchangeRequestRepository.save(any(ExchangeRequest.class))).thenAnswer(i -> i.getArgument(0));

        ExchangeDto result = exchangeService.cancelExchange(50L, 1L); // 1L is requester

        assertThat(result.getStatus()).isEqualTo(ExchangeStatus.CANCELLED);
    }

    @Test
    @DisplayName("Should reject state transition when exchange is not pending")
    void shouldRejectTransitionWhenExchangeNotPending() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.ACCEPTED); // already accepted

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));

        assertThatThrownBy(() -> exchangeService.cancelExchange(50L, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only pending exchanges can be cancelled");
    }

    @Test
    @DisplayName("Should set providerConfirmed and keep status SCHEDULED on first confirmation")
    void shouldSetProviderConfirmedAndKeepStatusScheduled() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.SCHEDULED);

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));
        when(exchangeRequestRepository.save(any(ExchangeRequest.class))).thenAnswer(i -> i.getArgument(0));

        ExchangeDto result = exchangeService.confirmCompletion(50L, 2L); // 2L is provider

        assertThat(result.getProviderConfirmed()).isTrue();
        assertThat(result.getRequesterConfirmed()).isFalse();
        assertThat(result.getStatus()).isEqualTo(ExchangeStatus.SCHEDULED);
        verify(bookingRepository, never()).findByExchangeRequestIdAndStatus(anyLong(), any());
    }

    @Test
    @DisplayName("Should transition status to COMPLETED and update booking when second confirmation received")
    void shouldTransitionToCompletedWhenBothConfirm() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.SCHEDULED);
        exchange.setProviderConfirmed(true);

        com.skillswap.platform.booking.entity.Booking booking = new com.skillswap.platform.booking.entity.Booking(
                exchange, java.time.Instant.now(), java.time.Instant.now().plusSeconds(3600), com.skillswap.platform.booking.entity.BookingStatus.SCHEDULED
        );

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));
        when(exchangeRequestRepository.save(any(ExchangeRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(bookingRepository.findByExchangeRequestIdAndStatus(50L, com.skillswap.platform.booking.entity.BookingStatus.SCHEDULED))
                .thenReturn(Optional.of(booking));

        ExchangeDto result = exchangeService.confirmCompletion(50L, 1L); // 1L is requester

        assertThat(result.getProviderConfirmed()).isTrue();
        assertThat(result.getRequesterConfirmed()).isTrue();
        assertThat(result.getStatus()).isEqualTo(ExchangeStatus.COMPLETED);
        assertThat(booking.getStatus()).isEqualTo(com.skillswap.platform.booking.entity.BookingStatus.COMPLETED);
        verify(bookingRepository, times(1)).save(booking);
        verify(walletService, times(1)).settleExchange(exchange);
    }

    @Test
    @DisplayName("Should forbid non-participant from confirming completion")
    void shouldForbidNonParticipantFromConfirmingCompletion() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.SCHEDULED);

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));

        assertThatThrownBy(() -> exchangeService.confirmCompletion(50L, 999L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only exchange participants can confirm completion");
    }

    @Test
    @DisplayName("Should reject completion confirmation when status is not SCHEDULED or ACCEPTED")
    void shouldRejectCompletionWhenStatusInvalid() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.PENDING);

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));

        assertThatThrownBy(() -> exchangeService.confirmCompletion(50L, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot confirm completion for exchange with status");
    }

    @Test
    @DisplayName("Should transition status to DISPUTED and cancel active booking when dispute filed")
    void shouldTransitionToDisputedAndCancelBooking() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.SCHEDULED);

        com.skillswap.platform.booking.entity.Booking booking = new com.skillswap.platform.booking.entity.Booking(
                exchange, java.time.Instant.now(), java.time.Instant.now().plusSeconds(3600), com.skillswap.platform.booking.entity.BookingStatus.SCHEDULED
        );

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));
        when(exchangeRequestRepository.save(any(ExchangeRequest.class))).thenAnswer(i -> i.getArgument(0));
        when(bookingRepository.findByExchangeRequestIdAndStatus(50L, com.skillswap.platform.booking.entity.BookingStatus.SCHEDULED))
                .thenReturn(Optional.of(booking));

        ExchangeDto result = exchangeService.disputeExchange(50L, 1L, "Provider never showed up");

        assertThat(result.getStatus()).isEqualTo(ExchangeStatus.DISPUTED);
        assertThat(result.getDisputeReason()).isEqualTo("Provider never showed up");
        assertThat(result.getDisputedById()).isEqualTo(1L);
        assertThat(result.getDisputedAt()).isNotNull();
        assertThat(booking.getStatus()).isEqualTo(com.skillswap.platform.booking.entity.BookingStatus.CANCELLED);
        verify(bookingRepository, times(1)).save(booking);
    }

    @Test
    @DisplayName("Should reject dispute when reason is empty")
    void shouldRejectDisputeWhenReasonEmpty() {
        assertThatThrownBy(() -> exchangeService.disputeExchange(50L, 1L, "  "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Dispute reason is required");
    }

    @Test
    @DisplayName("Should reject dispute when exchange is already completed")
    void shouldRejectDisputeWhenAlreadyCompleted() {
        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, new BigDecimal("1.00"), "Notes");
        exchange.setId(50L);
        exchange.setStatus(ExchangeStatus.COMPLETED);

        when(exchangeRequestRepository.findById(50L)).thenReturn(Optional.of(exchange));

        assertThatThrownBy(() -> exchangeService.disputeExchange(50L, 1L, "Too late"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot dispute exchange with status: COMPLETED");
    }
}
