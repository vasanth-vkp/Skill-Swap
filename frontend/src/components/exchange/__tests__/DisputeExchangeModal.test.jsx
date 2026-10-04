import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DisputeExchangeModal from '../DisputeExchangeModal';
import exchangeService from '../../../services/exchangeService';

vi.mock('../../../services/exchangeService', () => ({
  default: {
    disputeExchange: vi.fn(),
  },
  exchangeService: {
    disputeExchange: vi.fn(),
  },
}));

const mockExchange = {
  id: 42,
  skillName: 'Guitar Lessons',
  providerName: 'Carlos Sant',
  requesterName: 'Alice Green',
  duration: 1.5,
};

describe('DisputeExchangeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <DisputeExchangeModal
        isOpen={false}
        exchange={mockExchange}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByTestId('dispute-modal')).not.toBeInTheDocument();
  });

  it('renders exchange details, reason choices, and notes input when open', () => {
    render(
      <DisputeExchangeModal
        isOpen={true}
        exchange={mockExchange}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('dispute-modal')).toBeInTheDocument();
    expect(screen.getByText('Guitar Lessons')).toBeInTheDocument();
    expect(screen.getByText('1.5 Hours')).toBeInTheDocument();
    expect(screen.getByText(/no-show \/ partner did not attend/i)).toBeInTheDocument();
    expect(screen.getByTestId('dispute-notes-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-dispute-btn')).toBeInTheDocument();
  });

  it('submits dispute with selected reason and optional notes', async () => {
    exchangeService.disputeExchange.mockResolvedValueOnce({
      id: 42,
      status: 'DISPUTED',
    });

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <DisputeExchangeModal
        isOpen={true}
        exchange={mockExchange}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // Enter notes
    const notesInput = screen.getByTestId('dispute-notes-input');
    fireEvent.change(notesInput, {
      target: { value: 'Waited 30 minutes in Zoom, no response.' },
    });

    // Submit
    const submitBtn = screen.getByTestId('submit-dispute-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(exchangeService.disputeExchange).toHaveBeenCalledWith(42, {
        reason: 'No-show / Partner did not attend: Waited 30 minutes in Zoom, no response.',
      });
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error alert when dispute submission fails', async () => {
    exchangeService.disputeExchange.mockRejectedValueOnce({
      response: { data: { error: 'Exchange is already completed' } },
    });

    render(
      <DisputeExchangeModal
        isOpen={true}
        exchange={mockExchange}
        onClose={vi.fn()}
      />
    );

    const submitBtn = screen.getByTestId('submit-dispute-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('dispute-error')).toBeInTheDocument();
      expect(screen.getByText('Exchange is already completed')).toBeInTheDocument();
    });
  });
});
