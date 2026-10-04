import api from './api';

export const profileService = {
  async getMyProfile() {
    const response = await api.get('/profile/me');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/profile/me', data);
    return response.data;
  },

  async getMySkills() {
    const response = await api.get('/profile/skills');
    return response.data;
  },

  async addSkill(skillData) {
    const response = await api.post('/profile/skills', skillData);
    return response.data;
  },

  async removeSkill(id) {
    await api.delete(`/profile/skills/${id}`);
  },

  async getPublicMember(id) {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },
};

export default profileService;
