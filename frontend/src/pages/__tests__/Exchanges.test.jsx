import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Exchanges from '../Exchanges';
import exchangeService from '../../services/exchangeService';

vi.mock('../../services/exchangeService', () => ({
  default: {
    getIncomingExchanges: vi.fn(),
    getOutgoingExchanges: vi.fn(),
    acceptExchange: vi.fn(),
    rejectExchange: vi.fn(),
    cancelExchange: vi.fn(),
  },
  exchangeService: {
    getIncomingExchanges: vi.fn(),
    getOutgoingExchanges: vi.fn(),
    acceptExchange: vi.fn(),
    rejectExchange: vi.fn(),
    cancelExchange: vi.fn(),
  },
}));

const mockIncomingExchanges = [
  {
    id: 101,
    requesterId: 1,
    requesterName: 'Alice Green',
    requesterLocation: 'Seattle, WA',
    providerId: 2,
    providerName: 'Bob Vance',
    skillId: 10,
    skillName: 'Python Programming',
    skillCategory: 'Technology',
    duration: 1.5,
    status: 'PENDING',
    notes: 'Need help with decorators',
    createdAt: '2026-10-04T12:00:00Z',
  },
];

const mockOutgoingExchanges = [
  {
    id: 202,
    requesterId: 2,
    requesterName: 'Bob Vance',
    providerId: 3,
    providerName: 'Charlie Miller',
    providerLocation: 'Portland, OR',
    skillId: 20,
    skillName: 'Spanish Conversation',
    skillCategory: 'Languages',
    duration: 2.0,
    status: 'PENDING',
    notes: 'Planning trip to Madrid',
    createdAt: '2026-10-04T13:00:00Z',
  },
];

describe('Exchanges Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders incoming exchanges by default on mount', async () => {
    exchangeService.getIncomingExchanges.mockResolvedValue(mockIncomingExchanges);

    render(
      <BrowserRouter>
        <Exchanges />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /manage exchange requests/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice Green')).toBeInTheDocument();
      expect(screen.getByText('Python Programming')).toBeInTheDocument();
      expect(screen.getByText(/1\.5 Hours/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /accept request/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^decline$/i })).toBeInTheDocument();
    });

    expect(exchangeService.getIncomingExchanges).toHaveBeenCalledWith('ALL');
  });

  it('switches to Outgoing tab and fetches outgoing exchanges', async () => {
    exchangeService.getIncomingExchanges.mockResolvedValue(mockIncomingExchanges);
    exchangeService.getOutgoingExchanges.mockResolvedValue(mockOutgoingExchanges);

    render(
      <BrowserRouter>
        <Exchanges />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Green')).toBeInTheDocument();
    });

    // Click Outgoing Requests tab
    const outgoingTabBtn = screen.getByRole('button', { name: /outgoing requests/i });
    fireEvent.click(outgoingTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Charlie Miller')).toBeInTheDocument();
      expect(screen.getByText('Spanish Conversation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel request/i })).toBeInTheDocument();
    });

    expect(exchangeService.getOutgoingExchanges).toHaveBeenCalledWith('ALL');
  });

  it('filters requests when status filter chip is clicked', async () => {
    exchangeService.getIncomingExchanges.mockResolvedValue(mockIncomingExchanges);

    render(
      <BrowserRouter>
        <Exchanges />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Green')).toBeInTheDocument();
    });

    // Click 'Pending' filter chip
    const pendingChip = screen.getByRole('button', { name: 'Pending' });
    fireEvent.click(pendingChip);

    await waitFor(() => {
      expect(exchangeService.getIncomingExchanges).toHaveBeenCalledWith('PENDING');
    });
  });

  it('renders rich empty state when no exchanges exist for active tab', async () => {
    exchangeService.getIncomingExchanges.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <Exchanges />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('exchanges-empty')).toBeInTheDocument();
      expect(screen.getByText(/no incoming requests found/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /add skills to teach/i })).toBeInTheDocument();
    });
  });
});
