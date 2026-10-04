package com.skillswap.platform.exchange.service;

import com.skillswap.platform.booking.entity.BookingStatus;
import com.skillswap.platform.booking.repository.BookingRepository;
import com.skillswap.platform.exchange.dto.CreateExchangeRequest;
import com.skillswap.platform.exchange.dto.ExchangeDto;
import com.skillswap.platform.exchange.entity.ExchangeRequest;
import com.skillswap.platform.exchange.entity.ExchangeStatus;
import com.skillswap.platform.exchange.repository.ExchangeRequestRepository;
import com.skillswap.platform.profile.repository.UserSkillRepository;
import com.skillswap.platform.skill.entity.Skill;
import com.skillswap.platform.skill.repository.SkillRepository;
import com.skillswap.platform.user.entity.User;
import com.skillswap.platform.user.repository.UserRepository;
import com.skillswap.platform.wallet.entity.Wallet;
import com.skillswap.platform.wallet.repository.WalletRepository;
import com.skillswap.platform.wallet.service.WalletService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExchangeService {

    private final ExchangeRequestRepository exchangeRequestRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final WalletRepository walletRepository;
    private final BookingRepository bookingRepository;
    private final WalletService walletService;

    public ExchangeService(
            ExchangeRequestRepository exchangeRequestRepository,
            UserRepository userRepository,
            SkillRepository skillRepository,
            UserSkillRepository userSkillRepository,
            WalletRepository walletRepository,
            BookingRepository bookingRepository,
            WalletService walletService
    ) {
        this.exchangeRequestRepository = exchangeRequestRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.walletRepository = walletRepository;
        this.bookingRepository = bookingRepository;
        this.walletService = walletService;
    }

    public ExchangeDto createExchangeRequest(Long requesterId, CreateExchangeRequest request) {
        if (Objects.equals(requesterId, request.getProviderId())) {
            throw new IllegalArgumentException("You cannot request an exchange with yourself");
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Requester not found with ID: " + requesterId));

        User provider = userRepository.findById(request.getProviderId())
                .orElseThrow(() -> new IllegalArgumentException("Provider not found with ID: " + request.getProviderId()));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new IllegalArgumentException("Skill not found with ID: " + request.getSkillId()));

        boolean providerOffersSkill = userSkillRepository.existsByUserIdAndSkillIdAndType(
                request.getProviderId(), request.getSkillId(), "OFFERED"
        );
        if (!providerOffersSkill) {
            throw new IllegalArgumentException("Provider does not offer the requested skill");
        }

        Wallet wallet = walletRepository.findByUserId(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for requester: " + requesterId));

        BigDecimal requestedDuration = request.getDuration() != null ? request.getDuration() : new BigDecimal("1.00");
        if (wallet.getBalance().compareTo(requestedDuration) < 0) {
            throw new IllegalArgumentException("Insufficient wallet balance for this exchange request (balance: "
                    + wallet.getBalance() + ", required: " + requestedDuration + ")");
        }

        ExchangeRequest exchange = new ExchangeRequest(requester, provider, skill, requestedDuration, request.getNotes());
        ExchangeRequest saved = exchangeRequestRepository.save(exchange);

        return ExchangeDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ExchangeDto> getIncomingExchanges(Long providerId, ExchangeStatus status) {
        List<ExchangeRequest> list;
        if (status != null) {
            list = exchangeRequestRepository.findByProviderIdAndStatusOrderByCreatedAtDesc(providerId, status);
        } else {
            list = exchangeRequestRepository.findByProviderIdOrderByCreatedAtDesc(providerId);
        }
        return list.stream().map(ExchangeDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExchangeDto> getOutgoingExchanges(Long requesterId, ExchangeStatus status) {
        List<ExchangeRequest> list;
        if (status != null) {
            list = exchangeRequestRepository.findByRequesterIdAndStatusOrderByCreatedAtDesc(requesterId, status);
        } else {
            list = exchangeRequestRepository.findByRequesterIdOrderByCreatedAtDesc(requesterId);
        }
        return list.stream().map(ExchangeDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExchangeDto getExchangeById(Long exchangeId, Long currentUserId) {
        ExchangeRequest exchange = exchangeRequestRepository.findById(exchangeId)
                .orElseThrow(() -> new IllegalArgumentException("Exchange not found: " + exchangeId));

        boolean isRequester = Objects.equals(exchange.getRequester().getId(), currentUserId);
        boolean isProvider = Objects.equals(exchange.getProvider().getId(), currentUserId);
        if (!isRequester && !isProvider) {
            throw new AccessDeniedException("You are not authorized to view this exchange");
        }

        return ExchangeDto.fromEntity(exchange);
    }

    public ExchangeDto acceptExchange(Long exchangeId, Long currentUserId) {
        ExchangeRequest exchange = exchangeRequestRepository.findById(exchangeId)
                .orElseThrow(() -> new IllegalArgumentException("Exchange not found: " + exchangeId));

        if (exchange.getStatus() != ExchangeStatus.PENDING) {
            throw new IllegalStateException("Only pending exchanges can be accepted. Current status: " + exchange.getStatus());
        }

        if (!Objects.equals(exchange.getProvider().getId(), currentUserId)) {
            throw new AccessDeniedException("Only the designated provider can accept this exchange");
        }

        exchange.setStatus(ExchangeStatus.ACCEPTED);
        ExchangeRequest updated = exchangeRequestRepository.save(exchange);
        return ExchangeDto.fromEntity(updated);
    }

    public ExchangeDto rejectExchange(Long exchangeId, Long currentUserId) {
        ExchangeRequest exchange = exchangeRequestRepository.findById(exchangeId)
                .orElseThrow(() -> new IllegalArgumentException("Exchange not found: " + exchangeId));

        if (exchange.getStatus() != ExchangeStatus.PENDING) {
            throw new IllegalStateException("Only pending exchanges can be rejected. Current status: " + exchange.getStatus());
        }

        if (!Objects.equals(exchange.getProvider().getId(), currentUserId)) {
            throw new AccessDeniedException("Only the designated provider can reject this exchange");
        }

        exchange.setStatus(ExchangeStatus.REJECTED);
        ExchangeRequest updated = exchangeRequestRepository.save(exchange);
        return ExchangeDto.fromEntity(updated);
    }

    public ExchangeDto cancelExchange(Long exchangeId, Long currentUserId) {
        ExchangeRequest exchange = exchangeRequestRepository.findById(exchangeId)
                .orElseThrow(() -> new IllegalArgumentException("Exchange not found: " + exchangeId));

        if (exchange.getStatus() != ExchangeStatus.PENDING) {
            throw new IllegalStateException("Only pending exchanges can be cancelled. Current status: " + exchange.getStatus());
        }

        if (!Objects.equals(exchange.getRequester().getId(), currentUserId)) {
            throw new AccessDeniedException("Only the requester can cancel this exchange");
        }

        exchange.setStatus(ExchangeStatus.CANCELLED);
        ExchangeRequest updated = exchangeRequestRepository.save(exchange);
        return ExchangeDto.fromEntity(updated);
    }

    public ExchangeDto confirmCompletion(Long exchangeId, Long currentUserId) {
        ExchangeRequest exchange = exchangeRequestRepository.findById(exchangeId)
                .orElseThrow(() -> new IllegalArgumentException("Exchange not found: " + exchangeId));

        boolean isRequester = Objects.equals(exchange.getRequester().getId(), currentUserId);
        boolean isProvider = Objects.equals(exchange.getProvider().getId(), currentUserId);
        if (!isRequester && !isProvider) {
            throw new AccessDeniedException("Only exchange participants can confirm completion");
        }

        if (exchange.getStatus() != ExchangeStatus.SCHEDULED && exchange.getStatus() != ExchangeStatus.ACCEPTED) {
            throw new IllegalStateException("Cannot confirm completion for exchange with status: " + exchange.getStatus());
        }

        Instant now = Instant.now();
        if (isProvider) {
            exchange.setProviderConfirmed(true);
            if (exchange.getProviderConfirmedAt() == null) {
                exchange.setProviderConfirmedAt(now);
            }
        }
        if (isRequester) {
            exchange.setRequesterConfirmed(true);
            if (exchange.getRequesterConfirmedAt() == null) {
                exchange.setRequesterConfirmedAt(now);
            }
        }

        if (exchange.isProviderConfirmed() && exchange.isRequesterConfirmed()) {
            exchange.setStatus(ExchangeStatus.COMPLETED);
            bookingRepository.findByExchangeRequestIdAndStatus(exchangeId, BookingStatus.SCHEDULED)
                    .ifPresent(booking -> {
                        booking.setStatus(BookingStatus.COMPLETED);
                        bookingRepository.save(booking);
                    });
            walletService.settleExchange(exchange);
        }

        ExchangeRequest updated = exchangeRequestRepository.save(exchange);
        return ExchangeDto.fromEntity(updated);
    }

    public ExchangeDto disputeExchange(Long exchangeId, Long currentUserId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Dispute reason is required");
        }

        ExchangeRequest exchange = exchangeRequestRepository.findById(exchangeId)
                .orElseThrow(() -> new IllegalArgumentException("Exchange not found: " + exchangeId));

        boolean isRequester = Objects.equals(exchange.getRequester().getId(), currentUserId);
        boolean isProvider = Objects.equals(exchange.getProvider().getId(), currentUserId);
        if (!isRequester && !isProvider) {
            throw new AccessDeniedException("Only exchange participants can dispute this exchange");
        }

        if (exchange.getStatus() == ExchangeStatus.COMPLETED ||
            exchange.getStatus() == ExchangeStatus.CANCELLED ||
            exchange.getStatus() == ExchangeStatus.REJECTED) {
            throw new IllegalStateException("Cannot dispute exchange with status: " + exchange.getStatus());
        }

        User disputingUser = isRequester ? exchange.getRequester() : exchange.getProvider();
        exchange.setStatus(ExchangeStatus.DISPUTED);
        exchange.setDisputeReason(reason.trim());
        exchange.setDisputedBy(disputingUser);
        exchange.setDisputedAt(Instant.now());

        bookingRepository.findByExchangeRequestIdAndStatus(exchangeId, BookingStatus.SCHEDULED)
                .ifPresent(booking -> {
                    booking.setStatus(BookingStatus.CANCELLED);
                    bookingRepository.save(booking);
                });

        ExchangeRequest updated = exchangeRequestRepository.save(exchange);
        return ExchangeDto.fromEntity(updated);
    }
}
