import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Wallet from '../Wallet.jsx';
import walletService from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../services/walletService', () => ({
  default: {
    getWalletSummary: vi.fn(),
    getTransactionHistory: vi.fn(),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockSummary = {
  balance: 5.5,
  totalEarned: 3.0,
  totalSpent: 2.5,
  completedExchangesCount: 2,
};

const mockTransactions = [
  {
    id: 1,
    exchangeId: 101,
    amount: 2.0,
    type: 'EXCHANGE_TRANSFER',
    direction: 'EARNED',
    counterpartyName: 'Alice Developer',
    counterpartyId: 2,
    skillTitle: 'React Fundamentals',
    createdAt: '2026-10-04T12:00:00Z',
  },
  {
    id: 2,
    exchangeId: 102,
    amount: 1.5,
    type: 'EXCHANGE_TRANSFER',
    direction: 'SPENT',
    counterpartyName: 'Bob Tutor',
    counterpartyId: 3,
    skillTitle: 'Spanish Conversation',
    createdAt: '2026-10-03T15:30:00Z',
  },
  {
    id: 3,
    exchangeId: null,
    amount: 5.0,
    type: 'INITIAL_GRANT',
    direction: 'INITIAL_GRANT',
    counterpartyName: 'SkillSwap Platform',
    counterpartyId: null,
    skillTitle: 'Platform Welcome Grant',
    createdAt: '2026-10-01T09:00:00Z',
  },
];

describe('Wallet Page Component', () => {
  const mockSetWalletBalance = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      walletBalance: 5.5,
      setWalletBalance: mockSetWalletBalance,
    });
    walletService.getWalletSummary.mockResolvedValue(mockSummary);
    walletService.getTransactionHistory.mockResolvedValue(mockTransactions);
  });

  it('renders wallet balance, earned credits, spent credits, and syncs auth context', async () => {
    render(
      <MemoryRouter>
        <Wallet />
      </MemoryRouter>
    );

    // Initial loading or loaded balance
    await waitFor(() => {
      expect(screen.getByText('5.5')).toBeInTheDocument();
    });

    expect(screen.getByText('+3.0')).toBeInTheDocument();
    expect(screen.getByText('-2.5')).toBeInTheDocument();
    expect(screen.getByText('Time-Credit Wallet')).toBeInTheDocument();
    expect(mockSetWalletBalance).toHaveBeenCalledWith(5.5);
  });

  it('renders all transactions in the ledger with proper badges and amounts', async () => {
    render(
      <MemoryRouter>
        <Wallet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });

    expect(screen.getByText('Spanish Conversation')).toBeInTheDocument();
    expect(screen.getByText('Platform Welcome Grant')).toBeInTheDocument();

    expect(screen.getByText('+2.0 Credits')).toBeInTheDocument();
    expect(screen.getByText('-1.5 Credits')).toBeInTheDocument();
    expect(screen.getByText('+5.0 Credits')).toBeInTheDocument();

    expect(screen.getByText('Service Provided')).toBeInTheDocument();
    expect(screen.getByText('Service Received')).toBeInTheDocument();
    expect(screen.getByText('Welcome Grant')).toBeInTheDocument();
  });

  it('filters to only earned and grant transactions when Earned tab is clicked', async () => {
    render(
      <MemoryRouter>
        <Wallet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });

    // Click Earned tab
    const earnedTab = screen.getByRole('button', { name: /Earned \(2\)/i });
    fireEvent.click(earnedTab);

    // Earned items visible
    expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Platform Welcome Grant')).toBeInTheDocument();

    // Spent item hidden
    expect(screen.queryByText('Spanish Conversation')).not.toBeInTheDocument();
  });

  it('filters to only spent transactions when Spent tab is clicked', async () => {
    render(
      <MemoryRouter>
        <Wallet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });

    // Click Spent tab
    const spentTab = screen.getByRole('button', { name: /Spent \(1\)/i });
    fireEvent.click(spentTab);

    // Spent item visible
    expect(screen.getByText('Spanish Conversation')).toBeInTheDocument();

    // Earned items hidden
    expect(screen.queryByText('React Fundamentals')).not.toBeInTheDocument();
    expect(screen.queryByText('Platform Welcome Grant')).not.toBeInTheDocument();
  });

  it('filters transactions dynamically by search input query', async () => {
    render(
      <MemoryRouter>
        <Wallet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Filter by skill or user/i);
    fireEvent.change(searchInput, { target: { value: 'spanish' } });

    expect(screen.getByText('Spanish Conversation')).toBeInTheDocument();
    expect(screen.queryByText('React Fundamentals')).not.toBeInTheDocument();
  });

  it('renders friendly empty state when no transactions exist', async () => {
    walletService.getTransactionHistory.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <Wallet />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No transactions logged yet')).toBeInTheDocument();
    });

    expect(screen.getByText(/Explore Available Skills/i)).toBeInTheDocument();
  });
});
