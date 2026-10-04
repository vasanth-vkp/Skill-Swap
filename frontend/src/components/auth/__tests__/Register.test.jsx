import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';
import * as AuthContextModule from '../../../context/AuthContext';

describe('RegisterForm', () => {
  it('renders all required form fields and submit button', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: vi.fn(),
    });

    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join SkillSwap & Claim 5 Credits/i })).toBeInTheDocument();
  });

  it('toggles password visibility when eye button is clicked', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: vi.fn(),
    });

    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/^Password/i);
    const toggleButton = screen.getByRole('button', { name: /Show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('validates password requirements in real-time', async () => {
    const user = userEvent.setup();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: vi.fn(),
    });

    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/^Password/i);

    // Type short password with only letters
    await user.type(passwordInput, 'abc');
    expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/Contains at least one number/i)).toBeInTheDocument();

    // Type password meeting all criteria
    await user.clear(passwordInput);
    await user.type(passwordInput, 'ValidPass123');
    expect(screen.getByText(/At least 8 characters/i).parentElement).toHaveClass('text-emerald-700');
    expect(screen.getByText(/Contains at least one letter/i).parentElement).toHaveClass('text-emerald-700');
    expect(screen.getByText(/Contains at least one number/i).parentElement).toHaveClass('text-emerald-700');
  });

  it('submits form with valid data and invokes register', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockResolvedValue({});
    const mockOnSuccess = vi.fn();

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: mockRegister,
    });

    render(
      <BrowserRouter>
        <RegisterForm onSuccess={mockOnSuccess} />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'Devon Lane');
    await user.type(screen.getByLabelText(/Email Address/i), 'devon@example.com');
    await user.type(screen.getByLabelText(/Location/i), 'Denver, CO');
    await user.type(screen.getByLabelText(/^Password/i), 'SecretPass123!');

    await user.click(screen.getByRole('button', { name: /Join SkillSwap & Claim 5 Credits/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Devon Lane',
        email: 'devon@example.com',
        location: 'Denver, CO',
        password: 'SecretPass123!',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays error alert on duplicate email registration conflict', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockRejectedValue({
      response: { status: 409 },
    });

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      register: mockRegister,
    });

    render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/Full Name/i), 'Devon Lane');
    await user.type(screen.getByLabelText(/Email Address/i), 'devon@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'SecretPass123!');

    await user.click(screen.getByRole('button', { name: /Join SkillSwap & Claim 5 Credits/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/already registered/i);
    });
  });
});
