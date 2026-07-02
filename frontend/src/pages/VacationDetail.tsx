import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchReviews, submitReview } from '../store/reviewsSlice';
import { likeVacation, unlikeVacation } from '../store/vacationsSlice';
import { addToast } from '../store/uiSlice';
import { vacationService } from '../services/vacationService';
import { Vacation } from '../types';
import { getImageUrl } from '../services/api';
import StarRating from '../components/Common/StarRating';
import ReviewForm from '../components/Reviews/ReviewForm';
import ReviewList from '../components/Reviews/ReviewList';
import BookingModal from '../components/Booking/BookingModal';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const fmtDate = (d: string) => {
  const [y, m, day] = (d ?? '').split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const VacationDetail: React.FC = () => {
  const { id }       = useParams<{ id: string }>();
  const dispatch     = useDispatch<AppDispatch>();
  const navigate     = useNavigate();
  const { user }     = useSelector((s: RootState) => s.auth);
  const reviewState  = useSelector((s: RootState) => s.reviews.byVacation[Number(id)]);
  const { submitting } = useSelector((s: RootState) => s.reviews);

  const [vacation,     setVacation]     = useState<Vacation | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [imgError,     setImgError]     = useState(false);
  const [showBooking,  setShowBooking]  = useState(false);

  const vacId = Number(id);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await vacationService.getById(vacId);
        setVacation(res.data);
      } catch { navigate('/vacations'); }
      finally   { setLoading(false); }
    };
    load();
    dispatch(fetchReviews({ vacationId: vacId }));
  }, [vacId, dispatch, navigate]);

  const isAdmin  = user?.role === 'admin';
  const reviews  = reviewState?.reviews ?? [];
  const myReview = reviews.find(r => r.userId === user?.id);
  const hue      = (vacation?.destination ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  const handleLike = async () => {
    if (!vacation || isAdmin) return;
    try {
      if (vacation.likedByMe) {
        const r = await dispatch(unlikeVacation(vacation.id)).unwrap();
        setVacation(r);
      } else {
        const r = await dispatch(likeVacation(vacation.id)).unwrap();
        setVacation(r);
      }
    } catch (err) {
      dispatch(addToast({ message: String(err), type: 'error' }));
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    try {
      await dispatch(submitReview({ vacationId: vacId, rating, comment })).unwrap();
      dispatch(addToast({ message: 'Review submitted!', type: 'success' }));
    } catch (err) {
      dispatch(addToast({ message: String(err), type: 'error' }));
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" /></div>;
  if (!vacation) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline mb-6 flex items-center gap-1 cursor-pointer">
        ← Back
      </button>

      {/* Hero image */}
      <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 mb-6">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold" style={{ background: `linear-gradient(135deg, hsl(${hue},60%,50%), hsl(${(hue+40)%360},60%,40%))` }}>
            {vacation.destination.charAt(0)}
          </div>
        ) : (
          <img src={getImageUrl(vacation.imageFileName)} alt={vacation.destination} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        )}
      </div>

      {/* Title + meta */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white mb-1">{vacation.destination}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{fmtDate(vacation.startDate)} — {fmtDate(vacation.endDate)}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating value={vacation.averageRating} />
            <span className="text-sm text-gray-500">({vacation.reviewsCount} reviews)</span>
            <span className="text-sm text-gray-400">· {vacation.likesCount} likes</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="text-3xl font-display font-extrabold text-accent-500">${vacation.price.toLocaleString()}</span>
          {!isAdmin && (
            <div className="flex gap-2">
              <button onClick={handleLike}
                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${vacation.likedByMe ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-900/20 dark:border-rose-700 dark:text-rose-400' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-rose-300 hover:text-rose-500'}`}>
                {vacation.likedByMe ? '♥ Liked' : '♡ Like'}
              </button>
              <button onClick={() => setShowBooking(true)}
                className="px-5 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm hover:shadow-md cursor-pointer">
                Book Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">{vacation.description}</p>

      {/* AI Trip Planner link */}
      <div className="mb-8 bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-display font-bold text-primary-800 dark:text-primary-300">Plan this trip with AI</p>
          <p className="text-sm text-primary-600 dark:text-primary-400 mt-0.5">Get a personalised day-by-day itinerary</p>
        </div>
        <a href="/trip-planner"
          className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm flex-shrink-0">
          Plan My Trip
        </a>
      </div>

      {/* Reviews */}
      <section aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-xl font-display font-bold text-gray-900 dark:text-white mb-4">Reviews</h2>

        {!isAdmin && !myReview && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow p-5">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Write a review</h3>
            <ReviewForm onSubmit={handleReviewSubmit} loading={submitting} />
          </div>
        )}

        {!isAdmin && myReview && (
          <div className="mb-4 text-sm text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-700/40 rounded-xl px-4 py-2.5 font-medium">
            You've already reviewed this vacation. Find your review below to edit it.
          </div>
        )}

        <ReviewList reviews={reviews} vacationId={vacId} />
      </section>

      {showBooking && <BookingModal vacation={vacation} onClose={() => setShowBooking(false)} />}
    </div>
  );
};

export default VacationDetail;
