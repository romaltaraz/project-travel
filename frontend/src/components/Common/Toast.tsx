/**
 * Toast notification system — inspired by 21st.dev "stacked toast" pattern.
 * Uses framer-motion for slide-in/out, aria-live for screen readers, SVG icons.
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState, AppDispatch } from '../../store';
import { removeToast } from '../../store/uiSlice';

const CheckIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
  </svg>
);
const XIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const InfoIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const config = {
  success: { icon: <CheckIcon />, bg: 'bg-emerald-500',  border: 'border-emerald-400' },
  error:   { icon: <XIcon />,     bg: 'bg-red-500',      border: 'border-red-400'     },
  info:    { icon: <InfoIcon />,  bg: 'bg-primary-500',     border: 'border-primary-400'    },
};

const ToastItem: React.FC<{ id: string; message: string; type: 'success' | 'error' | 'info' }> = ({ id, message, type }) => {
  const dispatch = useDispatch<AppDispatch>();
  const c = config[type];

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(id)), 4500);
    return () => clearTimeout(timer);
  }, [id, dispatch]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{ opacity: 0, y: -8, scale: 0.92,   transition: { duration: 0.18 } }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`flex items-start gap-3 px-4 py-3 rounded-xl text-white shadow-lg min-w-[280px] max-w-sm border ${c.bg} ${c.border}`}
    >
      <span className="mt-0.5">{c.icon}</span>
      <p className="text-sm flex-1 leading-snug">{message}</p>
      <button
        onClick={() => dispatch(removeToast(id))}
        className="text-white/70 hover:text-white transition-colors flex-shrink-0 cursor-pointer mt-0.5"
        aria-label="Dismiss notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </motion.div>
  );
};

const ToastContainer: React.FC = () => {
  const toasts = useSelector((s: RootState) => s.ui.toasts);
  return (
    <div
      className="fixed bottom-24 end-4 z-50 flex flex-col gap-2 sm:bottom-6"
      aria-label="Notifications"
      aria-relevant="additions"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(t => <ToastItem key={t.id} {...t} />)}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
