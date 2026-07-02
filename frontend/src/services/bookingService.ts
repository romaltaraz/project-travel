import api from './api';
import { PaymentDetails } from '../types';

export const bookingService = {
  create: (vacationId: number, numTravelers: number, payment: PaymentDetails) =>
    api.post(`/vacations/${vacationId}/book`, { numTravelers, payment }),
  getMyBookings: () => api.get('/bookings/me'),
  cancel:  (id: number) => api.delete(`/bookings/${id}`),
  // Admin
  adminGetAll: (params?: Record<string, string>) => api.get('/admin/bookings', { params }),
  adminUpdate: (id: number, status: string) => api.put(`/admin/bookings/${id}`, { status }),
};
