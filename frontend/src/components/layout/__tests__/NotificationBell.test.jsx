import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NotificationBell from '../NotificationBell';
import notificationService from '../../../services/notificationService';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../services/notificationService', () => ({
  default: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
  notificationService: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationService.getUnreadCount.mockResolvedValue({ count: 0 });
    notificationService.getNotifications.mockResolvedValue([]);
  });

  it('renders bell button without badge when unreadCount is 0', async () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });

  it('renders badge with count when unreadCount > 0', async () => {
    notificationService.getUnreadCount.mockResolvedValueOnce({ count: 3 });

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    const badge = await screen.findByTestId('notification-badge');
    expect(badge).toHaveTextContent('3');
  });

  it('clicking bell opens dropdown and fetches notifications', async () => {
    const mockNotifs = [
      {
        id: 1,
        message: 'Alice sent you an exchange request for Spanish Tutoring.',
        type: 'REQUEST_RECEIVED',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        message: 'Your 1-hour session was completed! 1.0 credit transferred.',
        type: 'CREDIT_TRANSFERRED',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
    notificationService.getUnreadCount.mockResolvedValueOnce({ count: 1 });
    notificationService.getNotifications.mockResolvedValueOnce(mockNotifs);

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellBtn);

    await waitFor(() => {
      expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
      expect(screen.getByText('Alice sent you an exchange request for Spanish Tutoring.')).toBeInTheDocument();
      expect(screen.getByText('Your 1-hour session was completed! 1.0 credit transferred.')).toBeInTheDocument();
    });
  });

  it('clicking "Mark all as read" calls service and clears unread count', async () => {
    const mockNotifs = [
      {
        id: 1,
        message: 'Alice sent you an exchange request for Spanish Tutoring.',
        type: 'REQUEST_RECEIVED',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];
    notificationService.getUnreadCount.mockResolvedValueOnce({ count: 1 });
    notificationService.getNotifications.mockResolvedValueOnce(mockNotifs);
    notificationService.markAllAsRead.mockResolvedValueOnce({ success: true });

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellBtn);

    const markAllBtn = await screen.findByRole('button', { name: /mark all as read/i });
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(notificationService.markAllAsRead).toHaveBeenCalled();
      expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
    });
  });

  it('clicking on a notification marks it read and routes to appropriate page', async () => {
    const mockNotifs = [
      {
        id: 5,
        message: 'You received a new 5-star review from Bob!',
        type: 'REVIEW_RECEIVED',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];
    notificationService.getUnreadCount.mockResolvedValueOnce({ count: 1 });
    notificationService.getNotifications.mockResolvedValueOnce(mockNotifs);
    notificationService.markAsRead.mockResolvedValueOnce({ id: 5, isRead: true });

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellBtn);

    const notifItem = await screen.findByText('You received a new 5-star review from Bob!');
    fireEvent.click(notifItem);

    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith(5);
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });
});
