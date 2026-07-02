import api from './api';

export const reviewService = {
  getByVacation: (vacationId: number, page = 1) =>
    api.get(`/vacations/${vacationId}/reviews`, { params: { page } }),
  create: (vacationId: number, data: { rating: number; comment?: string }) =>
    api.post(`/vacations/${vacationId}/reviews`, data),
  update: (reviewId: number, data: { rating: number; comment?: string }) =>
    api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
};
