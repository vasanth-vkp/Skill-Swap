package com.skillswap.platform.exchange.controller;

import com.skillswap.platform.auth.security.UserPrincipal;
import com.skillswap.platform.exchange.dto.CreateExchangeRequest;
import com.skillswap.platform.exchange.dto.ExchangeDto;
import com.skillswap.platform.exchange.entity.ExchangeStatus;
import com.skillswap.platform.exchange.service.ExchangeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/exchanges")
public class ExchangeController {

    private final ExchangeService exchangeService;

    public ExchangeController(ExchangeService exchangeService) {
        this.exchangeService = exchangeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ExchangeDto> createExchange(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateExchangeRequest request
    ) {
        ExchangeDto dto = exchangeService.createExchangeRequest(principal.id(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/incoming")
    public ResponseEntity<List<ExchangeDto>> getIncomingExchanges(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) ExchangeStatus status
    ) {
        List<ExchangeDto> list = exchangeService.getIncomingExchanges(principal.id(), status);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/outgoing")
    public ResponseEntity<List<ExchangeDto>> getOutgoingExchanges(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) ExchangeStatus status
    ) {
        List<ExchangeDto> list = exchangeService.getOutgoingExchanges(principal.id(), status);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExchangeDto> getExchangeById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        ExchangeDto dto = exchangeService.getExchangeById(id, principal.id());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ExchangeDto> acceptExchange(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        ExchangeDto dto = exchangeService.acceptExchange(id, principal.id());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ExchangeDto> rejectExchange(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        ExchangeDto dto = exchangeService.rejectExchange(id, principal.id());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ExchangeDto> cancelExchange(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        ExchangeDto dto = exchangeService.cancelExchange(id, principal.id());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ExchangeDto> completeExchange(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        ExchangeDto dto = exchangeService.confirmCompletion(id, principal.id());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{id}/dispute")
    public ResponseEntity<ExchangeDto> disputeExchange(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody com.skillswap.platform.exchange.dto.DisputeRequest request
    ) {
        ExchangeDto dto = exchangeService.disputeExchange(id, principal.id(), request.getReason());
        return ResponseEntity.ok(dto);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
    }
}
