import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchMyBookings, cancelBooking } from '../store/bookingsSlice';
import { addToast } from '../store/uiSlice';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getImageUrl } from '../services/api';
import { Booking } from '../types';
import { ArrowRight } from 'lucide-react';

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
  </svg>
);
const UsersIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
  </svg>
);
const XIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const FilterIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"/>
  </svg>
);
const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
  </svg>
);
const GridIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="8" height="8" rx="2"/>
    <rect x="13" y="3" width="8" height="8" rx="2"/>
    <rect x="3" y="13" width="8" height="8" rx="2"/>
    <rect x="13" y="13" width="8" height="8" rx="2"/>
  </svg>
);
const ListViewIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);

const daysBetween = (startRaw?: string, endRaw?: string): number => {
  if (!startRaw || !endRaw) return 0;
  const [sy, sm, sd] = startRaw.split('T')[0].split('-').map(Number);
  const [ey, em, ed] = endRaw.split('T')[0].split('-').map(Number);
  return Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000);
};

const IMAGE_SLUGS: Record<string, string> = {
  'rome': 'rome-italy',
  'amalfi': 'amalfi-italy',
  'paris': 'paris-france', 'france': 'paris-france',
  'tokyo': 'tokyo-japan',
  'kyoto': 'kyoto-japan',
  'bali': 'bali-indonesia', 'indonesia': 'bali-indonesia',
  'santorini': 'santorini-greece', 'greece': 'santorini-greece',
  'barcelona': 'barcelona-spain', 'spain': 'barcelona-spain',
  'new york': 'new-york-usa', 'usa': 'new-york-usa',
  'maldives': 'maldives',
  'sydney': 'sydney-australia', 'australia': 'sydney-australia',
  'cape town': 'cape-town-south-africa', 'south africa': 'cape-town-south-africa',
  'machu picchu': 'machu-picchu-peru', 'peru': 'machu-picchu-peru',
  'dubai': 'dubai-uae', 'uae': 'dubai-uae',
  'amsterdam': 'amsterdam-netherlands', 'netherlands': 'amsterdam-netherlands',
  'reykjavik': 'reykjavik-iceland', 'iceland': 'reykjavik-iceland',
  'phuket': 'phuket-thailand', 'thailand': 'phuket-thailand',
  'havana': 'havana-cuba', 'cuba': 'havana-cuba',
  'marrakech': 'marrakech-morocco', 'morocco': 'marrakech-morocco',
  'queenstown': 'queenstown-newzealand', 'new zealand': 'queenstown-newzealand',
  'lisbon': 'lisbon-portugal', 'portugal': 'lisbon-portugal',
  'patagonia': 'patagonia-argentina', 'argentina': 'patagonia-argentina',
};
function getBookingImage(dest: string): string | null {
  const lc = dest.toLowerCase();
  for (const [key, slug] of Object.entries(IMAGE_SLUGS)) {
    if (lc.includes(key)) return getImageUrl(`${slug}.jpg`);
  }
  return null;
}

const BookingRow: React.FC<{ booking: Booking; view: 'grid' | 'list' }> = ({ booking, view }) => {
  const dispatch = useDispatch<AppDispatch>();
  const today = new Date().toISOString().split('T')[0];
  const canCancel = booking.status === 'confirmed' && (booking.startDate ?? booking.vacation?.startDate ?? '') > today;

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await dispatch(cancelBooking(booking.id)).unwrap();
      dispatch(addToast({ message: 'Booking cancelled', type: 'info' }));
    } catch (err) {
      dispatch(addToast({ message: String(err), type: 'error' }));
    }
  };

  const dest  = booking.destination ?? booking.vacation?.destination ?? '—';
  const fmtD = (d?: string) => {
    if (!d) return '—';
    const [y, m, day] = d.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const start = fmtD(booking.startDate ?? booking.vacation?.startDate);
  const end   = fmtD(booking.endDate   ?? booking.vacation?.endDate);
  const isConfirmed = booking.status === 'confirmed';

  const endDate = booking.endDate ?? booking.vacation?.endDate ?? '';
  const isPast = endDate < today || booking.status !== 'confirmed';
  const imgUrl = getBookingImage(dest);

  if (view === 'list') {
    const nights = daysBetween(booking.startDate ?? booking.vacation?.startDate, booking.endDate ?? booking.vacation?.endDate);
    return (
      <div className={`flex items-center gap-4 py-3 ${isPast ? 'opacity-75' : ''}`}>
        {imgUrl ? (
          <img src={imgUrl} alt={dest} className="w-[68px] h-[52px] rounded-[10px] object-cover flex-shrink-0" />
        ) : (
          <div className="w-[68px] h-[52px] rounded-[10px] flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-sm">
            {dest.charAt(0)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className={`font-bold text-[15px] text-gray-900 dark:text-white truncate ${!isConfirmed ? 'line-through' : ''}`}>
            {dest}
          </p>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><CalendarIcon /> {start} – {end}</span>
            <span className="flex items-center gap-1"><UsersIcon /> {booking.numTravelers}</span>
            <span className="flex items-center gap-1"><CalendarIcon /> {nights} night{nights !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="font-bold text-primary-500 dark:text-primary-400">${booking.totalPrice.toLocaleString()}</span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isConfirmed
              ? 'bg-[rgb(240,253,240)] text-[#2f7f33] dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-[rgb(254,242,242)] text-[#dc2626] dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {isConfirmed ? <><CheckIcon /> Confirmed</> : <><XIcon /> Cancelled</>}
          </span>
        </div>
      </div>
    );
  }

  if (imgUrl) {
    return (
      <div className={`relative rounded-2xl overflow-hidden h-48 cursor-pointer group shadow-md hover:shadow-xl transition-all hover:-translate-y-1 ${isPast ? 'opacity-70 grayscale-[0.4]' : ''}`}>
        <img src={imgUrl} alt={dest} className="w-full h-full object-cover"/>
        {/* Static bottom overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-4 group-hover:opacity-0 transition-opacity">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white font-bold text-lg">{dest}</p>
              <p className="text-white/75 text-xs mt-0.5">{start} – {end}</p>
            </div>
            <span className="text-white font-extrabold text-xl">${booking.totalPrice.toLocaleString()}</span>
          </div>
        </div>
        {/* Hover overlay with details */}
        <div className={`absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-center ${
          isConfirmed ? 'bg-primary-600/88' : 'bg-gray-700/88'
        }`}>
          <span className="text-white font-extrabold text-2xl">${booking.totalPrice.toLocaleString()}</span>
          <span className="text-white/90 text-sm">{booking.numTravelers} traveler{booking.numTravelers > 1 ? 's' : ''}</span>
          <span className="text-white/90 text-sm">{start} – {end}</span>
          <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
            {isConfirmed ? <><CheckIcon /> Confirmed</> : <><XIcon /> Cancelled</>}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700/60 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isPast ? 'opacity-70 grayscale-[0.4]' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-gray-900 dark:text-white text-lg truncate">{dest}</p>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <CalendarIcon />
          <span>{start} – {end}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          <UsersIcon />
          <span>{booking.numTravelers} traveler{booking.numTravelers > 1 ? 's' : ''}</span>
        </div>
        <p className="font-mono text-xs text-gray-400 dark:text-gray-600 mt-1.5">Ref: {booking.bookingReference}</p>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-2xl font-display font-extrabold text-primary-600 dark:text-primary-400">
          ${booking.totalPrice.toLocaleString()}
        </span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
          isConfirmed
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400'
        }`}>
          {isConfirmed ? <><CheckIcon /> Confirmed</> : <><XIcon /> Cancelled</>}
        </span>
        {canCancel && (
          <button onClick={handleCancel} className="text-xs text-red-500 hover:text-red-600 hover:underline cursor-pointer font-medium">
            Cancel booking
          </button>
        )}
      </div>
    </div>
  );
};

const BookingListSection: React.FC<{ bookings: Booking[]; view: 'grid' | 'list' }> = ({ bookings, view }) =>
  view === 'grid' ? (
    <div className="space-y-4">{bookings.map(b => <BookingRow key={b.id} booking={b} view={view} />)}</div>
  ) : (
    <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
      {bookings.map(b => <BookingRow key={b.id} booking={b} view={view} />)}
    </div>
  );

const MyBookings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading, error } = useSelector((s: RootState) => s.bookings);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'destination'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => { dispatch(fetchMyBookings()); }, [dispatch]);

  const today    = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => (b.endDate ?? b.vacation?.endDate ?? '') >= today && b.status === 'confirmed');
  const past     = bookings.filter(b => !upcoming.includes(b));
  const sortedByDest = [...bookings].sort((a, b) =>
    (a.destination ?? a.vacation?.destination ?? '').localeCompare(b.destination ?? b.vacation?.destination ?? '')
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white mb-8">My Bookings</h1>

      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-0.5 p-[3px] rounded-[10px] bg-[rgb(237,233,222)] dark:bg-gray-800">
          {(['grid', 'list'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                view === v
                  ? 'bg-white dark:bg-gray-700 text-[#2f7f33] dark:text-primary-400 font-semibold shadow-sm'
                  : 'bg-transparent text-[rgb(138,136,128)] dark:text-gray-400 font-medium'
              }`}
            >
              {v === 'grid' ? <GridIcon /> : <ListViewIcon />}
              {v === 'grid' ? 'Grid' : 'List'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {[
          { id: 'all', label: 'הכל', icon: <FilterIcon /> },
          { id: 'upcoming', label: 'עתידיות', icon: <CalendarIcon /> },
          { id: 'past', label: 'עברו', icon: <ClockIcon /> },
          { id: 'destination', label: 'לפי יעד', icon: <MapPinIcon /> },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === f.id
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-200 hover:text-green-700'
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner size="lg" className="py-20" />}
      {error   && <p className="text-red-500 text-center py-10">{error}</p>}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 dark:text-gray-500 text-lg mb-5">No bookings yet.</p>
          <Link to="/vacations" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-2xl font-bold transition-colors shadow-sm">
            Browse Vacations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {filter === 'destination' && sortedByDest.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-display font-bold text-gray-700 dark:text-gray-300 mb-3">By Destination</h2>
          <BookingListSection bookings={sortedByDest} view={view} />
        </section>
      )}

      {(filter === 'all' || filter === 'upcoming') && upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-display font-bold text-gray-700 dark:text-gray-300 mb-3">Upcoming</h2>
          <BookingListSection bookings={upcoming} view={view} />
        </section>
      )}

      {(filter === 'all' || filter === 'past') && past.length > 0 && (
        <section>
          <h2 className="text-base font-display font-bold text-gray-700 dark:text-gray-300 mb-3">Past & Cancelled</h2>
          <BookingListSection bookings={past} view={view} />
        </section>
      )}
    </div>
  );
};

export default MyBookings;
