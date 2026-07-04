import { configureStore } from '@reduxjs/toolkit';
import authReducer      from './authSlice';
import vacationsReducer from './vacationsSlice';
import hotelsReducer    from './hotelsSlice';
import bookingsReducer  from './bookingsSlice';
import reviewsReducer   from './reviewsSlice';
import aiChatReducer    from './aiChatSlice';
import uiReducer        from './uiSlice';

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    vacations: vacationsReducer,
    hotels:    hotelsReducer,
    bookings:  bookingsReducer,
    reviews:   reviewsReducer,
    aiChat:    aiChatReducer,
    ui:        uiReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
