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
    expect(screen.getByText(/accepted — awaiting scheduling/i)).toBeInTheDocument();
  });

  it('displays Schedule Session button when status is ACCEPTED and onSchedule is provided', () => {
    const acceptedExchange = {
      ...mockExchange,
      status: 'ACCEPTED',
    };
    const onSchedule = vi.fn();

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={acceptedExchange}
          isIncoming={true}
          onSchedule={onSchedule}
        />
      </BrowserRouter>
    );

    const scheduleBtn = screen.getByRole('button', { name: /schedule session/i });
    expect(scheduleBtn).toBeInTheDocument();
    fireEvent.click(scheduleBtn);
    expect(onSchedule).toHaveBeenCalledWith(acceptedExchange);
  });

  it('triggers onConfirmCompletion when confirm button is clicked on SCHEDULED exchange', async () => {
    const scheduledExchange = {
      ...mockExchange,
      status: 'SCHEDULED',
      providerConfirmed: false,
      requesterConfirmed: false,
    };
    const onConfirmCompletion = vi.fn().mockResolvedValueOnce();

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={scheduledExchange}
          isIncoming={true}
          onConfirmCompletion={onConfirmCompletion}
          onDispute={vi.fn()}
        />
      </BrowserRouter>
    );

    const completeBtn = screen.getByTestId('confirm-completion-btn');
    expect(completeBtn).toBeInTheDocument();
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(onConfirmCompletion).toHaveBeenCalledWith(10);
    });
  });

  it('triggers onDispute when dispute button is clicked on SCHEDULED exchange', () => {
    const scheduledExchange = {
      ...mockExchange,
      status: 'SCHEDULED',
      providerConfirmed: false,
      requesterConfirmed: false,
    };
    const onDispute = vi.fn();

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={scheduledExchange}
          isIncoming={true}
          onConfirmCompletion={vi.fn()}
          onDispute={onDispute}
        />
      </BrowserRouter>
    );

    const disputeBtn = screen.getByTestId('open-dispute-btn');
    expect(disputeBtn).toBeInTheDocument();
    fireEvent.click(disputeBtn);
    expect(onDispute).toHaveBeenCalledWith(scheduledExchange);
  });

  it('renders awaiting partner confirmation when user has confirmed', () => {
    const scheduledExchange = {
      ...mockExchange,
      status: 'SCHEDULED',
      providerConfirmed: true, // user is provider (isIncoming=true)
      requesterConfirmed: false,
    };

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={scheduledExchange}
          isIncoming={true}
          onConfirmCompletion={vi.fn()}
          onDispute={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('awaiting-partner-confirmation')).toBeInTheDocument();
    expect(screen.getByText(/awaiting partner confirmation/i)).toBeInTheDocument();
    expect(screen.queryByTestId('confirm-completion-btn')).not.toBeInTheDocument();
  });

  it('renders highlighted reciprocal verify CTA when partner has confirmed', () => {
    const scheduledExchange = {
      ...mockExchange,
      status: 'SCHEDULED',
      providerConfirmed: false, // user is provider (isIncoming=true)
      requesterConfirmed: true, // partner confirmed
    };
    const onConfirmCompletion = vi.fn();

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={scheduledExchange}
          isIncoming={true}
          onConfirmCompletion={onConfirmCompletion}
          onDispute={vi.fn()}
        />
      </BrowserRouter>
    );

    const verifyBtn = screen.getByTestId('partner-confirmed-verify-btn');
    expect(verifyBtn).toBeInTheDocument();
    expect(screen.getByText(/partner confirmed — verify completion/i)).toBeInTheDocument();

    fireEvent.click(verifyBtn);
    expect(onConfirmCompletion).toHaveBeenCalledWith(10);
  });

  it('renders completed notice when status is COMPLETED', () => {
    const completedExchange = {
      ...mockExchange,
      status: 'COMPLETED',
      providerConfirmed: true,
      requesterConfirmed: true,
    };

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={completedExchange}
          isIncoming={false}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('exchange-completed-notice')).toBeInTheDocument();
    expect(screen.getByText(/service verified & completed/i)).toBeInTheDocument();
  });

  it('renders disputed notice with reason when status is DISPUTED', () => {
    const disputedExchange = {
      ...mockExchange,
      status: 'DISPUTED',
      disputeReason: 'Partner was 45 minutes late and skipped topics',
    };

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={disputedExchange}
          isIncoming={false}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('exchange-disputed-notice')).toBeInTheDocument();
    expect(screen.getByText(/partner was 45 minutes late and skipped topics/i)).toBeInTheDocument();
  });

  it('renders Leave a Review button when status is COMPLETED and not yet reviewed', () => {
    const completedExchange = {
      ...mockExchange,
      status: 'COMPLETED',
      hasReviewed: false,
    };
    const onOpenReview = vi.fn();

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={completedExchange}
          isIncoming={false}
          onOpenReview={onOpenReview}
        />
      </BrowserRouter>
    );

    const reviewBtn = screen.getByTestId('leave-review-btn');
    expect(reviewBtn).toBeInTheDocument();
    expect(screen.getByText(/leave a review/i)).toBeInTheDocument();

    fireEvent.click(reviewBtn);
    expect(onOpenReview).toHaveBeenCalledWith(completedExchange);
  });

  it('renders Reviewed badge when completed exchange has already been reviewed', () => {
    const reviewedExchange = {
      ...mockExchange,
      status: 'COMPLETED',
      hasReviewed: true,
    };

    render(
      <BrowserRouter>
        <ExchangeCard
          exchange={reviewedExchange}
          isIncoming={false}
          onOpenReview={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('exchange-reviewed-badge')).toBeInTheDocument();
    expect(screen.getByText('Reviewed')).toBeInTheDocument();
    expect(screen.queryByTestId('leave-review-btn')).not.toBeInTheDocument();
  });
});

