import api from './api';
import { AnalyticsOverview, RevenueByMonth, PopularVacation } from '../types';

export const analyticsService = {
  getOverview:          () => api.get<AnalyticsOverview>('/admin/analytics/overview'),
  getRevenueByMonth:    () => api.get<RevenueByMonth[]>('/admin/analytics/revenue-by-month'),
  getPopularVacations:  () => api.get<PopularVacation[]>('/admin/analytics/popular-vacations'),
};
