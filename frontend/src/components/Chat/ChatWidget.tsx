/**
 * ChatWidget — inspired by 21st.dev "floating chat panel" pattern.
 * Full-screen on mobile (<640 px), side panel on desktop.
 * Uses framer-motion for open/close animation and aria-live for screen readers.
 */
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { toggleChat, addMessage, setLoading, setPendingBooking, clearMessages } from '../../store/aiChatSlice';
import api from '../../services/api';
import { PendingBooking } from '../../types';

const fmtDate = (d: string) => {
  const [y, m, day] = (d ?? '').split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// SVG icons
const ChatBubbleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
  </svg>
);
const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5 inline-block me-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

const QUICK_STARTS = [
  'What are the top-rated vacations?',
  'Book Barcelona for 2 people',
  "What's the average price?",
];

const ChatWidget: React.FC = () => {
  const dispatch   = useDispatch<AppDispatch>();
  const navigate   = useNavigate();
  const { t }      = useTranslation();
  const { isOpen, messages, loading, pendingBooking } = useSelector((s: RootState) => s.aiChat);
  const { user }   = useSelector((s: RootState) => s.auth);
  const [input, setInput] = React.useState('');
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingBooking, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  if (!user) return null;

  const sendMessage = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput('');
    dispatch(addMessage({ role: 'user', content: q }));
    dispatch(setLoading(true));
    dispatch(setPendingBooking(null));

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/mcp/ask', { question: q, history });
      const { answer, requiresConfirmation, pendingBooking: pb } = res.data;
      dispatch(addMessage({ role: 'assistant', content: answer || 'Done!' }));
      if (requiresConfirmation && pb) dispatch(setPendingBooking(pb as PendingBooking));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      dispatch(addMessage({
        role: 'assistant',
        content: e.response?.data?.error ?? 'Something went wrong. Please try again.',
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const confirmBooking = () => {
    if (!pendingBooking) return;
    dispatch(setPendingBooking(null));
    dispatch(addMessage({ role: 'assistant', content: `Taking you to the booking page for ${pendingBooking.destination}…` }));
    navigate(pendingBooking.deepLink);
  };

  const cancelBooking = () => {
    dispatch(setPendingBooking(null));
    dispatch(addMessage({ role: 'assistant', content: 'Booking cancelled. Let me know if you need anything else!' }));
  };

  return (
    <>
      {/* ── Launcher button ── */}
      <motion.button
        onClick={() => dispatch(toggleChat())}
        className="fixed bottom-6 end-6 z-40 w-14 h-14 bg-primary-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary-700 transition-colors cursor-pointer"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        aria-label={isOpen ? 'Close AI assistant' : t('chat.title')}
        aria-expanded={isOpen}
        aria-controls="chat-panel"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen
            ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><CloseIcon /></motion.span>
            : <motion.span key="open"  initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate:-90, opacity: 0 }} transition={{ duration: 0.15 }}><ChatBubbleIcon /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chat-panel"
            role="dialog"
            aria-label={t('chat.title')}
            aria-modal="false"
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0, scale: 0.93,    y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              fixed z-40 flex flex-col overflow-hidden
              bg-white dark:bg-gray-900 shadow-2xl
              border border-gray-200 dark:border-gray-700
              /* Mobile: full-screen */
              inset-0 rounded-none
              /* Desktop: side panel */
              sm:inset-auto sm:bottom-24 sm:end-6 sm:w-96 sm:max-h-[75vh] sm:rounded-2xl
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white flex-shrink-0">
              <div>
                <p className="font-semibold text-sm">{t('chat.title')}</p>
                <p className="text-xs text-white/70">Powered by NVIDIA NIM</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch(clearMessages())}
                  className="text-white/60 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label={t('chat.clear')}
                >
                  {t('chat.clear')}
                </button>
                <button
                  onClick={() => dispatch(toggleChat())}
                  className="text-white/70 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close chat"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Messages — aria-live for screen readers */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
              aria-live="polite"
              aria-label="Conversation"
            >
              {messages.length === 0 && (
                <div className="text-center py-6 space-y-3">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Ask me anything about vacations!
                  </p>
                  <div className="flex flex-col gap-2">
                    {QUICK_STARTS.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-gray-700 transition-colors text-start cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary-600 text-white rounded-ee-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-es-sm'
                    }`}
                  >
                    {m.content}
                  </motion.div>
                </div>
              ))}

              {/* Booking confirmation card */}
              {pendingBooking && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 rounded-xl p-3 space-y-3"
                >
                  <p className="text-sm font-semibold text-primary-900 dark:text-primary-200">
                    {t('chat.bookingProposal')}
                  </p>
                  <div className="text-xs text-primary-800 dark:text-primary-300 space-y-1">
                    <p><MapPinIcon /><strong>{pendingBooking.destination}</strong></p>
                    <p>{fmtDate(pendingBooking.startDate)} – {fmtDate(pendingBooking.endDate)}</p>
                    <p>{pendingBooking.numTravelers} traveler{pendingBooking.numTravelers > 1 ? 's' : ''}</p>
                    <p>Total: <strong>${pendingBooking.totalPrice.toLocaleString()}</strong></p>
                  </div>
                  <p className="text-xs text-primary-600 dark:text-primary-400 italic">
                    You'll complete payment on the next screen.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmBooking}
                      className="flex-1 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
                    >
                      {t('chat.confirmBooking')}
                    </button>
                    <button
                      onClick={cancelBooking}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                      {t('chat.cancelBooking')}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-es-sm">
                    <span className="inline-flex gap-1" aria-label={t('chat.typing')}>
                      {[0, 150, 300].map(delay => (
                        <span key={delay} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={t('chat.placeholder')}
                className="flex-1 px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 min-w-0"
                aria-label={t('chat.placeholder')}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 flex items-center justify-center bg-primary-600 text-white rounded-xl disabled:opacity-50 hover:bg-primary-700 transition-colors flex-shrink-0 cursor-pointer"
                aria-label={t('chat.send')}
              >
                <SendIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
