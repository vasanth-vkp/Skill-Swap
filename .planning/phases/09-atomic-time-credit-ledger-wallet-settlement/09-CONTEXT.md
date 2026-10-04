# Phase 9 Context: Atomic Time-Credit Ledger & Wallet Settlement

## Goal
Execute atomic, server-enforced time-credit transfers (1 hour = 1 credit) upon completed exchanges, record immutable audit transaction ledger entries, prevent duplicate settlement and negative balances, and deliver a comprehensive Member Wallet dashboard with balance breakdown and transaction history.

## Requirements Covered
- **WALL-02**: System automatically executes an atomic transaction transferring credits (1 hour = 1 credit) from receiver to provider upon completion.
- **WALL-03**: System records every credit movement in an immutable audit ledger (`credit_transactions`).
- **WALL-04**: System prevents duplicate settlement and strictly enforces non-negative credit balances.
- **WALL-05**: User can view their current balance, total credits earned, total credits spent, and complete transaction history.

---

## Decisions Log

### D-901: Atomic ACID Settlement on Dual Confirmation
- **Decision:** When both participants confirm completion in `ExchangeService.confirmCompletion(exchangeId, currentUserId)` and the exchange state transitions to `COMPLETED`, `WalletService.settleExchange(exchange)` is executed within the **same active `@Transactional` boundary**.
- **Economic Invariant:**
  - 1 hour of service duration = 1.00 time credit.
  - The exchange requester (the party receiving the teaching/service) has `exchange.getDuration()` credits deducted from their wallet.
  - The exchange provider (the party delivering the skill) has `exchange.getDuration()` credits added to their wallet.
  - Any runtime exception or constraint failure automatically rolls back both balance modifications and the exchange status update.

### D-902: Immutable Audit Ledger Entity & Initial Grant Audit
- **Decision:**
  - Create JPA entity `CreditTransaction.java` and repository `CreditTransactionRepository.java` mapped to the existing `credit_transactions` table.
  - Fields: `id`, `exchange` (nullable `@ManyToOne ExchangeRequest`), `sender` (nullable `@ManyToOne User`), `receiver` (`@ManyToOne User`, non-null), `amount` (`BigDecimal`), `type` (`String`), `createdAt` (`Instant`).
  - Supported transaction types:
    - `EXCHANGE_TRANSFER`: Credits transferred for completed skill exchange.
    - `INITIAL_GRANT`: 5.00 platform welcome credit grant upon user registration.
  - In `AuthService.register`, when new users receive the initial 5.00 wallet credit, insert a `CreditTransaction` with `type = "INITIAL_GRANT"`, `sender = null`, `receiver = user`, `amount = 5.00` so every credit in circulation is fully audited from inception.

### D-903: Duplicate Settlement Prevention & Non-Negative Balance Enforcement
- **Decision:**
  - **Idempotency Guard:** `creditTransactionRepository.existsByExchangeId(exchange.getId())`. If a credit transaction already exists for this exchange, settlement returns early without duplicate transfer.
  - **Status Check:** Settlement only proceeds if exchange status is `COMPLETED` and hasn't already been settled.
  - **Solvency Check:** Requester wallet balance is checked before deduction (`requesterWallet.getBalance().compareTo(amount) >= 0`). If balance is insufficient, throws `IllegalStateException`.
  - **Database Constraint:** Relies additionally on database constraint `chk_wallet_balance_positive CHECK (balance >= 0)` on the `wallets` table.

### D-904: Wallet Summary & Transaction DTO Structure
- **Decision:**
  - `WalletSummaryDto`:
    - `balance`: `BigDecimal` (current wallet balance)
    - `totalEarned`: `BigDecimal` (sum of amounts where user is receiver and type is `EXCHANGE_TRANSFER`)
    - `totalSpent`: `BigDecimal` (sum of amounts where user is sender and type is `EXCHANGE_TRANSFER`)
    - `completedExchangesCount`: `long` (count of exchange transfers involving the user)
  - `CreditTransactionDto`:
    - `id`: `Long`
    - `exchangeId`: `Long`
    - `amount`: `BigDecimal`
    - `type`: `String`
    - `direction`: `"EARNED" | "SPENT" | "INITIAL_GRANT"`
    - `counterpartyName`: `String` (e.g. partner's full name, or "SkillSwap Welcome Grant")
    - `skillTitle`: `String` (e.g. "React Basics" or "Platform Grant")
    - `createdAt`: `Instant`
  - REST endpoints on `WalletController`:
    - `GET /api/v1/wallet/me`: Returns `WalletSummaryDto` for authenticated user.
    - `GET /api/v1/wallet/transactions`: Returns `List<CreditTransactionDto>` for authenticated user ordered by `createdAt DESC`.

### D-905: Frontend Time-Credit Wallet Page & Navigation Integration
- **Decision:**
  - Create dedicated page `frontend/src/pages/Wallet.jsx` mapped to route `/wallet`.
  - Visual hierarchy:
    - Balance Hero Card: Warm amber-to-coral gradient, current credit balance, hourly equivalent explanation ("1 credit = 1 hour of skill exchange").
    - Performance Stats Cards: Total Earned (emerald green with inflow indicator), Total Spent (rose/coral with outflow indicator), Exchanges Settled (indigo).
    - Transaction Ledger Card:
      - Filter Tabs: `All Transactions`, `Credits Earned`, `Credits Spent`.
      - Search bar for filtering by counterparty name or skill.
      - Rich list items displaying transaction date, counterparty, skill badge, transaction type, and formatted delta (`+1.5 credits` in emerald, `-1.0 credits` in rose).
      - Graceful empty states and skeleton loaders.
  - Navigation updates:
    - Navbar: Make the Wallet Balance pill clickable (`<Link to="/wallet">`), add "Wallet" link in navigation.
    - Dashboard: Add "View Wallet & History →" CTA link on the Wallet balance summary card.

---

## Technical Architecture & API Surface

### 1. Database Model
- Table `credit_transactions` (already defined in `V1__init_schema.sql`):
  - `id BIGSERIAL PRIMARY KEY`
  - `exchange_id BIGINT REFERENCES exchange_requests(id)`
  - `sender_id BIGINT REFERENCES users(id)`
  - `receiver_id BIGINT NOT NULL REFERENCES users(id)`
  - `amount NUMERIC(10, 2) NOT NULL`
  - `type VARCHAR(50) NOT NULL`
  - `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`

### 2. Backend Classes
- `com.skillswap.platform.wallet.entity.CreditTransaction`
- `com.skillswap.platform.wallet.repository.CreditTransactionRepository`
- `com.skillswap.platform.wallet.dto.WalletSummaryDto`
- `com.skillswap.platform.wallet.dto.CreditTransactionDto`
- `com.skillswap.platform.wallet.service.WalletService`
- `com.skillswap.platform.wallet.controller.WalletController`
- `ExchangeService.java` (wired to call `walletService.settleExchange(exchange)`)
- `AuthService.java` (wired to record initial grant `CreditTransaction`)

### 3. Frontend Components & Services
- `frontend/src/services/walletService.js`
- `frontend/src/pages/Wallet.jsx`
- `frontend/src/pages/__tests__/Wallet.test.jsx`
- `frontend/src/components/layout/Navbar.jsx` (clickable wallet link)
- `frontend/src/pages/Dashboard.jsx` (wallet CTA link)
- `frontend/src/App.jsx` (`/wallet` route registration)
