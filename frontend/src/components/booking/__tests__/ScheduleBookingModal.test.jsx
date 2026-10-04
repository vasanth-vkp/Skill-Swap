import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ScheduleBookingModal from '../ScheduleBookingModal';
import bookingService from '../../../services/bookingService';

vi.mock('../../../services/bookingService', () => ({
  default: {
    scheduleBooking: vi.fn(),
    rescheduleBooking: vi.fn(),
  },
  bookingService: {
    scheduleBooking: vi.fn(),
    rescheduleBooking: vi.fn(),
  },
}));

const mockExchange = {
  id: 42,
  skillName: 'Guitar Lessons',
  skillCategory: 'Arts & Design',
  duration: 1.5,
  providerName: 'Alex Rivera',
  requesterName: 'Sam Taylor',
};

describe('ScheduleBookingModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal in Schedule mode with skill info and duration badge', () => {
    render(
      <ScheduleBookingModal
        isOpen={true}
        onClose={vi.fn()}
        exchange={mockExchange}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /coordinate your exchange date/i })).toBeInTheDocument();
    expect(screen.getByText('Guitar Lessons with Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('1.5 Hours (1.5 Credits)')).toBeInTheDocument();
    expect(screen.getByLabelText(/start date & time/i)).toBeInTheDocument();
  });

  it('calculates and displays estimated end time when start time is entered', () => {
    render(
      <ScheduleBookingModal
        isOpen={true}
        onClose={vi.fn()}
        exchange={mockExchange}
        onSuccess={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/start date & time/i);
    // Enter a time 2 days from now at 14:00
    const futureDate = new Date(Date.now() + 48 * 3600 * 1000);
    futureDate.setHours(14, 0, 0, 0);

    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${futureDate.getFullYear()}-${pad(futureDate.getMonth() + 1)}-${pad(futureDate.getDate())}T14:00`;

    fireEvent.change(input, { target: { value: dateStr } });

    // With duration 1.5h, end time should be around 15:30 (3:30 PM)
    expect(screen.getByText(/calculated end time:/i)).toBeInTheDocument();
    expect(screen.getByText(/3:30/i)).toBeInTheDocument();
  });

  it('submits scheduling request via bookingService.scheduleBooking', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    bookingService.scheduleBooking.mockResolvedValueOnce({
      id: 101,
      requestId: 42,
      status: 'SCHEDULED',
    });

    render(
      <ScheduleBookingModal
        isOpen={true}
        onClose={onClose}
        exchange={mockExchange}
        onSuccess={onSuccess}
      />
    );

    const input = screen.getByLabelText(/start date & time/i);
    const futureDate = new Date(Date.now() + 24 * 3600 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${futureDate.getFullYear()}-${pad(futureDate.getMonth() + 1)}-${pad(futureDate.getDate())}T10:00`;
    fireEvent.change(input, { target: { value: dateStr } });

    const submitBtn = screen.getByRole('button', { name: /confirm schedule/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(bookingService.scheduleBooking).toHaveBeenCalledWith(42, {
        startTime: expect.any(String),
      });
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('renders in Reschedule mode and calls bookingService.rescheduleBooking on submit', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    bookingService.rescheduleBooking.mockResolvedValueOnce({
      id: 99,
      requestId: 42,
      status: 'SCHEDULED',
    });

    const existingBooking = {
      id: 99,
      startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      duration: 1.5,
    };

    render(
      <ScheduleBookingModal
        isOpen={true}
        onClose={onClose}
        exchange={mockExchange}
        existingBooking={existingBooking}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByRole('heading', { name: /pick a new date & time/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update schedule/i })).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /update schedule/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(bookingService.rescheduleBooking).toHaveBeenCalledWith(99, {
        startTime: expect.any(String),
      });
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays alert banner when API reports a calendar conflict (409)', async () => {
    bookingService.scheduleBooking.mockRejectedValueOnce({
      response: {
        status: 409,
        data: { error: 'Calendar conflict: Provider has another confirmed booking during this time window.' },
      },
    });

    render(
      <ScheduleBookingModal
        isOpen={true}
        onClose={vi.fn()}
        exchange={mockExchange}
        onSuccess={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /confirm schedule/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/calendar conflict/i)).toBeInTheDocument();
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ScheduleBookingModal
        isOpen={false}
        onClose={vi.fn()}
        exchange={mockExchange}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
