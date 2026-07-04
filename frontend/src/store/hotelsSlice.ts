import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Hotel } from '../types';
import { hotelService } from '../services/hotelService';

interface HotelsState {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
}

const initialState: HotelsState = {
  hotels: [],
  loading: false,
  error: null,
};

export const fetchHotels = createAsyncThunk(
  'hotels/fetchAll',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await hotelService.getAll();
      return res.data as Hotel[];
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Failed to load hotels');
    }
  },
);

export const likeHotel = createAsyncThunk(
  'hotels/like',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await hotelService.like(id);
      return res.data as Hotel;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Failed to like');
    }
  },
);

export const unlikeHotel = createAsyncThunk(
  'hotels/unlike',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await hotelService.unlike(id);
      return res.data as Hotel;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Failed to unlike');
    }
  },
);

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchHotels.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(likeHotel.fulfilled, (state, action) => {
        const idx = state.hotels.findIndex(h => h.id === action.payload.id);
        if (idx !== -1) state.hotels[idx] = action.payload;
      })
      .addCase(unlikeHotel.fulfilled, (state, action) => {
        const idx = state.hotels.findIndex(h => h.id === action.payload.id);
        if (idx !== -1) state.hotels[idx] = action.payload;
      });
  },
});

export default hotelsSlice.reducer;
