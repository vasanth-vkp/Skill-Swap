# Phase 9: User Acceptance Testing (UAT)

## Overview
Phase 9 delivers the server-enforced atomic time-credit ledger and member wallet dashboard.

---

## Test Scenarios

### UAT-09-01: Live Balance & Welcome Grant Audit
- **Scenario:** New user registers on SkillSwap.
- **Expected Outcome:**
  1. Wallet balance defaults to `5.0 Credits`.
  2. Clicking the balance pill in the Navbar or navigating to `/wallet` displays the Time-Credit Wallet page.
  3. The hero balance card displays `5.0 Credits` with "1 Credit = 1 Hour" badge.
  4. The transaction ledger contains an `INITIAL_GRANT` transaction titled "Platform Welcome Grant" with a `+5.0 Credits` green badge.
- **Result:** **PASSED** (Verified via `WalletControllerTest.shouldReturnTransactionLedger` and `Wallet.test.jsx`).

### UAT-09-02: Atomic Settlement upon Dual Confirmation
- **Scenario:** Alice and Bob have an accepted 1.5-hour exchange. Both parties confirm completion.
- **Expected Outcome:**
  1. When both participants confirm completion, exchange status becomes `COMPLETED`.
  2. In the same database transaction, 1.5 credits are deducted from requester's wallet and credited to provider's wallet.
  3. An immutable transaction row (`type = 'EXCHANGE_TRANSFER'`, `amount = 1.50`) is recorded.
- **Result:** **PASSED** (Verified via `ExchangeServiceTest.shouldTransitionToCompletedWhenBothConfirm` and `WalletServiceTest.shouldSettleExchangeAtomically`).

### UAT-09-03: Duplicate Settlement Protection (Idempotency)
- **Scenario:** System or participant triggers completion processing a second time on an already settled exchange.
- **Expected Outcome:**
  1. Idempotency guard detects existing transaction for `exchangeId`.
  2. No duplicate deduction or credit addition occurs.
- **Result:** **PASSED** (Verified via `WalletServiceTest.shouldBeIdempotentWhenAlreadySettled`).

### UAT-09-04: Insufficient Balance Rejection
- **Scenario:** Requester attempts to settle an exchange whose duration exceeds their current balance.
- **Expected Outcome:**
  1. Solvency check detects deficit and halts transfer with `IllegalStateException`.
  2. Balance is preserved and cannot fall below zero.
- **Result:** **PASSED** (Verified via `WalletServiceTest.shouldThrowWhenRequesterHasInsufficientBalance`).

### UAT-09-05: Member Wallet Dashboard, Search & Filter Tabs
- **Scenario:** User navigates to `/wallet` with multiple transactions.
- **Expected Outcome:**
  1. Hero card shows live credit balance.
  2. Earned card shows total hours earned from teaching; Spent card shows total hours spent learning.
  3. Clicking "Earned" tab displays only earned and grant transactions.
  4. Clicking "Spent" tab displays only spent transactions.
  5. Typing in the search input filters transactions by counterparty name or skill title in real-time.
- **Result:** **PASSED** (Verified via `Wallet.test.jsx`).
