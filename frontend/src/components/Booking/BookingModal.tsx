import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Vacation, PaymentDetails } from '../../types';
import { createBooking, clearLastCreated } from '../../store/bookingsSlice';
import { AppDispatch, RootState } from '../../store';
import { addToast } from '../../store/uiSlice';
import MockPaymentForm from './MockPaymentForm';
import LoadingSpinner from '../Common/LoadingSpinner';

const fmtDate = (d: string) => {
  const [y, m, day] = (d ?? '').split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

interface Props {
  vacation: Vacation;
  onClose: () => void;
}

type Step = 'travelers' | 'payment' | 'success';

const BookingModal: React.FC<Props> = ({ vacation, onClose }) => {
  const dispatch     = useDispatch<AppDispatch>();
  const { loading, lastCreated } = useSelector((s: RootState) => s.bookings);
  const [step,         setStep]         = useState<Step>('travelers');
  const [numTravelers, setNumTravelers] = useState(1);

  const totalPrice = vacation.price * numTravelers;

  const handlePayment = async (payment: PaymentDetails) => {
    const result = await dispatch(createBooking({ vacationId: vacation.id, numTravelers, payment }));
    if (createBooking.fulfilled.match(result)) {
      setStep('success');
    } else {
      const payload = result.payload as { message: string; details?: Record<string, string> };
      dispatch(addToast({ message: payload?.message || 'Booking failed', type: 'error' }));
    }
  };

  const handleClose = () => {
    dispatch(clearLastCreated());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold dark:text-white">
              {step === 'success' ? 'Booking Confirmed!' : `Book — ${vacation.destination}`}
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none" aria-label="Close">×</button>
          </div>

          {/* Step 1 — Travelers */}
          {step === 'travelers' && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm space-y-1">
                <p className="font-medium text-gray-700 dark:text-gray-300">📅 {fmtDate(vacation.startDate)} – {fmtDate(vacation.endDate)}</p>
                <p className="text-gray-500">${vacation.price.toLocaleString()} per person</p>
              </div>

              <div>
                <label htmlFor="travelers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Travelers</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setNumTravelers(n => Math.max(1, n - 1))} className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 text-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Decrease">−</button>
                  <span id="travelers" className="text-2xl font-bold dark:text-white min-w-[2ch] text-center">{numTravelers}</span>
                  <button onClick={() => setNumTravelers(n => n + 1)} className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 text-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Increase">+</button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Total</span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">${totalPrice.toLocaleString()}</span>
              </div>

              <button onClick={() => setStep('payment')} className="w-full py-3 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-colors">
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">{numTravelers} traveler{numTravelers > 1 ? 's' : ''}</span>
                <span className="font-bold text-primary-700 dark:text-primary-300">${totalPrice.toLocaleString()}</span>
              </div>
              {loading && <div className="flex justify-center py-4"><LoadingSpinner /></div>}
              {!loading && (
                <>
                  <MockPaymentForm onSubmit={handlePayment} loading={loading} />
                  <button onClick={() => setStep('travelers')} className="w-full text-sm text-gray-500 hover:text-gray-700 py-2">← Back</button>
                </>
              )}
            </div>
          )}

          {/* Step 3 — Success */}
          {step === 'success' && lastCreated && (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <svg viewBox="0 0 100 100" className="w-24 h-24">
                  <style>{`
                    @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    @keyframes drawCheck { from { stroke-dashoffset: 60; } to { stroke-dashoffset: 0; } }
                    .circle-anim { transform-origin: 50px 50px; animation: scaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
                    .check-anim { stroke-dasharray: 60; stroke-dashoffset: 60; animation: drawCheck 0.4s ease-out 0.35s forwards; }
                  `}</style>
                  <circle className="circle-anim" cx="50" cy="50" r="46" fill="#22c55e" />
                  <polyline className="check-anim" points="28,52 43,67 72,35" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300">Your booking reference is:</p>
              <p className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400">{lastCreated.bookingReference}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {numTravelers} traveler{numTravelers > 1 ? 's' : ''} · ${lastCreated.totalPrice.toLocaleString()} total
              </p>
              <button onClick={handleClose} className="w-full py-3 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-colors">
                ✓ Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
