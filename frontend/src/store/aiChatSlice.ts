import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, PendingBooking } from '../types';

interface AiChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  loading: boolean;
  pendingBooking: PendingBooking | null;
}

const initialState: AiChatState = {
  messages: [],
  isOpen: false,
  loading: false,
  pendingBooking: null,
};

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    toggleChat(state)  { state.isOpen = !state.isOpen; },
    openChat(state)    { state.isOpen = true; },
    closeChat(state)   { state.isOpen = false; },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) { state.loading = action.payload; },
    setPendingBooking(state, action: PayloadAction<PendingBooking | null>) {
      state.pendingBooking = action.payload;
    },
    clearMessages(state) {
      state.messages      = [];
      state.pendingBooking = null;
    },
  },
});

export const {
  toggleChat, openChat, closeChat,
  addMessage, setLoading, setPendingBooking, clearMessages,
} = aiChatSlice.actions;
export default aiChatSlice.reducer;
