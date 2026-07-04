import api from './api';
import { AnalyticsOverview, RevenueByMonth, PopularVacation } from '../types';

export interface LikesReportRow {
  destination: string;
  likesCount: number;
}

export const analyticsService = {
  getOverview:          () => api.get<AnalyticsOverview>('/admin/analytics/overview'),
  getRevenueByMonth:    () => api.get<RevenueByMonth[]>('/admin/analytics/revenue-by-month'),
  getPopularVacations:  () => api.get<PopularVacation[]>('/admin/analytics/popular-vacations'),
  getLikesReport:       () => api.get<LikesReportRow[]>('/reports/likes'),
  exportLikesCsv:       () => api.get('/reports/likes/csv', { responseType: 'blob' }),
  exportPdf:            () => api.get('/reports/export/pdf', { responseType: 'blob' }),
};
