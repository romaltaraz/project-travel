import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Booking, PaymentDetails } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingsState {
  bookings: Booking[];
  lastCreated: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  lastCreated: null,
  loading: false,
  error: null,
};

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const res = await bookingService.getMyBookings();
      return res.data as Booking[];
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Failed to load bookings');
    }
  },
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (
    data: { vacationId: number; numTravelers: number; payment: PaymentDetails },
    { rejectWithValue },
  ) => {
    try {
      const res = await bookingService.create(data.vacationId, data.numTravelers, data.payment);
      return res.data.booking as Booking;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; details?: Record<string, string> } } };
      const msg = e.response?.data?.error || 'Booking failed';
      return rejectWithValue({ message: msg, details: e.response?.data?.details });
    }
  },
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id: number, { rejectWithValue }) => {
    try {
      await bookingService.cancel(id);
      return id;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Failed to cancel booking');
    }
  },
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearLastCreated(state) { state.lastCreated = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMyBookings.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading  = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })
      .addCase(createBooking.pending, state => { state.loading = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading     = false;
        state.lastCreated = action.payload;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error   = (action.payload as { message: string }).message;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const booking = state.bookings.find(b => b.id === action.payload);
        if (booking) booking.status = 'cancelled';
      });
  },
});

export const { clearLastCreated, clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
