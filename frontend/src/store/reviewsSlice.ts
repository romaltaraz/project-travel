import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Review } from '../types';
import { reviewService } from '../services/reviewService';

interface ReviewsState {
  byVacation: Record<number, { reviews: Review[]; total: number; loading: boolean }>;
  submitting: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  byVacation: {},
  submitting: false,
  error: null,
};

export const fetchReviews = createAsyncThunk(
  'reviews/fetch',
  async ({ vacationId, page = 1 }: { vacationId: number; page?: number }, { rejectWithValue }) => {
    try {
      const res = await reviewService.getByVacation(vacationId, page);
      return { vacationId, ...res.data } as { vacationId: number; reviews: Review[]; total: number };
    } catch {
      return rejectWithValue('Failed to load reviews');
    }
  },
);

export const submitReview = createAsyncThunk(
  'reviews/submit',
  async (
    data: { vacationId: number; rating: number; comment?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await reviewService.create(data.vacationId, { rating: data.rating, comment: data.comment });
      return { vacationId: data.vacationId, review: res.data.review as Review };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Failed to submit review');
    }
  },
);

export const editReview = createAsyncThunk(
  'reviews/edit',
  async (
    data: { reviewId: number; vacationId: number; rating: number; comment?: string },
    { rejectWithValue },
  ) => {
    try {
      await reviewService.update(data.reviewId, { rating: data.rating, comment: data.comment });
      return data;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Failed to edit review');
    }
  },
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async ({ reviewId, vacationId }: { reviewId: number; vacationId: number }, { rejectWithValue }) => {
    try {
      await reviewService.delete(reviewId);
      return { reviewId, vacationId };
    } catch {
      return rejectWithValue('Failed to delete review');
    }
  },
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchReviews.pending, (state, action) => {
        const vid = action.meta.arg.vacationId;
        const existing = state.byVacation[vid];
        state.byVacation[vid] = { reviews: existing?.reviews ?? [], total: existing?.total ?? 0, loading: true };
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        const { vacationId, reviews, total } = action.payload;
        state.byVacation[vacationId] = { reviews, total, loading: false };
      })
      .addCase(submitReview.pending,   state => { state.submitting = true; state.error = null; })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitting = false;
        const { vacationId, review } = action.payload;
        if (state.byVacation[vacationId]) {
          state.byVacation[vacationId].reviews.unshift(review);
          state.byVacation[vacationId].total++;
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      .addCase(editReview.fulfilled, (state, action) => {
        const { reviewId, vacationId, rating, comment } = action.payload;
        const list = state.byVacation[vacationId]?.reviews;
        if (list) {
          const r = list.find(x => x.id === reviewId);
          if (r) { r.rating = rating; r.comment = comment; }
        }
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        const { reviewId, vacationId } = action.payload;
        const vac = state.byVacation[vacationId];
        if (vac) {
          vac.reviews = vac.reviews.filter(r => r.id !== reviewId);
          vac.total   = Math.max(0, vac.total - 1);
        }
      });
  },
});

export const { clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;
