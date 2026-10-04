import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ProviderCard from '../ProviderCard';

const mockProvider = {
  id: 42,
  name: 'Elena Rostova',
  bio: 'Full-stack software engineer and open-source contributor.',
  location: 'San Francisco, CA',
  avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Elena',
  averageRating: 4.9,
  totalReviews: 18,
  memberSince: '2026-01-15T00:00:00Z',
  offeredSkills: [
    { id: 1, skillId: 101, skillName: 'React Development', category: 'Technology', experience: 'ADVANCED' },
    { id: 2, skillId: 102, skillName: 'Python Programming', category: 'Technology', experience: 'INTERMEDIATE' },
  ],
  wantedSkills: [
    { id: 3, skillId: 201, skillName: 'Spanish Conversation', category: 'Languages' },
  ],
};

describe('ProviderCard', () => {
  it('renders provider basic details and rating', () => {
    render(
      <BrowserRouter>
        <ProviderCard provider={mockProvider} />
      </BrowserRouter>
    );

    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('(18)')).toBeInTheDocument();
    expect(screen.getByText('Full-stack software engineer and open-source contributor.')).toBeInTheDocument();
  });

  it('renders offered skills with experience levels', () => {
    render(
      <BrowserRouter>
        <ProviderCard provider={mockProvider} />
      </BrowserRouter>
    );

    expect(screen.getByText('React Development')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Python Programming')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Spanish Conversation')).toBeInTheDocument();
  });

  it('renders a primary link navigating to the member public profile', () => {
    render(
      <BrowserRouter>
        <ProviderCard provider={mockProvider} />
      </BrowserRouter>
    );

    const ctaLink = screen.getByRole('link', { name: /view profile & request/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/members/42');
  });
});
