import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import UpcomingBookingsWidget from '../UpcomingBookingsWidget';
import bookingService from '../../../services/bookingService';

vi.mock('../../../services/bookingService', () => ({
  default: {
    getUpcomingBookings: vi.fn(),
    cancelBooking: vi.fn(),
    scheduleBooking: vi.fn(),
    rescheduleBooking: vi.fn(),
  },
}));

// Mock ScheduleBookingModal to isolate widget tests
vi.mock('../../booking/ScheduleBookingModal', () => ({
  default: ({ isOpen, onSuccess, onClose }) =>
    isOpen ? (
      <div data-testid="reschedule-modal">
        <button onClick={onSuccess}>Confirm Reschedule</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const mockBookings = [
  {
    id: 1,
    requestId: 10,
    skillName: 'Python Programming',
    providerName: 'Alex Rivera',
    providerId: 5,
    providerAvatar: null,
    duration: 1.0,
    startTime: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(), // 2 days from now
    endTime: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
  },
  {
    id: 2,
    requestId: 11,
    skillName: 'Guitar Lessons',
    providerName: 'Sam Taylor',
    providerId: 6,
    providerAvatar: null,
    duration: 1.5,
    startTime: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), // 5 days from now
    endTime: new Date(Date.now() + 5 * 24 * 3600 * 1000 + 1.5 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
  },
];

const renderWidget = () =>
  render(
    <MemoryRouter>
      <UpcomingBookingsWidget />
    </MemoryRouter>
  );

describe('UpcomingBookingsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeleton while fetching bookings', () => {
    // Never resolve so we stay in loading state
    bookingService.getUpcomingBookings.mockReturnValue(new Promise(() => {}));
    renderWidget();

    expect(screen.getByTestId('upcoming-bookings-loading')).toBeInTheDocument();
  });

  it('shows empty state when there are no upcoming bookings', async () => {
    bookingService.getUpcomingBookings.mockResolvedValueOnce([]);
    renderWidget();

    await waitFor(() => {
      expect(screen.getByTestId('upcoming-bookings-empty')).toBeInTheDocument();
    });

    expect(screen.getByText(/no upcoming sessions scheduled yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view exchanges/i })).toBeInTheDocument();
  });

  it('renders booking cards when sessions are present', async () => {
    bookingService.getUpcomingBookings.mockResolvedValueOnce(mockBookings);
    renderWidget();

    await waitFor(() => {
      expect(screen.getByTestId('upcoming-bookings-grid')).toBeInTheDocument();
    });

    expect(screen.getByTestId('booking-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('booking-card-2')).toBeInTheDocument();
    expect(screen.getByText('Python Programming')).toBeInTheDocument();
    expect(screen.getByText('Guitar Lessons')).toBeInTheDocument();
  });

  it('shows duration credits for each booking', async () => {
    bookingService.getUpcomingBookings.mockResolvedValueOnce(mockBookings);
    renderWidget();

    await waitFor(() => {
      expect(screen.getByTestId('upcoming-bookings-grid')).toBeInTheDocument();
    });

    expect(screen.getByText('1.0 Hours (1.0 Credits)')).toBeInTheDocument();
    expect(screen.getByText('1.5 Hours (1.5 Credits)')).toBeInTheDocument();
  });

  it('calls cancelBooking and refreshes list when user confirms cancel', async () => {
    bookingService.getUpcomingBookings
      .mockResolvedValueOnce(mockBookings) // initial load
      .mockResolvedValueOnce([]); // after cancellation
    bookingService.cancelBooking.mockResolvedValueOnce({});

    // Stub window.confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

    renderWidget();

    await waitFor(() => {
      expect(screen.getByTestId('upcoming-bookings-grid')).toBeInTheDocument();
    });

    // Click the Cancel button for the first booking
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(bookingService.cancelBooking).toHaveBeenCalledWith(1);
      expect(bookingService.getUpcomingBookings).toHaveBeenCalledTimes(2);
    });
  });

  it('does not call cancelBooking when user dismisses the confirm dialog', async () => {
    bookingService.getUpcomingBookings.mockResolvedValueOnce(mockBookings);
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);

    renderWidget();

    await waitFor(() => {
      expect(screen.getByTestId('upcoming-bookings-grid')).toBeInTheDocument();
    });

    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButtons[0]);

    expect(bookingService.cancelBooking).not.toHaveBeenCalled();
  });

  it('opens reschedule modal when Reschedule is clicked', async () => {
    bookingService.getUpcomingBookings.mockResolvedValueOnce(mockBookings);
    renderWidget();

    await waitFor(() => {
      expect(screen.getByTestId('upcoming-bookings-grid')).toBeInTheDocument();
    });

    const rescheduleButtons = screen.getAllByRole('button', { name: /reschedule/i });
    fireEvent.click(rescheduleButtons[0]);

    expect(screen.getByTestId('reschedule-modal')).toBeInTheDocument();
  });

  it('shows error message when booking fetch fails', async () => {
    bookingService.getUpcomingBookings.mockRejectedValueOnce(new Error('Network error'));
    renderWidget();

    await waitFor(() => {
      expect(screen.getByText(/unable to load upcoming sessions/i)).toBeInTheDocument();
    });
  });

  it('renders section header and manage-all link correctly', async () => {
    bookingService.getUpcomingBookings.mockResolvedValueOnce([]);
    renderWidget();

    await waitFor(() => {
      expect(screen.getByTestId('upcoming-bookings-section')).toBeInTheDocument();
    });

    expect(screen.getByText('Your Upcoming Skill Swaps')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /manage all exchanges/i })).toBeInTheDocument();
  });
});
