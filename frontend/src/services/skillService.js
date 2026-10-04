import api from './api';

export const skillService = {
  async getSkills(category, search) {
    const params = {};
    if (category && category !== 'All') params.category = category;
    if (search) params.search = search;
    const response = await api.get('/skills', { params });
    return response.data;
  },

  async createSkill(data) {
    const response = await api.post('/skills', data);
    return response.data;
  },
};

export default skillService;
