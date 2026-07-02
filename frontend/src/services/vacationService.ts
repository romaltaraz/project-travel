import api from './api';

export const vacationService = {
  getAll: (params: Record<string, string | number | boolean>) =>
    api.get('/vacations', { params }),
  getById: (id: number) => api.get(`/vacations/${id}`),
  create: (formData: FormData) =>
    api.post('/vacations', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, formData: FormData) =>
    api.put(`/vacations/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: number) => api.delete(`/vacations/${id}`),
  like:   (id: number) => api.post(`/vacations/${id}/like`),
  unlike: (id: number) => api.delete(`/vacations/${id}/like`),
};
