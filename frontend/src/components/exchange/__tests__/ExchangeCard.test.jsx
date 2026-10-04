import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ExchangeCard from '../ExchangeCard';

const mockExchange = {
  id: 10,
  requesterId: 1,
  requesterName: 'Alice Green',
  requesterAvatar: 'https://example.com/alice.jpg',
  requesterLocation: 'Seattle, WA',
  providerId: 2,
  providerName: 'Bob Vance',
  providerAvatar: 'https://example.com/bob.jpg',
  providerLocation: 'Portland, OR',
  skillId: 101,
  skillName: 'Python Programming',
  skillCategory: 'Technology',
  duration: 2.0,
  status: 'PENDING',
  notes: 'Would love to learn Flask basics',
  createdAt: '2026-10-04T12:00:00Z',
};

describe('ExchangeCard', () => {
  it('renders incoming exchange details with requester info and accept/decline buttons', () => {
    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={mockExchange}
          isIncoming={true}
          onAccept={vi.fn()}
          onReject={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Alice Green')).toBeInTheDocument();
    expect(screen.getByText('Seattle, WA')).toBeInTheDocument();
    expect(screen.getByText('Python Programming')).toBeInTheDocument();
    expect(screen.getByText('2.0 Hours (2.0 Credits)')).toBeInTheDocument();
    expect(screen.getByText('“Would love to learn Flask basics”')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /accept request/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
  });

  it('triggers onAccept when accept button is clicked on incoming card', async () => {
    const onAccept = vi.fn().mockResolvedValueOnce();

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={mockExchange}
          isIncoming={true}
          onAccept={onAccept}
        />
      </BrowserRouter>
    );

    const acceptBtn = screen.getByRole('button', { name: /accept request/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(onAccept).toHaveBeenCalledWith(10);
    });
  });

  it('triggers onReject when decline button is clicked on incoming card', async () => {
    const onReject = vi.fn().mockResolvedValueOnce();

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={mockExchange}
          isIncoming={true}
          onReject={onReject}
        />
      </BrowserRouter>
    );

    const declineBtn = screen.getByRole('button', { name: /decline/i });
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(onReject).toHaveBeenCalledWith(10);
    });
  });

  it('renders outgoing exchange details with provider info and cancel button', async () => {
    const onCancel = vi.fn().mockResolvedValueOnce();

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={mockExchange}
          isIncoming={false}
          onCancel={onCancel}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Bob Vance')).toBeInTheDocument();
    expect(screen.getByText('Portland, OR')).toBeInTheDocument();
    expect(screen.getByText('Python Programming')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel request/i });
    expect(cancelBtn).toBeInTheDocument();

    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalledWith(10);
    });
  });

  it('does not display action buttons when status is ACCEPTED', () => {
    const acceptedExchange = {
      ...mockExchange,
      status: 'ACCEPTED',
    };

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={acceptedExchange}
          isIncoming={true}
          onAccept={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /accept request/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /decline/i })).not.toBeInTheDocument();
    expect(screen.getByText(/accepted — scheduling in next step/i)).toBeInTheDocument();
  });
});
