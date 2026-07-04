import React, { useState } from 'react';
import { Lock, CreditCard } from 'lucide-react';
import { PaymentDetails } from '../../types';

// Client-side Luhn check (mirrors the backend validation)
function luhn(n: string): boolean {
  const s = n.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(s)) return false;
  let sum = 0; let even = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = parseInt(s[i], 10);
    if (even) { d *= 2; if (d > 9) d -= 9; }
    sum += d; even = !even;
  }
  return sum % 10 === 0;
}

function validExpiry(e: string): boolean {
  const m = e.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const mon = parseInt(m[1], 10); const yr = parseInt(m[2], 10) + 2000;
  if (mon < 1 || mon > 12) return false;
  const now = new Date();
  return new Date(yr, mon - 1, 1) >= new Date(now.getFullYear(), now.getMonth(), 1);
}

function formatCardNumber(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

interface Props {
  onSubmit: (payment: PaymentDetails) => void;
  loading?: boolean;
}

const MockPaymentForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [cardNumber,     setCardNumber]     = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiry,         setExpiry]         = useState('');
  const [cvv,            setCvv]            = useState('');
  const [errors,         setErrors]         = useState<Record<string, string>>({});

  // Detect card brand from first digit
  const brand = cardNumber.startsWith('4') ? 'VISA'
    : cardNumber.startsWith('5') ? 'MASTERCARD'
    : cardNumber.startsWith('3') ? 'AMEX'
    : cardNumber.startsWith('6') ? 'DISCOVER' : '';

  const validate = () => {
    const e: Record<string, string> = {};
    const raw = cardNumber.replace(/\s/g, '');
    if (!luhn(raw))          e.cardNumber = 'Card number is invalid';
    if (!cardholderName.trim()) e.cardholderName = 'Cardholder name is required';
    if (!validExpiry(expiry)) e.expiry = 'Expiry is invalid or card has expired';
    if (!/^\d{3,4}$/.test(cvv)) e.cvv = 'CVV must be 3 or 4 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiry,
      cvv,
      cardholderName,
    });
  };

  const inputCls = (f: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 ${
      errors[f] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Demo notice */}
      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          <strong>Demo mode</strong> — no real payment is processed.<br/>
          Try card: <code className="font-mono font-bold">4242 4242 4242 4242</code>
        </span>
      </div>

      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Card Number {brand && <span className="ml-1 text-xs font-bold text-primary-600">{brand}</span>}
        </label>
        <input
          id="cardNumber"
          value={cardNumber}
          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
          className={inputCls('cardNumber')}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          inputMode="numeric"
          autoComplete="cc-number"
        />
        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
      </div>

      <div>
        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cardholder Name</label>
        <input
          id="cardholderName"
          value={cardholderName}
          onChange={e => setCardholderName(e.target.value)}
          className={inputCls('cardholderName').replace('font-mono', '')}
          placeholder="JOHN DOE"
          autoComplete="cc-name"
        />
        {errors.cardholderName && <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry (MM/YY)</label>
          <input
            id="expiry"
            value={expiry}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
              setExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
            }}
            className={inputCls('expiry')}
            placeholder="MM/YY"
            maxLength={5}
            inputMode="numeric"
            autoComplete="cc-exp"
          />
          {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
        </div>
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
          <input
            id="cvv"
            value={cvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={inputCls('cvv')}
            placeholder="123"
            maxLength={4}
            inputMode="numeric"
            autoComplete="cc-csc"
          />
          {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 disabled:opacity-60 transition-colors text-base inline-flex items-center justify-center gap-2"
      >
        {loading ? 'Processing…' : <><CreditCard className="w-4 h-4" /> Pay & Confirm Booking</>}
      </button>
    </form>
  );
};

export default MockPaymentForm;
