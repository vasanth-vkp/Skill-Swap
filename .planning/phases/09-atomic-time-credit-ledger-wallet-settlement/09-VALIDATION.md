---
phase: "9"
slug: "atomic-time-credit-ledger-wallet-settlement"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-04"
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Backend Framework** | JUnit 5 + MockMvc + Mockito (Spring Boot 3 Test) |
| **Frontend Framework** | Vitest + React Testing Library |
| **Config files** | `backend/pom.xml`, `frontend/vite.config.js` |
| **Quick run command (Backend)** | `mvn -f backend/pom.xml test -Dtest=WalletServiceTest,WalletControllerTest,ExchangeServiceTest` |
| **Quick run command (Frontend)** | `npm --prefix frontend test -- Wallet.test.jsx` |
| **Full suite command** | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run` |
| **Estimated runtime** | ~35 seconds |

---

## Sampling Rate

- **After every task commit:** Run corresponding quick run command
- **After plan execution:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | WALL-02, WALL-03, WALL-04 | T-09-01, T-09-02 | Backend performs atomic credit transfer on completion and prevents double settlement | unit/integration | `mvn -f backend/pom.xml test -Dtest=WalletServiceTest,WalletControllerTest,ExchangeServiceTest` | ❌ W0 | ⏳ pending |
| 09-01-02 | 01 | 1 | WALL-05 | T-09-03 | Backend provides wallet summary and transaction history endpoints with auth check | unit/integration | `mvn -f backend/pom.xml test -Dtest=WalletControllerTest` | ❌ W0 | ⏳ pending |
| 09-02-01 | 02 | 1 | WALL-05 | T-09-04 | Frontend Wallet page displays balance cards, stats, filterable ledger, and empty states | unit/component | `npm --prefix frontend test -- Wallet.test.jsx` | ❌ W0 | ⏳ pending |
| 09-02-02 | 02 | 1 | WALL-02, WALL-05 | T-09-05 | Navigation routes, Navbar wallet pill, and Dashboard wallet links work cleanly across full stack | e2e/regression | `mvn -f backend/pom.xml test && npm --prefix frontend test -- --run && npm --prefix frontend run build` | ✅ Yes | ⏳ pending |

---

## Threat Model

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-09-01 | Tampering | WalletService | high | mitigate | Server-enforced ACID transfer within @Transactional boundary; clients cannot directly edit balance |
| T-09-02 | Repudiation | CreditTransactionRepository | high | mitigate | Immutable audit ledger records every transfer with sender, receiver, amount, and timestamp |
| T-09-03 | Information Disclosure | WalletController | med | mitigate | Authenticated user can only view their own wallet summary and transaction history |
| T-09-04 | Tampering | WalletService | high | mitigate | Idempotency guard prevents duplicate settlement if completion is called multiple times |
| T-09-05 | Tampering | Wallet | high | mitigate | Negative balances prevented by pre-deduction check and database check constraint |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Wallet Ledger Visual Audit | WALL-05 | Visual check of credit inflow/outflow badges and tabs | Open `/wallet` page -> verify 5.0 initial grant is displayed with green +5.0 badge -> confirm tabs filter earned and spent accurately. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-04
