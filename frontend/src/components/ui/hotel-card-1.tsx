import * as React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Star, MapPin, Wifi, Waves, Coffee, Check, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface HotelCardProps {
  images: string[];
  name: string;
  city: string;
  starRating: number;
  guestScore: number;
  reviewsCount: number;
  pricePerNight: number;
  freeCancellation: boolean;
  amenities: string[];
  liked?: boolean;
  onToggleLike?: () => void;
  className?: string;
}

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Free WiFi': Wifi,
  'Pool': Waves,
  'Breakfast included': Coffee,
};

const SWIPE_THRESHOLD = 60;

const PhotoGallery: React.FC<{
  images: string[];
  name: string;
  freeCancellation: boolean;
  liked?: boolean;
  onToggleLike?: () => void;
}> = ({
  images,
  name,
  freeCancellation,
  liked,
  onToggleLike,
}) => {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);

  const go = (delta: number) => {
    setDirection(delta);
    setIndex(i => (i + delta + images.length) % images.length);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) go(1);
    else if (info.offset.x > SWIPE_THRESHOLD) go(-1);
  };

  return (
    <div className="relative h-40 overflow-hidden bg-muted">
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={index}
          src={images[index]}
          alt={`${name} — photo ${index + 1} of ${images.length}`}
          className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
          custom={direction}
          initial={{ x: direction >= 0 ? '100%' : '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction >= 0 ? '-100%' : '100%', opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          drag={images.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={handleDragEnd}
        />
      </AnimatePresence>

      {freeCancellation && (
        <span className="absolute top-3 left-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary-600 text-white shadow">
          Free cancellation
        </span>
      )}

      {onToggleLike && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggleLike(); }}
          aria-label={liked ? `Unlike ${name}` : `Like ${name}`}
          aria-pressed={liked}
          className={cn(
            'absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full border backdrop-blur-md shadow transition-all cursor-pointer',
            liked ? 'bg-red-500/90 border-red-400/50 text-white' : 'bg-white/20 border-white/30 text-white hover:bg-white/35'
          )}
        >
          <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
        </button>
      )}

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={e => { e.stopPropagation(); go(-1); }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={e => { e.stopPropagation(); go(1); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-3 bg-white' : 'w-1.5 bg-white/50'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const HotelCard = React.forwardRef<HTMLDivElement, HotelCardProps>(
  (
    {
      images,
      name,
      city,
      starRating,
      guestScore,
      reviewsCount,
      pricePerNight,
      freeCancellation,
      amenities,
      liked,
      onToggleLike,
      className,
    },
    ref
  ) => {
    const bookingUrl = `https://www.booking.com/searchresults.he.html?ss=${encodeURIComponent(`${name}, ${city}`)}`;

    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          when: 'beforeChildren',
          staggerChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'max-w-sm w-full font-sans rounded-2xl overflow-hidden shadow-lg bg-card border border-border',
          className
        )}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
      >
        <PhotoGallery
          images={images}
          name={name}
          freeCancellation={freeCancellation}
          liked={liked}
          onToggleLike={onToggleLike}
        />

        <div className="p-6 pt-4">
          {/* Name + Location */}
          <motion.div variants={itemVariants}>
            <p className="text-lg font-bold text-card-foreground leading-snug">{name}</p>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {city}
            </div>
          </motion.div>

          {/* Stars + Guest score */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5',
                    i < starRating ? 'fill-primary-500 text-primary-500' : 'text-border'
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white bg-primary-600 rounded-md px-1.5 py-0.5">
                {guestScore.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">({reviewsCount.toLocaleString()} reviews)</span>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVariants} className="border-t border-dashed border-border my-4" />

          {/* Amenities */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-x-4 gap-y-2">
            {amenities.map(a => {
              const Icon = AMENITY_ICONS[a] ?? Check;
              return (
                <span key={a} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary-500" />
                  {a}
                </span>
              );
            })}
          </motion.div>

          {/* Price */}
          <motion.div
            variants={itemVariants}
            className="flex items-end justify-between mt-5 pt-5 border-t border-border"
          >
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Per night</p>
              <p className="text-2xl font-extrabold text-primary-500">${pricePerNight.toLocaleString()}</p>
            </div>
          </motion.div>

          {/* Book on Booking.com */}
          <motion.a
            variants={itemVariants}
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold transition-colors"
          >
            Book on Booking.com
          </motion.a>
        </div>
      </motion.div>
    );
  }
);

HotelCard.displayName = 'HotelCard';
