import api from './api';
import { AnalyticsOverview, RevenueByMonth, PopularVacation, BookingStatusBreakdown, RatingsByDestinationRow } from '../types';

export interface LikesReportRow {
  destination: string;
  likesCount: number;
}

export const analyticsService = {
  getOverview:             () => api.get<AnalyticsOverview>('/admin/analytics/overview'),
  getRevenueByMonth:       () => api.get<RevenueByMonth[]>('/admin/analytics/revenue-by-month'),
  getPopularVacations:     () => api.get<PopularVacation[]>('/admin/analytics/popular-vacations'),
  getBookingStatus:        () => api.get<BookingStatusBreakdown[]>('/admin/analytics/booking-status'),
  getRatingsByDestination: () => api.get<RatingsByDestinationRow[]>('/admin/analytics/ratings-by-destination'),
  getLikesReport:          () => api.get<LikesReportRow[]>('/reports/likes'),
  exportDestinationsCsv:   () => api.get('/reports/likes/csv', { responseType: 'blob' }),
  exportPdf:               () => api.get('/reports/export/pdf', { responseType: 'blob' }),
};
