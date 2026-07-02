import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Vacation, VacationFilters, PaginatedVacations } from '../types';
import { vacationService } from '../services/vacationService';

interface VacationsState {
  vacations: Vacation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: VacationFilters;
  loading: boolean;
  error: string | null;
}

const initialState: VacationsState = {
  vacations: [],
  total: 0,
  page: 1,
  pageSize: 9,
  totalPages: 1,
  filters: { likedOnly: false, activeOnly: false, notStartedOnly: false },
  loading: false,
  error: null,
};

export const fetchVacations = createAsyncThunk(
  'vacations/fetchAll',
  async (params: { page: number; filters: VacationFilters }, { rejectWithValue }) => {
    try {
      const res = await vacationService.getAll({
        page: params.page,
        likedOnly:      params.filters.likedOnly,
        activeOnly:     params.filters.activeOnly,
        notStartedOnly: params.filters.notStartedOnly,
      });
      return res.data as PaginatedVacations;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Failed to load vacations');
    }
  },
);

export const likeVacation = createAsyncThunk(
  'vacations/like',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await vacationService.like(id);
      return res.data as Vacation;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Failed to like');
    }
  },
);

export const unlikeVacation = createAsyncThunk(
  'vacations/unlike',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await vacationService.unlike(id);
      return res.data as Vacation;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Failed to unlike');
    }
  },
);

const vacationsSlice = createSlice({
  name: 'vacations',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) { state.page = action.payload; },
    setFilters(state, action: PayloadAction<VacationFilters>) {
      state.filters = action.payload;
      state.page    = 1;
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchVacations.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchVacations.fulfilled, (state, action) => {
        state.loading    = false;
        state.vacations  = action.payload.vacations;
        state.total      = action.payload.total;
        state.page       = action.payload.page;
        state.pageSize   = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchVacations.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })
      // Update the vacation in the list after like/unlike
      .addCase(likeVacation.fulfilled, (state, action) => {
        const idx = state.vacations.findIndex(v => v.id === action.payload.id);
        if (idx !== -1) state.vacations[idx] = action.payload;
      })
      .addCase(unlikeVacation.fulfilled, (state, action) => {
        const idx = state.vacations.findIndex(v => v.id === action.payload.id);
        if (idx !== -1) state.vacations[idx] = action.payload;
      });
  },
});

export const { setPage, setFilters, clearError } = vacationsSlice.actions;
export default vacationsSlice.reducer;
