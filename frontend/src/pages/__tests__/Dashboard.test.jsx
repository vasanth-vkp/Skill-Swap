import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../Dashboard';
import recommendationService from '../../services/recommendationService';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Alex Mercer', email: 'alex@example.com', role: 'ROLE_MEMBER' },
    walletBalance: 5.0,
    logout: vi.fn(),
  }),
}));

vi.mock('../../services/recommendationService', () => ({
  default: {
    getRecommendations: vi.fn(),
  },
  recommendationService: {
    getRecommendations: vi.fn(),
  },
}));

const mockRecommendations = [
  {
    providerId: 10,
    providerName: 'Maya Lin',
    providerAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Maya',
    providerLocation: 'Seattle, WA',
    providerRating: 4.9,
    matchedSkillName: 'Calculus',
    matchedSkillCategory: 'Academics',
    experienceLevel: 'ADVANCED',
    compatibilityPercentage: 96,
    isMutualMatch: true,
    matchReasons: [
      'Directly matches your wanted skill "Calculus"',
      'Both in Seattle, WA',
      'Mutual trade: Wants a skill you offer',
    ],
  },
  {
    providerId: 20,
    providerName: 'Ken Adams',
    providerAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Ken',
    providerLocation: 'Remote',
    providerRating: 4.7,
    matchedSkillName: 'Python Programming',
    matchedSkillCategory: 'Technology',
    experienceLevel: 'INTERMEDIATE',
    compatibilityPercentage: 82,
    isMutualMatch: false,
    matchReasons: [
      'Matches your wanted skill "Python"',
      'High community rating (4.7/5.0)',
    ],
  },
];

describe('Dashboard Recommendations Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton while recommendations are being fetched', async () => {
    // Return a pending promise that does not resolve immediately
    recommendationService.getRecommendations.mockReturnValue(new Promise(() => {}));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('recommendations-loading')).toBeInTheDocument();
  });

  it('renders recommendation cards when recommendations are returned', async () => {
    recommendationService.getRecommendations.mockResolvedValueOnce(mockRecommendations);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('recommendations-grid')).toBeInTheDocument();
      expect(screen.getByText('Maya Lin')).toBeInTheDocument();
      expect(screen.getByText('Ken Adams')).toBeInTheDocument();
      expect(screen.getByText('96% Match')).toBeInTheDocument();
      expect(screen.getByText('82% Match')).toBeInTheDocument();
      expect(screen.getByText('Calculus')).toBeInTheDocument();
      expect(screen.getByText('Python Programming')).toBeInTheDocument();
    });

    // Verify mutual match badge is rendered on reciprocal match
    expect(screen.getByTestId('mutual-match-badge')).toBeInTheDocument();
    expect(screen.getByText('Mutual Match')).toBeInTheDocument();
  });

  it('renders empty state fallback when 0 recommendations returned', async () => {
    recommendationService.getRecommendations.mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('recommendations-empty')).toBeInTheDocument();
      expect(screen.getByText(/no matches found yet/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /add wanted skills/i })).toHaveAttribute('href', '/profile');
      expect(screen.getByRole('link', { name: /browse catalog/i })).toHaveAttribute('href', '/explore');
    });
  });

  it('renders empty state when recommendations call fails gracefully', async () => {
    recommendationService.getRecommendations.mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('recommendations-empty')).toBeInTheDocument();
    });
  });
});
