import api from './api';

export const reviewService = {
  /**
   * Submit a review for a completed skill exchange.
   * @param {{ exchangeId: number, rating: number, comment?: string }} data
   * @returns {Promise<any>}
   */
  createReview: async ({ exchangeId, rating, comment }) => {
    const response = await api.post('/reviews', { exchangeId, rating, comment });
    return response.data;
  },

  /**
   * Get all public reviews for a member.
   * @param {number|string} memberId
   * @returns {Promise<Array<any>>}
   */
  getReviewsForMember: async (memberId) => {
    const response = await api.get(`/reviews/member/${memberId}`);
    return response.data;
  },

  /**
   * Check if current authenticated user has reviewed the exchange.
   * @param {number|string} exchangeId
   * @returns {Promise<{ hasReviewed: boolean, review?: any }>}
   */
  getReviewStatusForExchange: async (exchangeId) => {
    const response = await api.get(`/reviews/exchange/${exchangeId}/status`);
    return response.data;
  },
};

export default reviewService;
