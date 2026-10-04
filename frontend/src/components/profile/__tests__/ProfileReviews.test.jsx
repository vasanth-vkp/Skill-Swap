import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileReviews from '../ProfileReviews';
import reviewService from '../../../services/reviewService';

vi.mock('../../../services/reviewService', () => ({
  default: {
    getReviewsForMember: vi.fn(),
  },
  reviewService: {
    getReviewsForMember: vi.fn(),
  },
}));

const mockReviews = [
  {
    id: 1,
    reviewerName: 'Alice Johnson',
    rating: 5,
    comment: 'Great instructor! Clear explanations and very patient.',
    skillTitle: 'Python Programming',
    createdAt: '2026-09-15T12:00:00Z',
  },
  {
    id: 2,
    reviewerName: 'Charlie Brown',
    rating: 4,
    comment: 'Very helpful session on UI design.',
    skillTitle: 'UI/UX Design',
    createdAt: '2026-09-18T15:30:00Z',
  },
];

describe('ProfileReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders aggregate rating, total review count, and reviews list', async () => {
    reviewService.getReviewsForMember.mockResolvedValueOnce(mockReviews);

    render(
      <ProfileReviews
        memberId={42}
        ratingAverage={4.8}
        totalReviews={2}
      />
    );

    expect(screen.getByText(/community reviews & reputation/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
      expect(screen.getByText(/great instructor!/i)).toBeInTheDocument();
      expect(screen.getByText('Python Programming')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('2 reviews')).toBeInTheDocument();
    });
  });

  it('renders empty state when member has no reviews', async () => {
    reviewService.getReviewsForMember.mockResolvedValueOnce([]);

    render(
      <ProfileReviews
        memberId={42}
        ratingAverage={5.0}
        totalReviews={0}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('no-reviews-empty-state')).toBeInTheDocument();
      expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
    });
  });

  it('displays error message when fetching reviews fails', async () => {
    reviewService.getReviewsForMember.mockRejectedValueOnce(new Error('Network error'));

    render(
      <ProfileReviews
        memberId={42}
        ratingAverage={5.0}
        totalReviews={0}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/unable to load reviews at this time/i)).toBeInTheDocument();
    });
  });
});
