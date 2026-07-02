import React, { useState } from 'react';
import StarRating from '../Common/StarRating';

interface Props {
  initialRating?: number;
  initialComment?: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

const ReviewForm: React.FC<Props> = ({
  initialRating = 0,
  initialComment = '',
  onSubmit,
  onCancel,
  submitLabel = 'Submit Review',
  loading,
}) => {
  const [rating,  setRating]  = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setError('Please select a star rating'); return; }
    setError('');
    await onSubmit(rating, comment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your rating</p>
        <StarRating value={rating} interactive onChange={setRating} size="lg" />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comment (optional)</label>
        <textarea
          id="comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Share your experience…"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-accent-500 text-white text-sm font-bold rounded-xl hover:bg-accent-600 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
