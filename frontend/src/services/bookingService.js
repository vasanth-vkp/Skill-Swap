import api from './api';

export const bookingService = {
  /**
   * Schedule a session for an accepted exchange request.
   * POST /api/v1/exchanges/{exchangeId}/book
   */
  scheduleBooking: async (exchangeId, { startTime }) => {
    const response = await api.post(`/exchanges/${exchangeId}/book`, { startTime });
    return response.data;
  },

  /**
   * Reschedule an existing scheduled booking.
   * PUT /api/v1/bookings/{bookingId}/reschedule
   */
  rescheduleBooking: async (bookingId, { startTime }) => {
    const response = await api.put(`/bookings/${bookingId}/reschedule`, { startTime });
    return response.data;
  },

  /**
   * Cancel an existing scheduled booking (reverts exchange to ACCEPTED).
   * DELETE /api/v1/bookings/{bookingId}
   */
  cancelBooking: async (bookingId) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Get all upcoming active bookings for the authenticated user.
   * GET /api/v1/bookings/upcoming
   */
  getUpcomingBookings: async () => {
    const response = await api.get('/bookings/upcoming');
    return response.data;
  },

  /**
   * Get active booking for a specific exchange request.
   * GET /api/v1/exchanges/{exchangeId}/booking
   */
  getBookingForExchange: async (exchangeId) => {
    try {
      const response = await api.get(`/exchanges/${exchangeId}/booking`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      throw err;
    }
  },
};

export default bookingService;
