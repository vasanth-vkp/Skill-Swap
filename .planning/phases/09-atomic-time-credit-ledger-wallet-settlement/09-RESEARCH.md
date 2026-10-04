# Phase 9 Research: Atomic Time-Credit Ledger & Wallet Settlement

## Domain & Infrastructure Analysis

### 1. Existing Wallet and Database Schema Baseline
- In `V1__init_schema.sql`:
  - `wallets` table already enforces `chk_wallet_balance_positive CHECK (balance >= 0)`.
  - `credit_transactions` table is pre-created with:
    - `id BIGSERIAL PRIMARY KEY`
    - `exchange_id BIGINT REFERENCES exchange_requests(id)`
    - `sender_id BIGINT REFERENCES users(id)`
    - `receiver_id BIGINT NOT NULL REFERENCES users(id)`
    - `amount NUMERIC(10, 2) NOT NULL`
    - `type VARCHAR(50) NOT NULL`
    - `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`
- In `Wallet.java`:
  - Standard entity with `userId`, `balance` (`BigDecimal`), `updatedAt` (`Instant`).
- In `WalletRepository.java`:
  - `Optional<Wallet> findByUserId(Long userId)`.

### 2. Transactional Settlement Lifecycle
- **Completion Trigger:**
  - `ExchangeService.confirmCompletion(exchangeId, currentUserId)` manages the dual-confirmation state machine.
  - When `exchange.isProviderConfirmed() && exchange.isRequesterConfirmed()` is reached, the status becomes `ExchangeStatus.COMPLETED`.
  - Settlement occurs immediately within this method boundary:
    ```java
    walletService.settleExchange(exchange);
    ```
  - Because `ExchangeService` is annotated with `@Transactional`, the exchange status update, booking completion, wallet deductions/additions, and credit transaction insertion all execute within a single atomic database transaction.
- **Credit Flow Invariant:**
  - Requester received the service, so requester pays time credits (`sender`).
  - Provider provided the service, so provider earns time credits (`receiver`).
  - Credits transferred: `exchange.getDuration()`.
  - 1 hour of service = 1 credit (e.g., 1.50 hours = 1.50 credits).

### 3. Idempotency & Solvency Protection
- **Duplicate Prevention:**
  - Query: `creditTransactionRepository.existsByExchangeId(exchange.getId())`.
  - If a transaction is already logged for this exchange ID, `settleExchange` logs a notice and returns early, preventing accidental double payment if duplicate calls occur.
- **Negative Balance Safeguard:**
  - Java validation: Check if `requesterWallet.getBalance().compareTo(amount) < 0`. If so, throw `IllegalStateException("Requester has insufficient balance for settlement")`.
  - Database constraint: `chk_wallet_balance_positive` ensures the database level will refuse any update resulting in a negative balance.

### 4. Summary & Ledger Query Optimizations
- **Summary Metrics (`WalletSummaryDto`):**
  - Current balance from `WalletRepository.findByUserId(userId)`.
  - `totalEarned`: Sum of `amount` from `credit_transactions` where `receiver_id = userId` and `type = 'EXCHANGE_TRANSFER'`.
  - `totalSpent`: Sum of `amount` from `credit_transactions` where `sender_id = userId` and `type = 'EXCHANGE_TRANSFER'`.
  - `completedExchangesCount`: Count of `credit_transactions` where `(receiver_id = userId OR sender_id = userId)` and `type = 'EXCHANGE_TRANSFER'`.
- **Transaction History (`CreditTransactionDto`):**
  - Query: `findBySenderIdOrReceiverIdOrderByCreatedAtDesc(userId, userId)`.
  - DTO resolves counterparty:
    - If `sender == null`: Counterparty is "SkillSwap Welcome Grant", direction is `INITIAL_GRANT`.
    - If `receiver.getId() == userId`: Counterparty is sender name, direction is `EARNED` (`+amount`).
    - If `sender.getId() == userId`: Counterparty is receiver name, direction is `SPENT` (`-amount`).
  - Skill title is derived from `exchange.getSkill().getName()` (or fallback to "Skill Exchange").

### 5. Frontend UI/UX Architecture
- **Page Layout (`frontend/src/pages/Wallet.jsx`):**
  - Header: Time-credit philosophy reminder ("Every hour of service is valued equally at 1 credit").
  - Stats Cards:
    - Balance Card: Amber/gold gradient, large balance display, sync status.
    - Total Earned Card: Emerald theme, upward inflow trend, total hours earned.
    - Total Spent Card: Rose theme, outflow indicator, total hours spent.
    - Completed Exchanges: Indigo theme, total count.
  - Transactions Ledger:
    - Filter tabs: `All` | `Earned` | `Spent`.
    - Search input: Filter by partner name or skill title.
    - Table / Card view: Shows date, partner name, skill badge, type badge, and credit amount with color-coded +/- signs.
    - Empty states: Distinct friendly messages when no transactions are recorded yet.
  - Navigation:
    - Route registered in `App.jsx` as `/wallet`.
    - `Navbar.jsx` balance pill made clickable (`<Link to="/wallet">`).
    - "Wallet" link in desktop/mobile navigation menu.
    - `Dashboard.jsx` balance card includes link to `/wallet`.

---

## Plan Decomposition

- **Plan 09-01 (Backend):**
  - Entity `CreditTransaction.java` and repository `CreditTransactionRepository.java`.
  - DTOs `WalletSummaryDto.java` and `CreditTransactionDto.java`.
  - Service `WalletService.java`: `settleExchange`, `getWalletSummary`, `getTransactionHistory`, `recordInitialGrant`.
  - Wire initial grant in `AuthService.java` on user registration.
  - Wire settlement in `ExchangeService.java` on dual completion confirmation.
  - Controller `WalletController.java` (`GET /api/v1/wallet/me`, `GET /api/v1/wallet/transactions`).
  - Unit and integration tests (`WalletServiceTest.java`, `WalletControllerTest.java`, `ExchangeServiceTest.java`).

- **Plan 09-02 (Frontend):**
  - `walletService.js` client module.
  - `Wallet.jsx` full page component with summary stats, filterable ledger, search, and responsive layout.
  - Update `App.jsx` with `/wallet` route under `ProtectedRoute`.
  - Update `Navbar.jsx` with clickable wallet pill and wallet nav item.
  - Update `Dashboard.jsx` with direct wallet navigation.
  - Unit tests (`Wallet.test.jsx`).
  - Full regression test run across backend Maven and frontend Vitest suites, plus production Vite build.
