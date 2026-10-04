import api from './api';

export const walletService = {
  /**
   * Fetches current member's wallet balance and aggregate credit metrics.
   * @returns {Promise<{balance: number, totalEarned: number, totalSpent: number, completedExchangesCount: number}>}
   */
  getWalletSummary: async () => {
    const response = await api.get('/wallet/me');
    return response.data;
  },

  /**
   * Fetches member's complete immutable credit transaction history.
   * @returns {Promise<Array<{id: number, exchangeId: number, amount: number, type: string, direction: string, counterpartyName: string, counterpartyId: number, skillTitle: string, createdAt: string}>>}
   */
  getTransactionHistory: async () => {
    const response = await api.get('/wallet/transactions');
    return response.data;
  },
};

export default walletService;
