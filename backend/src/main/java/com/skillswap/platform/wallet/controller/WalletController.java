package com.skillswap.platform.wallet.controller;

import com.skillswap.platform.auth.security.UserPrincipal;
import com.skillswap.platform.wallet.dto.CreditTransactionDto;
import com.skillswap.platform.wallet.dto.WalletSummaryDto;
import com.skillswap.platform.wallet.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/me")
    public ResponseEntity<WalletSummaryDto> getWalletSummary(@AuthenticationPrincipal UserPrincipal principal) {
        WalletSummaryDto summary = walletService.getWalletSummary(principal.id());
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<CreditTransactionDto>> getTransactionHistory(@AuthenticationPrincipal UserPrincipal principal) {
        List<CreditTransactionDto> history = walletService.getTransactionHistory(principal.id());
        return ResponseEntity.ok(history);
    }
}
