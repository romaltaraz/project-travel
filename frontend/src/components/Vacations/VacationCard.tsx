import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Vacation } from '../../types';
import { AppDispatch, RootState } from '../../store';
import { likeVacation, unlikeVacation } from '../../store/vacationsSlice';
import { addToast } from '../../store/uiSlice';
import StarRating from '../Common/StarRating';
import { getImageUrl } from '../../services/api';
import { aiService } from '../../services/aiService';

const HeartSolid = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
const HeartOutline = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
  </svg>
);
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
  </svg>
);
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
  </svg>
);
const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.083 3.204-4.45 3.204-7.327a8.5 8.5 0 00-17 0c0 2.876 1.26 5.244 3.205 7.327a19.585 19.585 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
  </svg>
);

interface AdminActions {
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

interface Props {
  vacation: Vacation;
  adminActions?: AdminActions;
}

const VacationCard: React.FC<Props> = ({ vacation, adminActions }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((s: RootState) => s.auth);
  const { t }    = useTranslation();
  const cardRef  = useRef<HTMLDivElement>(null);

  const [imgError,   setImgError]   = useState(false);
  const [tip,        setTip]        = useState<string | null>(null);
  const [tipLoading, setTipLoading] = useState(false);
  const [tipOpen,    setTipOpen]    = useState(false);
  const [likeAnim,   setLikeAnim]   = useState(false);

  const rotateX = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const scale   = useSpring(useMotionValue(1),  { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    rotateX.set(-(((e.clientY - top) / height) - 0.5) * 8);
    rotateY.set( (((e.clientX - left) / width) - 0.5) * 8);
    scale.set(1.02);
  };
  const handleMouseLeave = () => { rotateX.set(0); rotateY.set(0); scale.set(1); };

  const isAdmin = user?.role === 'admin';

  //view details button transition gradient color
  const hue      = vacation.destination.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  let gradient = `linear-gradient(135deg, hsl(${hue},70%,50%), hsl(${(hue+60)%360},60%,28%))`;

  // Check if the generated hue is in the green range we want to replace
  if (hue >= 90 && hue <= 150) { // Approximate green range in HSL
    gradient = 'linear-gradient(135deg, rgb(192 255 208), rgb(19 70 52))';
  }

  // Thin border for the AI Tip button — a light tint of the View Details gradient's hue
  const tipBorderColor = (hue >= 90 && hue <= 150) ? 'rgb(192 255 208)' : `hsl(${hue}, 65%, 82%)`;

  const handleLike = async () => {
    if (isAdmin) return;
    try {
      if (vacation.likedByMe) {
        await dispatch(unlikeVacation(vacation.id)).unwrap();
      } else {
        await dispatch(likeVacation(vacation.id)).unwrap();
        setLikeAnim(true);
        setTimeout(() => setLikeAnim(false), 700);
      }
    } catch (err) {
      dispatch(addToast({ message: String(err), type: 'error' }));
    }
  };

  const handleQuickTip = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTipOpen(v => !v);
    if (!tip && !tipLoading) {
      setTipLoading(true);
      try {
        const res = await aiService.recommend(vacation.destination);
        setTip(res.data.tip);
      } catch {
        setTip('Could not load tip — please try again.');
      } finally {
        setTipLoading(false);
      }
    }
  };

  const fmt = (d: string) => {
    const [y, m, day] = (d ?? '').split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  return (
    <div ref={cardRef} style={{ perspective: 1000 }} className="h-full">
    <motion.article
      style={{ rotateX, rotateY, scale }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group will-change-transform relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-700/60 shadow-card hover:shadow-card-hover transition-shadow duration-300 h-full cursor-pointer"
    >
        {/* ── IMAGE ── */}
        <div className="relative h-56 flex-shrink-0 overflow-hidden rounded-t-2xl">
          {imgError ? (
            <div
              className="absolute inset-0 flex items-center justify-center text-white text-6xl font-extrabold font-display"
              style={{ background: gradient }}
            >
              {vacation.destination.charAt(0)}
            </div>
          ) : (
            <img
              src={getImageUrl(vacation.imageFileName)}
              alt={vacation.destination}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}

          {/* Gradient overlay — fades image bottom to dark */}
          <div className="absolute inset-0 bg-card-overlay" />

          {/* Travel month badge — top left */}
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm bg-black/55 text-white border-white/20 tracking-wide">
            {new Date(vacation.startDate.split('T')[0]).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
          </span>

          {/* Like button — top right */}
          {!isAdmin && (
            <div className="absolute top-3 right-3">
              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.75 }}
                className={`relative w-8 h-8 flex items-center justify-center rounded-full border backdrop-blur-md shadow transition-all cursor-pointer ${
                  vacation.likedByMe
                    ? 'bg-red-500/90 border-red-400/50 text-white'
                    : 'bg-white/20 border-white/30 text-white hover:bg-white/35'
                }`}
                aria-label={vacation.likedByMe ? t('vacations.unlike') : t('vacations.like')}
              >
                {vacation.likedByMe
                  ? <HeartSolid  className="w-4 h-4" />
                  : <HeartOutline className="w-4 h-4" />
                }
                <AnimatePresence>
                  {likeAnim && [0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-red-400"
                      initial={{ scale: 1, opacity: 0.9 }}
                      animate={{ scale: 2.6 + i * 0.5, opacity: 0 }}
                      exit={{}}
                      transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                    />
                  ))}
                </AnimatePresence>
              </motion.button>
            </div>
          )}

          {/* Bottom overlay: destination name + price */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5 pt-10 flex items-end justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <MapPinIcon className="w-4 h-4 flex-shrink-0 text-white/80 drop-shadow" />
              <h2 className="font-display font-bold text-white text-lg leading-tight line-clamp-1 drop-shadow">
                {vacation.destination}
              </h2>
            </div>
            <div
              className="flex-shrink-0 px-2.5 py-1 rounded-xl text-xs font-extrabold text-white shadow-lg"
              style={{ background: gradient }}
            >
              ${vacation.price.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex flex-col flex-1 p-4 gap-3">

          {/* Dates */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{fmt(vacation.startDate)} – {fmt(vacation.endDate)}</span>
          </div>

          {/* Description */}
          <p className="text-s text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1">
            {vacation.description}
          </p>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-700/50" />

          {/* Rating + likes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StarRating value={vacation.averageRating} size="sm" />
              <span className="text-xs text-gray-400">({vacation.reviewsCount})</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <HeartSolid className="w-3 h-3 text-red-400" />
              <span>{vacation.likesCount}</span>
            </div>
          </div>

          {/* Actions */}
          {adminActions ? (
            /* Admin: Edit + Delete */
            <div className="flex items-center gap-2">
              <button
                onClick={adminActions.onEdit}
                className="flex-1 text-xs font-bold py-2 rounded-xl border border-primary-300 dark:border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={adminActions.onDelete}
                disabled={adminActions.deleting}
                className="flex-1 text-xs font-bold py-2 rounded-xl border border-red-300 dark:border-red-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                {adminActions.deleting ? '…' : 'Delete'}
              </button>
            </div>
          ) : (
            /* User: View Details + AI Tip */
            <div className="flex items-center gap-2 relative">
              <Link
                to={`/vacations/${vacation.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 text-white rounded-xl transition-all shadow-sm hover:shadow-md hover:opacity-90"
                style={{ background: gradient }}
              >
                {t('vacations.viewDetails')}
                <ArrowRightIcon className="w-3 h-3" />
              </Link>

              <div className="relative">
                <button
                  onClick={handleQuickTip}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border rounded-xl hover:bg-green-100 dark:hover:bg-green-900/35 transition-colors cursor-pointer font-semibold"
                  style={{ borderColor: tipBorderColor }}
                  aria-label={t('vacations.aiTip')}
                  aria-expanded={tipOpen}
                >
                  <SparklesIcon className="w-3 h-3" />
                  AI Tip
                </button>

                <AnimatePresence>
                  {tipOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 6 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-violet-200 rounded-xl shadow-2xl p-3 z-30"
                      role="tooltip"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-violet-600 flex items-center gap-1">
                          <SparklesIcon className="w-3 h-3" />
                          {t('vacations.aiTipTitle')}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); setTipOpen(false); }}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                          aria-label={t('vacations.closeTip')}
                        >
                          <CloseIcon className="w-3 h-3" />
                        </button>
                      </div>
                      {tipLoading
                        ? <p className="text-xs text-gray-500 italic">{t('vacations.aiTipLoading')}</p>
                        : <p className="text-xs text-gray-700 leading-relaxed">{tip}</p>
                      }
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
    </motion.article>
    </div>
  );
};

export default VacationCard;
