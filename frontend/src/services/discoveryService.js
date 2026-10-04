import api from './api';

export const discoveryService = {
  searchMembers: async ({
    keyword = '',
    category = '',
    location = '',
    minRating = null,
    sortBy = 'RATING_DESC',
    page = 0,
    size = 9,
  } = {}) => {
    const params = new URLSearchParams();
    if (keyword && keyword.trim()) params.append('keyword', keyword.trim());
    if (category && category.trim() && category !== 'ALL') params.append('category', category.trim());
    if (location && location.trim()) params.append('location', location.trim());
    if (minRating !== null && minRating !== undefined && minRating !== '') params.append('minRating', minRating);
    if (sortBy) params.append('sortBy', sortBy);
    params.append('page', page);
    params.append('size', size);

    const response = await api.get(`/members/search?${params.toString()}`);
    return response.data;
  },
};

export default discoveryService;
