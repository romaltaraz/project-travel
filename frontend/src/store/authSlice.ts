import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

function loadFromStorage(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) return { token, user: JSON.parse(userStr) };
  } catch { /* ignore */ }
  return { user: null, token: null };
}

const { user: storedUser, token: storedToken } = loadFromStorage();

const initialState: AuthState = {
  user:    storedUser,
  token:   storedToken,
  loading: false,
  error:   null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (data: { firstName: string; lastName: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res.data as { token: string; user: User };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Registration failed');
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.login(data);
      return res.data as { token: string; user: User };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      return rejectWithValue(e.response?.data?.error || 'Login failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: builder => {
    const handlePending   = (state: AuthState) => { state.loading = true; state.error = null; };
    const handleFulfilled = (state: AuthState, action: PayloadAction<{ token: string; user: User }>) => {
      state.loading = false;
      state.token   = action.payload.token;
      state.user    = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    };
    const handleRejected  = (state: AuthState, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error   = action.payload as string;
    };
    builder
      .addCase(register.pending,   handlePending)
      .addCase(register.fulfilled, handleFulfilled)
      .addCase(register.rejected,  handleRejected)
      .addCase(login.pending,      handlePending)
      .addCase(login.fulfilled,    handleFulfilled)
      .addCase(login.rejected,     handleRejected);
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
