import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Coffee, X, PackageOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Hotel } from '../types';
import { AppDispatch, RootState } from '../store';
import { fetchVacations, setPage, setFilters } from '../store/vacationsSlice';
import { fetchHotels, likeHotel, unlikeHotel } from '../store/hotelsSlice';
import VacationCard from '../components/Vacations/VacationCard';
import VacationFiltersBar from '../components/Vacations/VacationFilters';
import Pagination from '../components/Common/Pagination';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FlightCard, FlightCardProps } from '../components/ui/flight-card-1';
import { HotelCard } from '../components/ui/hotel-card-1';

// Flights from Tel Aviv (TLV) to popular vacation destinations
const FLIGHTS: (FlightCardProps & { id: string })[] = [
  {
    id: 'rome',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2070&auto=format&fit=crop',
    airline: 'El Al',
    flightCode: 'LY 386',
    flightClass: 'Economy',
    departureCode: 'TLV', departureCity: 'Tel Aviv', departureTime: '08:40 PM',
    arrivalCode: 'FCO',   arrivalCity: 'Rome',        arrivalTime: '12:10 AM +1',
    date: 'Sat, 15 Jun 2024',
    duration: '3h 30m · Direct',
    price: 290, operatingDays: 'Sun–Thu, Sat night',
  },
  {
    id: 'paris',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2070&auto=format&fit=crop',
    airline: 'El Al',
    flightCode: 'LY 324',
    flightClass: 'Economy',
    departureCode: 'TLV', departureCity: 'Tel Aviv', departureTime: '11:40 AM',
    arrivalCode: 'CDG',   arrivalCity: 'Paris',       arrivalTime: '04:20 PM',
    date: 'Fri, 14 Feb 2025',
    duration: '4h 40m · Direct',
    price: 380, operatingDays: 'Sun–Thu, Sat night',
  },
  {
    id: 'tokyo',
    imageUrl: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?q=80&w=2070&auto=format&fit=crop',
    airline: 'El Al',
    flightCode: 'LY 87',
    flightClass: 'Economy',
    departureCode: 'TLV', departureCity: 'Tel Aviv', departureTime: '11:55 PM',
    arrivalCode: 'NRT',   arrivalCity: 'Tokyo',       arrivalTime: '05:10 PM +1',
    date: 'Tue, 1 Apr 2025',
    duration: '11h 15m · Direct',
    price: 950, operatingDays: 'Sun–Thu, Sat night',
  },
  {
    id: 'bali',
    imageUrl: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?q=80&w=2070&auto=format&fit=crop',
    airline: 'Turkish Airlines',
    flightCode: 'TK 809',
    flightClass: 'Economy',
    departureCode: 'TLV', departureCity: 'Tel Aviv', departureTime: '02:15 AM',
    arrivalCode: 'DPS',   arrivalCity: 'Bali',        arrivalTime: '11:05 PM +1',
    date: 'Sat, 20 Jun 2026',
    duration: '18h 50m · 1 stop (IST)',
    price: 780, operatingDays: 'Daily',
  },
  {
    id: 'santorini',
    imageUrl: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=2070&auto=format&fit=crop',
    airline: 'Arkia',
    flightCode: 'IZ 251',
    flightClass: 'Economy',
    departureCode: 'TLV', departureCity: 'Tel Aviv', departureTime: '01:30 PM',
    arrivalCode: 'JTR',   arrivalCity: 'Santorini',   arrivalTime: '03:25 PM',
    date: 'Thu, 25 Jun 2026',
    duration: '1h 55m · Direct (seasonal)',
    price: 260, operatingDays: 'Daily (seasonal, incl. Shabbat)',
  },
  {
    id: 'barcelona',
    imageUrl: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=2070&auto=format&fit=crop',
    airline: 'El Al',
    flightCode: 'LY 393',
    flightClass: 'Economy',
    departureCode: 'TLV', departureCity: 'Tel Aviv', departureTime: '09:10 AM',
    arrivalCode: 'BCN',   arrivalCity: 'Barcelona',   arrivalTime: '01:45 PM',
    date: 'Fri, 10 Jul 2026',
    duration: '4h 35m · Direct',
    price: 340, operatingDays: 'Sun–Thu, Sat night',
  },
  {
    id: 'newyork',
    imageUrl: 'https://images.unsplash.com/photo-1499063078284-f78f7d89616a?q=80&w=2070&auto=format&fit=crop',
    airline: 'El Al',
    flightCode: 'LY 002',
    flightClass: 'Economy',
    departureCode: 'TLV', departureCity: 'Tel Aviv', departureTime: '09:30 PM',
    arrivalCode: 'JFK',   arrivalCity: 'New York',    arrivalTime: '08:45 AM +1',
    date: 'Sat, 1 Aug 2026',
    duration: '11h 15m · Direct',
    price: 720, operatingDays: 'Sun–Thu, Sat night',
  },
  {
    id: 'amsterdam',
    imageUrl: 'https://images.unsplash.com/photo-1499063078284-f78f7d89616a?q=80&w=2070&auto=format&fit=crop',
    airline: 'El Al',
    flightCode: 'LY 335',
    flightClass: 'Economy',
    departureCode: 'TLV', departureCity: 'Tel Aviv', departureTime: '08:00 AM',
    arrivalCode: 'AMS',   arrivalCity: 'Amsterdam',   arrivalTime: '12:50 PM',
    date: 'Sun, 1 Nov 2026',
    duration: '4h 50m · Direct',
    price: 360, operatingDays: 'Sun–Thu, Sat night',
  },
];

// Staggered grid container + card item variants
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1,   transition: { duration: 0.28, ease: 'easeOut' } },
};

const Vacations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { vacations, page, totalPages, filters, loading, error } = useSelector((s: RootState) => s.vacations);
  const { hotels, loading: hotelsLoading, error: hotelsError } = useSelector((s: RootState) => s.hotels);
  const { t } = useTranslation();
  const [vacationType, setVacationType] = useState<'packages' | 'hotels' | 'flights' | 'bundle'>('packages');
  const [hotelSearch, setHotelSearch] = useState('');
  const [hotelFilters, setHotelFilters] = useState({ likedOnly: false, freeCancellationOnly: false, breakfastOnly: false });

  useEffect(() => {
    dispatch(fetchVacations({ page, filters }));
  }, [dispatch, page, filters]);

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  const toggleHotelLike = (h: Hotel) =>
    dispatch(h.likedByMe ? unlikeHotel(h.id) : likeHotel(h.id));

  const filteredHotels = hotels.filter(h =>
    (h.city.toLowerCase().includes(hotelSearch.trim().toLowerCase()) ||
      h.name.toLowerCase().includes(hotelSearch.trim().toLowerCase())) &&
    (!hotelFilters.likedOnly || h.likedByMe) &&
    (!hotelFilters.freeCancellationOnly || h.freeCancellation) &&
    (!hotelFilters.breakfastOnly || h.amenities.includes('Breakfast included'))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white">{t('vacations.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover your next adventure</p>
        </div>
        {vacationType === 'hotels' ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Hotel filters">
            {[
              { key: 'likedOnly' as const,             icon: <Heart className="w-3.5 h-3.5" fill={hotelFilters.likedOnly ? 'currentColor' : 'none'} />, label: 'Liked' },
              { key: 'freeCancellationOnly' as const,  icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Free cancellation' },
              { key: 'breakfastOnly' as const,          icon: <Coffee className="w-3.5 h-3.5" />, label: 'Breakfast included' },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setHotelFilters(f => ({ ...f, [key]: !f[key] }))}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  hotelFilters[key]
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
                aria-pressed={hotelFilters[key]}
              >
                {icon}
                {label}
              </button>
            ))}
            {(hotelFilters.likedOnly || hotelFilters.freeCancellationOnly || hotelFilters.breakfastOnly) && (
              <button
                onClick={() => setHotelFilters({ likedOnly: false, freeCancellationOnly: false, breakfastOnly: false })}
                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        ) : (
          <VacationFiltersBar filters={filters} onChange={f => dispatch(setFilters(f))} />
        )}
      </div>

      {loading && <div className="py-20"><LoadingSpinner size="lg" /></div>}
      {error   && <p className="text-center text-red-500 py-10">{error}</p>}

      {!loading && !error && vacations.length === 0 && (
        <p className="text-center text-gray-400 dark:text-gray-500 py-20 text-lg">
          {t('vacations.noResults')}
        </p>
      )}

      {!loading && vacations.length > 0 && (
        <>
          <div className="flex gap-1.5 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible">
            {[
              { id: 'packages', label: 'Vacations', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25M12 12.75h.008v.008H12v-.008zM3.75 9h16.5a1.5 1.5 0 011.5 1.5v1.243a2.25 2.25 0 01-.673 1.607 23.978 23.978 0 01-15.654 0A2.25 2.25 0 012.25 11.743V10.5A1.5 1.5 0 013.75 9zm8.25-3.75h-3a2.25 2.25 0 00-2.25 2.25V9h7.5V7.5A2.25 2.25 0 0012 5.25z"/>
                </svg>
              )},
              { id: 'hotels', label: 'Hotels', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21"/>
                </svg>
              )},
              { id: 'flights', label: 'Flights', icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
                </svg>
              )},
              { id: 'bundle', label: 'Flight + Hotel', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
                </svg>
              )},
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setVacationType(tab.id as any)}
                className={`flex-shrink-0 sm:flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px]
                            text-xs font-semibold transition-all whitespace-nowrap border-0
                            ${vacationType === tab.id
                              ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md'
                              : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400'
                            }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {vacationType === 'flights' && (
            <div>
              <h2 className="text-lg font-display font-bold text-gray-800 dark:text-white mb-4">
                Flights from Tel Aviv (TLV)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FLIGHTS.map(f => <FlightCard key={f.id} {...f} />)}
              </div>
            </div>
          )}

          {vacationType === 'hotels' && (
            <div>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h2 className="text-lg font-display font-bold text-gray-800 dark:text-white">
                  Hotels Worldwide
                </h2>
                <div className="relative w-full sm:w-72">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/>
                    <path strokeLinecap="round" d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    value={hotelSearch}
                    onChange={e => setHotelSearch(e.target.value)}
                    placeholder="Search by city or country…"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {hotelsLoading && <div className="py-16"><LoadingSpinner size="lg" /></div>}
              {hotelsError   && <p className="text-center text-red-500 py-10">{hotelsError}</p>}

              {!hotelsLoading && !hotelsError && (
                filteredHotels.length === 0 ? (
                  <p className="text-center text-gray-400 py-16">
                    {hotelSearch.trim()
                      ? `No hotels found for “${hotelSearch}”.`
                      : 'No hotels match the selected filters.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredHotels.map(h => (
                      <HotelCard
                        key={h.id}
                        {...h}
                        liked={h.likedByMe}
                        onToggleLike={() => toggleHotelLike(h)}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {vacationType === 'bundle' && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <PackageOpen className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              <p className="font-semibold text-gray-600 text-base mb-2">Flight + Hotel</p>
              <p>Coming soon</p>
            </div>
          )}

          {vacationType === 'packages' && (
            <>
              {/* Staggered entrance grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                key={`${page}-${filters.likedOnly ? 'liked' : filters.activeOnly ? 'active' : filters.notStartedOnly ? 'upcoming' : 'all'}`}
              >
                {vacations.map(v => (
                  <motion.div key={v.id} variants={cardVariants} className="h-full">
                    <VacationCard vacation={v} />
                  </motion.div>
                ))}
              </motion.div>

              <Pagination page={page} totalPages={totalPages} onPageChange={p => dispatch(setPage(p))} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Vacations;
