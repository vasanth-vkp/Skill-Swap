import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExploreSkills from '../ExploreSkills';
import discoveryService from '../../services/discoveryService';

vi.mock('../../services/discoveryService', () => ({
  default: {
    searchMembers: vi.fn(),
  },
}));

const mockProvidersData = {
  content: [
    {
      id: 1,
      name: 'Alice Cooper',
      bio: 'Experienced Python backend developer.',
      location: 'Seattle, WA',
      avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Alice',
      averageRating: 4.9,
      totalReviews: 12,
      memberSince: '2026-01-01T00:00:00Z',
      offeredSkills: [
        { id: 10, skillId: 101, skillName: 'Python Programming', category: 'Technology', experience: 'ADVANCED' },
      ],
      wantedSkills: [],
    },
    {
      id: 2,
      name: 'Bob Martin',
      bio: 'Spanish language educator and coach.',
      location: 'Portland, OR',
      avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=Bob',
      averageRating: 4.8,
      totalReviews: 8,
      memberSince: '2026-02-01T00:00:00Z',
      offeredSkills: [
        { id: 11, skillId: 201, skillName: 'Spanish Conversation', category: 'Languages', experience: 'INTERMEDIATE' },
      ],
      wantedSkills: [],
    },
  ],
  totalPages: 1,
  totalElements: 2,
  size: 9,
  number: 0,
};

describe('ExploreSkills Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders community providers from discoveryService on mount', async () => {
    discoveryService.searchMembers.mockResolvedValueOnce(mockProvidersData);

    render(
      <BrowserRouter>
        <ExploreSkills />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /explore community skills/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
      expect(screen.getByText('Bob Martin')).toBeInTheDocument();
      expect(screen.getByText('Python Programming')).toBeInTheDocument();
      expect(screen.getByText('Spanish Conversation')).toBeInTheDocument();
    });

    expect(discoveryService.searchMembers).toHaveBeenCalledTimes(1);
  });

  it('filters providers when category filter button is clicked', async () => {
    discoveryService.searchMembers.mockResolvedValueOnce(mockProvidersData);

    render(
      <BrowserRouter>
        <ExploreSkills />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
    });

    discoveryService.searchMembers.mockResolvedValueOnce({
      content: [mockProvidersData.content[0]],
      totalPages: 1,
      totalElements: 1,
    });

    // Click Technology category button
    const techButtons = screen.getAllByRole('button', { name: /technology/i });
    fireEvent.click(techButtons[0]);

    await waitFor(() => {
      expect(discoveryService.searchMembers).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Technology',
          page: 0,
        })
      );
    });
  });

  it('renders rich empty state when no providers match criteria', async () => {
    discoveryService.searchMembers.mockResolvedValueOnce({
      content: [],
      totalPages: 0,
      totalElements: 0,
    });

    render(
      <BrowserRouter>
        <ExploreSkills />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no members match your criteria/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset all filters/i })).toBeInTheDocument();
    });
  });
});
