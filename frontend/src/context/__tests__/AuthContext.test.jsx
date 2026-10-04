import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

function TestConsumer() {
  const { user, token, walletBalance, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</span>
      <span data-testid="user-name">{user ? user.name : 'no-user'}</span>
      <span data-testid="wallet-balance">{walletBalance}</span>
      <button
        onClick={() =>
          login({ email: 'test@example.com', password: 'Password123!' })
        }
      >
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes in unauthenticated state when localStorage is empty', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('0');
  });

  it('updates state and localStorage on login', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        token: 'mock-jwt-token',
        userId: 1,
        name: 'Jordan Lee',
        email: 'test@example.com',
        role: 'ROLE_MEMBER',
        walletBalance: 5.0,
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Jordan Lee');
    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('5');
    expect(localStorage.getItem('token')).toBe('mock-jwt-token');
  });

  it('clears credentials on logout', async () => {
    localStorage.setItem('token', 'existing-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Jordan Lee', email: 'test@example.com', role: 'ROLE_MEMBER' }));
    localStorage.setItem('walletBalance', '5');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
