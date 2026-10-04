import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import ProfileEdit from '../ProfileEdit';
import MemberProfile from '../MemberProfile';
import profileService from '../../services/profileService';
import * as AuthContextModule from '../../context/AuthContext';

vi.mock('../../services/profileService', () => ({
  default: {
    getMyProfile: vi.fn(),
    updateProfile: vi.fn(),
    getMySkills: vi.fn(),
    addSkill: vi.fn(),
    removeSkill: vi.fn(),
    getPublicMember: vi.fn(),
  },
}));

vi.mock('../../services/skillService', () => ({
  default: {
    getSkills: vi.fn().mockResolvedValue([]),
    createSkill: vi.fn(),
  },
}));

describe('Profile Views', () => {
  const mockUser = {
    id: 1,
    name: 'Taylor Swift',
    email: 'taylor@example.com',
    role: 'ROLE_MEMBER',
  };

  const mockProfileData = {
    userId: 1,
    name: 'Taylor Swift',
    email: 'taylor@example.com',
    bio: 'Songwriter and community supporter.',
    location: 'Nashville, TN',
    avatarUrl: 'https://example.com/avatar.png',
    offeredSkills: [
      { id: 101, skillId: 1, skillName: 'Acoustic Guitar', category: 'Arts & Design', type: 'OFFERED', experience: 'ADVANCED' },
    ],
    wantedSkills: [
      { id: 102, skillId: 2, skillName: 'Cooking & Baking', category: 'Trades & Practical', type: 'WANTED', experience: null },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });
  });

  describe('ProfileEdit', () => {
    it('loads and displays personal details and skills', async () => {
      profileService.getMyProfile.mockResolvedValueOnce(mockProfileData);

      render(
        <BrowserRouter>
          <ProfileEdit />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText('Taylor Swift')[0]).toBeInTheDocument();
        expect(screen.getByText('taylor@example.com')).toBeInTheDocument();
        expect(screen.getByText('Nashville, TN')).toBeInTheDocument();
      });

      // Switch to skills tab
      const skillsTab = screen.getByRole('button', { name: /Manage Skills/i });
      await userEvent.click(skillsTab);

      expect(screen.getByText('Acoustic Guitar')).toBeInTheDocument();
      expect(screen.getByText('Cooking & Baking')).toBeInTheDocument();
    });

    it('submits updated profile details', async () => {
      profileService.getMyProfile.mockResolvedValueOnce(mockProfileData);
      profileService.updateProfile.mockResolvedValueOnce({
        ...mockProfileData,
        bio: 'Updated bio for testing.',
      });

      render(
        <BrowserRouter>
          <ProfileEdit />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
      });

      const bioInput = screen.getByLabelText(/Bio/i);
      await userEvent.clear(bioInput);
      await userEvent.type(bioInput, 'Updated bio for testing.');

      const saveBtn = screen.getByRole('button', { name: /Save Profile Details/i });
      await userEvent.click(saveBtn);

      await waitFor(() => {
        expect(profileService.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            bio: 'Updated bio for testing.',
          })
        );
        expect(screen.getByText(/Profile details updated successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('MemberProfile', () => {
    it('renders public profile and exchange request CTA', async () => {
      profileService.getPublicMember.mockResolvedValueOnce({
        id: 42,
        name: 'Jordan Lee',
        bio: 'Frontend developer and language learner.',
        location: 'Chicago, IL',
        avatarUrl: null,
        memberSince: '2026-01-15T00:00:00Z',
        offeredSkills: [
          { id: 201, skillId: 5, skillName: 'Web Development', category: 'Technology', type: 'OFFERED', experience: 'ADVANCED' },
        ],
        wantedSkills: [
          { id: 202, skillId: 8, skillName: 'Spanish Conversation', category: 'Languages', type: 'WANTED', experience: null },
        ],
        ratingAverage: 5.0,
        totalReviews: 3,
      });

      render(
        <MemoryRouter initialEntries={['/members/42']}>
          <Routes>
            <Route path="/members/:id" element={<MemberProfile />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
        expect(screen.getByText('Chicago, IL')).toBeInTheDocument();
        expect(screen.getByText(/Frontend developer and language learner/i)).toBeInTheDocument();
        expect(screen.getByText('Web Development')).toBeInTheDocument();
        expect(screen.getByText('Spanish Conversation')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Request Skill Exchange/i })).toBeInTheDocument();
      });
    });
  });
});
