import api from './api';

export const exchangeService = {
  /**
   * Submit a new service exchange request.
   * POST /api/v1/exchanges
   */
  createExchange: async ({ providerId, skillId, duration, notes }) => {
    const response = await api.post('/exchanges', {
      providerId,
      skillId,
      duration,
      notes,
    });
    return response.data;
  },

  /**
   * Fetch incoming exchange requests where current user is provider.
   * GET /api/v1/exchanges/incoming
   */
  getIncomingExchanges: async (status) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') {
      params.append('status', status);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/exchanges/incoming${query}`);
    return response.data;
  },

  /**
   * Fetch outgoing exchange requests where current user is requester.
   * GET /api/v1/exchanges/outgoing
   */
  getOutgoingExchanges: async (status) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') {
      params.append('status', status);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/exchanges/outgoing${query}`);
    return response.data;
  },

  /**
   * Get single exchange request details.
   * GET /api/v1/exchanges/{id}
   */
  getExchangeById: async (id) => {
    const response = await api.get(`/exchanges/${id}`);
    return response.data;
  },

  /**
   * Provider accepts pending exchange request.
   * PUT /api/v1/exchanges/{id}/accept
   */
  acceptExchange: async (id) => {
    const response = await api.put(`/exchanges/${id}/accept`);
    return response.data;
  },

  /**
   * Provider rejects pending exchange request.
   * PUT /api/v1/exchanges/{id}/reject
   */
  rejectExchange: async (id) => {
    const response = await api.put(`/exchanges/${id}/reject`);
    return response.data;
  },

  /**
   * Requester cancels pending exchange request.
   * PUT /api/v1/exchanges/{id}/cancel
   */
  cancelExchange: async (id) => {
    const response = await api.put(`/exchanges/${id}/cancel`);
    return response.data;
  },

  /**
   * Participant confirms service delivery completion.
   * POST /api/v1/exchanges/{id}/complete
   */
  confirmCompletion: async (id) => {
    const response = await api.post(`/exchanges/${id}/complete`);
    return response.data;
  },

  /**
   * Participant disputes an exchange request.
   * POST /api/v1/exchanges/{id}/dispute
   */
  disputeExchange: async (id, { reason }) => {
    const response = await api.post(`/exchanges/${id}/dispute`, { reason });
    return response.data;
  },
};

export default exchangeService;
