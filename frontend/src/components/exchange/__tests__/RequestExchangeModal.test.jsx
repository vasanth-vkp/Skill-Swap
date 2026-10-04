import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RequestExchangeModal from '../RequestExchangeModal';
import exchangeService from '../../../services/exchangeService';

vi.mock('../../../services/exchangeService', () => ({
  default: {
    createExchange: vi.fn(),
  },
  exchangeService: {
    createExchange: vi.fn(),
  },
}));

let mockBalance = 5.0;
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Alice', email: 'alice@example.com' },
    walletBalance: mockBalance,
  }),
}));

const mockProvider = {
  id: 2,
  name: 'Bob Vance',
  location: 'Seattle, WA',
  avatarUrl: 'https://example.com/avatar.jpg',
  offeredSkills: [
    { id: 10, skillId: 101, skillName: 'Python Programming', category: 'Technology', experience: 'ADVANCED' },
    { id: 11, skillId: 102, skillName: 'Data Analysis', category: 'Technology', experience: 'INTERMEDIATE' },
  ],
};

describe('RequestExchangeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBalance = 5.0;
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <RequestExchangeModal
        isOpen={false}
        onClose={vi.fn()}
        provider={mockProvider}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders provider info and offered skills options when open', () => {
    render(
      <RequestExchangeModal
        isOpen={true}
        onClose={vi.fn()}
        provider={mockProvider}
      />
    );

    expect(screen.getByRole('heading', { name: /request skill exchange/i })).toBeInTheDocument();
    expect(screen.getByText('Bob Vance')).toBeInTheDocument();
    expect(screen.getByText(/Seattle, WA/)).toBeInTheDocument();

    const select = screen.getByLabelText(/skill you want to learn/i);
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /python programming/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /data analysis/i })).toBeInTheDocument();
  });

  it('calculates credit cost when duration chip is selected', () => {
    render(
      <RequestExchangeModal
        isOpen={true}
        onClose={vi.fn()}
        provider={mockProvider}
      />
    );

    expect(screen.getByText('1.0 Credits')).toBeInTheDocument();

    const twoHourChip = screen.getByRole('button', { name: '2.0h' });
    fireEvent.click(twoHourChip);

    expect(screen.getByText('2.0 Credits')).toBeInTheDocument();
  });

  it('submits form with payload and invokes createExchange', async () => {
    exchangeService.createExchange.mockResolvedValueOnce({
      id: 99,
      status: 'PENDING',
    });

    const onSuccess = vi.fn();
    render(
      <RequestExchangeModal
        isOpen={true}
        onClose={vi.fn()}
        provider={mockProvider}
        onSuccess={onSuccess}
      />
    );

    const notesInput = screen.getByPlaceholderText(/introduce yourself/i);
    fireEvent.change(notesInput, { target: { value: 'Excited to learn Python!' } });

    const submitBtn = screen.getByRole('button', { name: /send exchange request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(exchangeService.createExchange).toHaveBeenCalledWith({
        providerId: 2,
        skillId: 101,
        duration: 1.0,
        notes: 'Excited to learn Python!',
      });
      expect(onSuccess).toHaveBeenCalledWith({ id: 99, status: 'PENDING' });
    });
  });

  it('disables submit button and shows error when wallet balance is lower than duration', () => {
    mockBalance = 0.5;

    render(
      <RequestExchangeModal
        isOpen={true}
        onClose={vi.fn()}
        provider={mockProvider}
      />
    );

    // Duration defaults to 1.0h, balance is 0.5
    expect(screen.getByText(/you do not have enough credits/i)).toBeInTheDocument();
    const submitBtn = screen.getByRole('button', { name: /send exchange request/i });
    expect(submitBtn).toBeDisabled();
  });

  it('invokes onClose when cancel or close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <RequestExchangeModal
        isOpen={true}
        onClose={onClose}
        provider={mockProvider}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const closeIconBtn = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeIconBtn);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
