import api from './api';

export const recommendationService = {
  /**
   * Fetches personalized skill recommendations for the authenticated member.
   * Calls GET /api/v1/recommendations/me
   */
  getRecommendations: async () => {
    const response = await api.get('/recommendations/me');
    return response.data;
  },
};

export default recommendationService;
