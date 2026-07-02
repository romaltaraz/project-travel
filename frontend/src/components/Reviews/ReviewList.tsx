import React, { useState } from 'react';
import { Review } from '../../types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { editReview, deleteReview } from '../../store/reviewsSlice';
import { addToast } from '../../store/uiSlice';
import StarRating from '../Common/StarRating';
import ReviewForm from './ReviewForm';

interface Props {
  reviews: Review[];
  vacationId: number;
}

const ReviewList: React.FC<Props> = ({ reviews, vacationId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const [editing, setEditing] = useState<number | null>(null);

  const handleEdit = async (reviewId: number, rating: number, comment: string) => {
    try {
      await dispatch(editReview({ reviewId, vacationId, rating, comment })).unwrap();
      setEditing(null);
      dispatch(addToast({ message: 'Review updated', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: String(err), type: 'error' }));
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      await dispatch(deleteReview({ reviewId, vacationId })).unwrap();
      dispatch(addToast({ message: 'Review deleted', type: 'info' }));
    } catch (err) {
      dispatch(addToast({ message: String(err), type: 'error' }));
    }
  };

  if (!reviews.length) {
    return <p className="text-sm text-gray-400 dark:text-gray-500 italic">No reviews yet. Be the first!</p>;
  }

  return (
    <ul className="space-y-4">
      {reviews.map(r => (
        <li key={r.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          {editing === r.id ? (
            <ReviewForm
              initialRating={r.rating}
              initialComment={r.comment}
              onSubmit={(rating, comment) => handleEdit(r.id, rating, comment)}
              onCancel={() => setEditing(null)}
              submitLabel="Save"
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    {r.userFirstName} {r.userLastName}
                  </span>
                  <StarRating value={r.rating} size="sm" />
                </div>
                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.comment}</p>}
              {/* Own review actions */}
              {(user?.id === r.userId || user?.role === 'admin') && (
                <div className="flex gap-2 mt-2">
                  {user?.id === r.userId && (
                    <button
                      onClick={() => setEditing(r.id)}
                      className="text-xs text-primary-600 hover:underline"
                    >Edit</button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-xs text-red-500 hover:underline"
                  >Delete</button>
                </div>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default ReviewList;
