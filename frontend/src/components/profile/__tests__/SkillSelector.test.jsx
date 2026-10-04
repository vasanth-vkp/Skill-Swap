import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SkillSelector from '../SkillSelector';
import skillService from '../../../services/skillService';

vi.mock('../../../services/skillService', () => ({
  default: {
    getSkills: vi.fn(),
    createSkill: vi.fn(),
  },
}));

describe('SkillSelector', () => {
  const mockSkills = [
    { id: 1, name: 'Web Development', category: 'Technology' },
    { id: 2, name: 'Python Programming', category: 'Technology' },
    { id: 3, name: 'Spanish Conversation', category: 'Languages' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    skillService.getSkills.mockResolvedValue(mockSkills);
  });

  it('renders category tabs, search input, and initial catalog', async () => {
    render(<SkillSelector onSelectSkill={vi.fn()} />);

    expect(screen.getByRole('button', { name: /^All$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Technology$/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search skills/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('Spanish Conversation')).toBeInTheDocument();
    });
  });

  it('filters by category when category pill is clicked', async () => {
    const user = userEvent.setup();
    render(<SkillSelector onSelectSkill={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /^Languages$/i }));

    await waitFor(() => {
      expect(skillService.getSkills).toHaveBeenCalledWith('Languages', null);
    });
  });

  it('invokes onSelectSkill with experience level for OFFERED skills', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(<SkillSelector type="OFFERED" onSelectSkill={handleSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });

    // Select "Advanced" level
    await user.click(screen.getByRole('button', { name: /Advanced/i }));

    // Click "Add" button for Web Development
    const addButtons = screen.getAllByRole('button', { name: /Add/i });
    await user.click(addButtons[0]);

    expect(handleSelect).toHaveBeenCalledWith({
      skillId: 1,
      skillName: 'Web Development',
      category: 'Technology',
      type: 'OFFERED',
      experience: 'ADVANCED',
    });
  });

  it('allows custom skill creation when query does not match catalog', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    skillService.getSkills.mockResolvedValue([]);

    render(<SkillSelector type="WANTED" onSelectSkill={handleSelect} />);

    const searchInput = screen.getByPlaceholderText(/Search skills/i);
    await user.type(searchInput, 'Aerospace Engineering');

    await waitFor(() => {
      expect(screen.getByText(/Add "Aerospace Engineering" as a custom skill/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/Add "Aerospace Engineering" as a custom skill/i));
    await user.click(screen.getByRole('button', { name: /Confirm & Add Skill/i }));

    expect(handleSelect).toHaveBeenCalledWith({
      skillId: null,
      skillName: 'Aerospace Engineering',
      category: 'Technology',
      type: 'WANTED',
      experience: null,
    });
  });
});
