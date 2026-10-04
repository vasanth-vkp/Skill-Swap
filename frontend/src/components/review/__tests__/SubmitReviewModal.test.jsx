import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubmitReviewModal from '../SubmitReviewModal';
import reviewService from '../../../services/reviewService';

vi.mock('../../../services/reviewService', () => ({
  default: {
    createReview: vi.fn(),
    getReviewsForMember: vi.fn(),
    getReviewStatusForExchange: vi.fn(),
  },
  reviewService: {
    createReview: vi.fn(),
    getReviewsForMember: vi.fn(),
    getReviewStatusForExchange: vi.fn(),
  },
}));

const mockExchange = {
  id: 10,
  skillTitle: 'Web Development',
  partnerName: 'Alice Developer',
};

describe('SubmitReviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with partner info, 5 star buttons, and comment input', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={vi.fn()}
        exchange={mockExchange}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/review skill exchange/i)).toBeInTheDocument();
    expect(screen.getByText('Alice Developer')).toBeInTheDocument();
    expect(screen.getByTestId('star-1')).toBeInTheDocument();
    expect(screen.getByTestId('star-5')).toBeInTheDocument();
    expect(screen.getByLabelText(/feedback & notes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit review/i })).toBeDisabled();
  });

  it('selecting a star rating updates rating description and enables submit button', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={vi.fn()}
        exchange={mockExchange}
        onSuccess={vi.fn()}
      />
    );

    const star4 = screen.getByTestId('star-4');
    fireEvent.click(star4);

    expect(screen.getByTestId('rating-description')).toHaveTextContent('4 - Very Good');
    expect(screen.getByRole('button', { name: /submit review/i })).not.toBeDisabled();
  });

  it('hovering stars updates descriptive text temporarily', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={vi.fn()}
        exchange={mockExchange}
        onSuccess={vi.fn()}
      />
    );

    const star5 = screen.getByTestId('star-5');
    fireEvent.mouseEnter(star5);
    expect(screen.getByTestId('rating-description')).toHaveTextContent('5 - Excellent!');

    fireEvent.mouseLeave(star5);
    expect(screen.getByTestId('rating-description')).toHaveTextContent('Select a rating from 1 to 5 stars');
  });

  it('submits rating and comment successfully and calls onSuccess', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const createdReview = { id: 101, rating: 5, comment: 'Amazing session!' };
    reviewService.createReview.mockResolvedValueOnce(createdReview);

    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={onClose}
        exchange={mockExchange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByTestId('star-5'));
    fireEvent.change(screen.getByLabelText(/feedback & notes/i), {
      target: { value: 'Amazing session!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(reviewService.createReview).toHaveBeenCalledWith({
        exchangeId: 10,
        rating: 5,
        comment: 'Amazing session!',
      });
      expect(onSuccess).toHaveBeenCalledWith(createdReview);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error banner when submission fails', async () => {
    reviewService.createReview.mockRejectedValueOnce({
      response: { data: { message: 'You have already reviewed this exchange.' } },
    });

    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={vi.fn()}
        exchange={mockExchange}
        onSuccess={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('star-3'));
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('You have already reviewed this exchange.');
    });
  });
});
