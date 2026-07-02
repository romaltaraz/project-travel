import React, { useEffect, useState } from 'react';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { addToast } from '../../store/uiSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';

interface AdminBooking {
  id: number;
  userId: number;
  vacationId: number;
  numTravelers: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  bookingReference: string;
  createdAt: string;
  destination?: string;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
}

const AdminBookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  const load = async (status?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> | undefined = status ? { status } : undefined;
      const res = await bookingService.adminGetAll(params);
      setBookings(res.data);
    } catch {
      dispatch(addToast({ message: 'Failed to load bookings', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(statusFilter || undefined); }, [statusFilter]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await bookingService.adminUpdate(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as 'confirmed' | 'cancelled' } : b));
      dispatch(addToast({ message: 'Booking updated', type: 'success' }));
    } catch {
      dispatch(addToast({ message: 'Failed to update booking', type: 'error' }));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Bookings</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none">
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && <LoadingSpinner size="lg" className="py-20" />}

      {!loading && bookings.length === 0 && (
        <p className="text-center text-gray-400 py-20">No bookings found.</p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="overflow-x-auto rounded-2xl shadow">
          <table className="w-full text-sm bg-white dark:bg-gray-800">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3 text-center">Travelers</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.bookingReference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{b.userFirstName} {b.userLastName}</p>
                    <p className="text-xs text-gray-400">{b.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.destination}</td>
                  <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{b.numTravelers}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary-600 dark:text-primary-400">
                    ${Number(b.totalPrice).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      disabled={updating === b.id}
                      onChange={e => handleStatusChange(b.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                        b.status === 'confirmed'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-gray-100 border-gray-200 text-gray-500'
                      }`}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
