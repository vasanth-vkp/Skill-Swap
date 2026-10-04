import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import RecommendationCard from '../RecommendationCard';

const mockRecommendation = {
  providerId: 10,
  providerName: 'Marcus Vance',
  providerAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Marcus',
  providerLocation: 'Seattle, WA',
  providerRating: 4.8,
  matchedSkillName: 'Calculus & Linear Algebra',
  matchedSkillCategory: 'Academics',
  experienceLevel: 'ADVANCED',
  compatibilityPercentage: 94,
  isMutualMatch: true,
  matchReasons: [
    'Directly matches your wanted skill "Calculus"',
    'Both in Seattle, WA',
    'Mutual trade: Wants a skill you offer',
  ],
};

const mockNonMutualRecommendation = {
  ...mockRecommendation,
  providerId: 11,
  providerName: 'Sarah Connor',
  compatibilityPercentage: 76,
  isMutualMatch: false,
  matchReasons: ['Offers "Python Programming"'],
};

describe('RecommendationCard', () => {
  it('renders provider basic details, match percentage, and rating', () => {
    render(
      <BrowserRouter>
        <RecommendationCard recommendation={mockRecommendation} />
      </BrowserRouter>
    );

    expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
    expect(screen.getByText('Seattle, WA')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('94% Match')).toBeInTheDocument();
  });

  it('renders Mutual Match badge when isMutualMatch is true', () => {
    render(
      <BrowserRouter>
        <RecommendationCard recommendation={mockRecommendation} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('mutual-match-badge')).toBeInTheDocument();
    expect(screen.getByText('Mutual Match')).toBeInTheDocument();
  });

  it('does not render Mutual Match badge when isMutualMatch is false', () => {
    render(
      <BrowserRouter>
        <RecommendationCard recommendation={mockNonMutualRecommendation} />
      </BrowserRouter>
    );

    expect(screen.queryByTestId('mutual-match-badge')).not.toBeInTheDocument();
    expect(screen.getByText('76% Match')).toBeInTheDocument();
  });

  it('renders matched skill details, category, and experience level', () => {
    render(
      <BrowserRouter>
        <RecommendationCard recommendation={mockRecommendation} />
      </BrowserRouter>
    );

    expect(screen.getByText('Calculus & Linear Algebra')).toBeInTheDocument();
    expect(screen.getByText('Academics')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('renders match reasons list', () => {
    render(
      <BrowserRouter>
        <RecommendationCard recommendation={mockRecommendation} />
      </BrowserRouter>
    );

    expect(screen.getByText('Why this match')).toBeInTheDocument();
    expect(screen.getByText('Directly matches your wanted skill "Calculus"')).toBeInTheDocument();
    expect(screen.getByText('Both in Seattle, WA')).toBeInTheDocument();
    expect(screen.getByText('Mutual trade: Wants a skill you offer')).toBeInTheDocument();
  });

  it('renders Request Exchange CTA button linking to provider profile', () => {
    render(
      <BrowserRouter>
        <RecommendationCard recommendation={mockRecommendation} />
      </BrowserRouter>
    );

    const ctaLink = screen.getByRole('link', { name: /request exchange/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/members/10');
  });

  it('returns null when recommendation is not provided', () => {
    const { container } = render(
      <BrowserRouter>
        <RecommendationCard recommendation={null} />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });
});
