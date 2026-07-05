import api from './api';
import { TripPlan } from '../types';

export const aiService = {
  recommend: (destination: string) =>
    api.post<{ destination: string; tip: string }>('/ai/recommend', { destination }),

  tripPlan: (vacationId: number) =>
    api.post<TripPlan>('/ai/trip-plan', { vacationId }),

  semanticSearch: (query: string) =>
    api.post('/ai/semantic-search', { query }),

  generateVacationPhoto: (destination: string, page = 1) =>
    api.post<{ imageFileName: string; source: 'magnific' | 'wikimedia' | 'openverse' }>('/ai/vacation-photo', { destination, page }),
};
