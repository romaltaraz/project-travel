import React from 'react';

interface Props {
  value: number;       // 0–5, can be fractional for display
  max?: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

const StarRating: React.FC<Props> = ({ value, max = 5, interactive, onChange, size = 'md' }) => {
  const cls = sizes[size];
  return (
    <div className="flex gap-0.5" role={interactive ? 'radiogroup' : undefined}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={`${cls} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            aria-label={interactive ? `Rate ${i + 1} star${i > 0 ? 's' : ''}` : undefined}
          >
            <svg viewBox="0 0 20 20" fill={filled ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
