import api from './api';

export const hotelService = {
  getAll: () => api.get('/hotels'),
  like:   (id: number) => api.post(`/hotels/${id}/like`),
  unlike: (id: number) => api.delete(`/hotels/${id}/like`),
};
