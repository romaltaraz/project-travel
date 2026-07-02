import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../store';
import { fetchVacations, setPage, setFilters } from '../store/vacationsSlice';
import VacationCard from '../components/Vacations/VacationCard';
import VacationFiltersBar from '../components/Vacations/VacationFilters';
import Pagination from '../components/Common/Pagination';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FlightCard, FlightCardProps } from '../components/ui/flight-card-1';
import { HotelCard, HotelCardProps } from '../components/ui/hotel-card-1';

// Real photos of each named hotel: Wikimedia Commons (freely licensed) where available,
// otherwise the hotel's own official site (their copyrighted marketing photos — fine for
// this demo, not for commercial reuse without permission).
const WC = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;

// Hotels across all vacation destinations
const HOTELS: (HotelCardProps & { id: string })[] = [
  { id: 'rome', name: 'Hotel Artemide', city: 'Rome, Italy', starRating: 4, guestScore: 8.6, reviewsCount: 4210, pricePerNight: 180, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://www.hotelartemide.it/static/ee6ae7db978739bb0f8f969d03796604/ff2b2/8dfdb95c-05ea-4fbc-92cd-c22fb3a54562.jpg',
      'https://www.hotelartemide.it/static/bfefbb4c07326bb12cc39d40a6e526f4/ba0b2/9a0380ff-f194-4314-b5df-2adb5d847d74.jpg',
      'https://www.hotelartemide.it/static/c8ec2ae85589b1ef995317a5cb6b0496/ff2b2/c8a9414b-7760-4bcd-9076-7b8019cf245c.jpg',
    ] },
  { id: 'paris', name: 'Hôtel Le Six', city: 'Paris, France', starRating: 4, guestScore: 8.9, reviewsCount: 3120, pricePerNight: 220, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://www.hotel-le-six.com/cache/img/home-67813-1620-720-auto.jpeg',
      'https://www.hotel-le-six.com/cache/img/le-six-hotel-lounge-67964-800-950-auto.jpg',
      'https://www.hotel-le-six.com/cache/img/le-six-hotel-breakfast-67958-540-360-crop.jpg',
    ] },
  { id: 'tokyo', name: 'Shinjuku Granbell Hotel', city: 'Tokyo, Japan', starRating: 4, guestScore: 8.7, reviewsCount: 5860, pricePerNight: 150, freeCancellation: true, amenities: ['Free WiFi'],
    images: [
      WC('Shinjuku Granbell Hotel, Tokyo, 2019 - 225.jpg'),
      WC('Bathroom in the Shinjuku Granbell Hotel in Tokyo, 2019 - 001.jpg'),
    ] },
  { id: 'bali', name: 'The Kayon Resort', city: 'Bali, Indonesia', starRating: 5, guestScore: 9.1, reviewsCount: 2740, pricePerNight: 120, freeCancellation: true, amenities: ['Pool', 'Free WiFi', 'Breakfast included'],
    images: [
      'https://thekayonresort.com/wp-content/uploads/2025/01/header-kayon-royal-retreat.jpg',
      'https://thekayonresort.com/wp-content/uploads/2024/10/river-edge-pool-villa.jpg',
      'https://thekayonresort.com/wp-content/uploads/2024/10/kayon-river-suite.jpg',
    ] },
  { id: 'santorini', name: 'Canaves Oia Suites', city: 'Santorini, Greece', starRating: 5, guestScore: 9.4, reviewsCount: 1980, pricePerNight: 340, freeCancellation: false, amenities: ['Pool', 'Free WiFi', 'Breakfast included'],
    images: [
      'https://canaves.com/wp-content/uploads/2024/12/5_luxury_star_hotel_santorini_oia_canaves-_suites_gallery-2-600x389.jpg',
      'https://canaves.com/wp-content/uploads/2024/12/5_luxury_star_hotel_santorini_oia_canaves-_suites_gallery-4-600x439.jpg',
      'https://canaves.com/wp-content/uploads/2024/12/5_luxury_star_hotel_santorini_oia_canaves-_suites_gallery-7-600x1062.jpg',
    ] },
  { id: 'barcelona', name: 'Hotel Casa Bonay', city: 'Barcelona, Spain', starRating: 4, guestScore: 8.8, reviewsCount: 3340, pricePerNight: 190, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://cdn-hhbfohb.nitrocdn.com/MWVuFFQrOubRCgucqTrIdzQgXRECTcge/assets/images/optimized/rev-54fad52/casabonay.com/wp-content/uploads/2021/08/ATP2775@antp-scaled-e1628597088539-659x879.jpg',
      'https://cdn-hhbfohb.nitrocdn.com/MWVuFFQrOubRCgucqTrIdzQgXRECTcge/assets/images/optimized/rev-54fad52/casabonay.com/wp-content/uploads/2016/05/CASA_BONAY_SAILING-CLUB-999x660.jpg',
      'https://cdn-hhbfohb.nitrocdn.com/MWVuFFQrOubRCgucqTrIdzQgXRECTcge/assets/images/optimized/rev-54fad52/casabonay.com/wp-content/uploads/2018/02/DSC0429-999x660.jpg',
    ] },
  { id: 'newyork', name: 'The Pod Times Square', city: 'New York, USA', starRating: 3, guestScore: 8.2, reviewsCount: 9120, pricePerNight: 210, freeCancellation: true, amenities: ['Free WiFi'],
    images: [
      'https://assets.milestoneinternet.com/cdn-cgi/image/width=1800,height=1200,f=auto/pod-hotels/the-pod-hotels/siteimages/pod-rooms-pod-times-square-brooklyn-newyork.jpg',
      'https://assets.milestoneinternet.com/cdn-cgi/image/f=auto/pod-hotels/the-pod-hotels/siteimages/pod-tsq-queen-pod.jpg',
      'https://assets.milestoneinternet.com/cdn-cgi/image/f=auto/pod-hotels/the-pod-hotels/siteimages/pod-tsq-bunk-pod.jpg',
    ] },
  { id: 'maldives', name: 'Sun Siyam Iru Fushi', city: 'Maldives', starRating: 5, guestScore: 9.5, reviewsCount: 1420, pricePerNight: 480, freeCancellation: false, amenities: ['Pool', 'Beach access', 'Breakfast included'],
    images: [
      'https://www.sunsiyam.com/media/pxjjnfgw/dji_0180-1.jpg',
      'https://www.sunsiyam.com/media/aeejkefc/irufushi_hidden_retreat_0129.jpg',
      'https://www.sunsiyam.com/media/3kelpb2j/6g5a0110-avec-accentuation-nr-1.jpg',
    ] },
  { id: 'sydney', name: 'Ovolo Woolloomooloo', city: 'Sydney, Australia', starRating: 4, guestScore: 8.7, reviewsCount: 2650, pricePerNight: 200, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      WC('Blue Hotel Woolloomooloo, Sydney - panoramio.jpg'),
      WC('Blue Hotel Interior I - panoramio.jpg'),
      WC('(1)Finger Wharf-1.jpg'),
    ] },
  { id: 'capetown', name: 'The Silo Hotel', city: 'Cape Town, South Africa', starRating: 5, guestScore: 9.3, reviewsCount: 980, pricePerNight: 310, freeCancellation: true, amenities: ['Pool', 'Free WiFi', 'Spa'],
    images: [
      'https://wp.theroyalportfolio.com/app/uploads/2022/06/Silo-Hotel-2228-scaled.jpg',
      'https://wp.theroyalportfolio.com/app/uploads/2022/06/DSC_2635_-scaled.jpg',
    ] },
  { id: 'machupicchu', name: 'Sumaq Machu Picchu Hotel', city: 'Machu Picchu, Peru', starRating: 5, guestScore: 9.2, reviewsCount: 760, pricePerNight: 260, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://image-tc.galaxy.tf/wijpeg-9b8zh7l2e0tmfj13y1mmc5zcv/dsf3392_standard.jpg',
      'https://image-tc.galaxy.tf/wijpeg-eqyh2gi0vya6yynvvmk7siwx6/room-sumaq-deluxe-garden-view_standard.jpg',
      'https://image-tc.galaxy.tf/wijpeg-11eswlfjazo2rv69buoe72qke/fg8a3181-copia-copia_standard.jpg',
    ] },
  { id: 'dubai', name: 'Jumeirah Beach Hotel', city: 'Dubai, UAE', starRating: 5, guestScore: 9.0, reviewsCount: 6210, pricePerNight: 290, freeCancellation: true, amenities: ['Pool', 'Beach access', 'Free WiFi'],
    images: [WC('MTM A8 in Dubai.jpg')] },
  { id: 'amsterdam', name: 'Hotel V Nesplein', city: 'Amsterdam, Netherlands', starRating: 4, guestScore: 8.7, reviewsCount: 2890, pricePerNight: 175, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://admin.hotelv.com/wp-content/uploads/2025/05/Gallery-slide-1-scaled.jpg',
      'https://admin.hotelv.com/wp-content/uploads/2025/05/Gallery-slide-4.jpg',
      'https://admin.hotelv.com/wp-content/uploads/2025/05/Gallery-slide-6-scaled.jpg',
    ] },
  { id: 'reykjavik', name: 'Reykjavik Konsulat Hotel', city: 'Reykjavik, Iceland', starRating: 4, guestScore: 8.9, reviewsCount: 1340, pricePerNight: 260, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://www.reykjavikkonsulathotel.is/static/strevda/1522159717-_z9a3136-2.jpg',
      'https://www.reykjavikkonsulathotel.is/static/strevda/1522141265-_z9a2890.jpg',
      'https://www.reykjavikkonsulathotel.is/static/extras/images/.of/REKCUQQ-Lobby-Bar-Lounge%20(2)120.jpg',
    ] },
  { id: 'kyoto', name: 'The Ritz-Carlton Kyoto', city: 'Kyoto, Japan', starRating: 5, guestScore: 9.4, reviewsCount: 1150, pricePerNight: 420, freeCancellation: true, amenities: ['Free WiFi', 'Spa', 'Breakfast included'],
    images: [WC('The Ritz-Carton Kyoto 2.jpg'), WC('The Ritz-Carton Kyoto.jpg')] },
  { id: 'phuket', name: 'Trisara Phuket', city: 'Phuket, Thailand', starRating: 5, guestScore: 9.3, reviewsCount: 890, pricePerNight: 340, freeCancellation: false, amenities: ['Pool', 'Beach access', 'Spa'],
    images: [WC('Thumb_Thailand_Phuket_NaithornBeach_TRISARA_Ocean_Front_Pool_Villa_View.jpg')] },
  { id: 'amalfi', name: 'Le Sirenuse', city: 'Amalfi Coast, Italy', starRating: 5, guestScore: 9.5, reviewsCount: 1020, pricePerNight: 550, freeCancellation: false, amenities: ['Pool', 'Free WiFi', 'Breakfast included'],
    images: [
      'https://sirenuse.it/media/qxdob5yf/le-sirenuse-hotel-positano_views_9997.jpg',
      'https://sirenuse.it/media/0s5ep1xf/le_sirenuse_pool-1042-1.jpg',
      'https://sirenuse.it/media/qguhthws/le-sirenuse_room_junior-suite-superior-b1j_9627.jpg',
    ] },
  { id: 'havana', name: 'Hotel Nacional de Cuba', city: 'Havana, Cuba', starRating: 4, guestScore: 8.3, reviewsCount: 3560, pricePerNight: 140, freeCancellation: true, amenities: ['Pool', 'Free WiFi'],
    images: [WC('Entrance to Hotel Nacional de Cuba in Old Havana.JPG'), WC('Cuba, Havana, Sunset over Hotel Nacional.jpg')] },
  { id: 'marrakech', name: 'La Mamounia', city: 'Marrakech, Morocco', starRating: 5, guestScore: 9.2, reviewsCount: 2140, pricePerNight: 310, freeCancellation: true, amenities: ['Pool', 'Spa', 'Breakfast included'],
    images: [WC('La Mamounia entrance.jpg'), WC('La Mamounia interior.jpg'), WC('La Mamounia outdoor pool.jpg')] },
  { id: 'queenstown', name: 'Eichardt’s Private Hotel', city: 'Queenstown, New Zealand', starRating: 5, guestScore: 9.3, reviewsCount: 640, pricePerNight: 380, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [WC("Eichardt's Hotel 642.jpg"), WC("Eichardt's Hotel 963.jpg"), WC("Eichardt's hotel restaurant 01.jpg")] },
  { id: 'lisbon', name: 'Memmo Alfama Hotel', city: 'Lisbon, Portugal', starRating: 4, guestScore: 9.0, reviewsCount: 2980, pricePerNight: 160, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://static.guestcentric.net/bin/1e4cb8b06c6e9c4d/memmo-alfama-bannermemmo-alfama_banner-inicial_new2.webp',
      'https://static.guestcentric.net/bin/1e4cb8b06c6e9c4d/memmo-alfama-bannermemmo-alfama_banner-inicial_new3.webp',
    ] },
  { id: 'patagonia', name: 'EOLO Patagonia’s Spirit', city: 'Patagonia, Argentina', starRating: 5, guestScore: 9.4, reviewsCount: 410, pricePerNight: 470, freeCancellation: false, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://www.eolopatagonia.com/images/slider_home/slide1.jpg',
      'https://www.eolopatagonia.com/images/slider_home/slide2.jpg',
      'https://www.eolopatagonia.com/images/slider_home/slide3.jpg',
    ] },
];

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
  const { t } = useTranslation();
  const [vacationType, setVacationType] = useState<'packages' | 'hotels' | 'flights' | 'bundle'>('packages');
  const [hotelSearch, setHotelSearch] = useState('');

  useEffect(() => {
    dispatch(fetchVacations({ page, filters }));
  }, [dispatch, page, filters]);

  const filteredHotels = HOTELS.filter(h =>
    h.city.toLowerCase().includes(hotelSearch.trim().toLowerCase()) ||
    h.name.toLowerCase().includes(hotelSearch.trim().toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white">{t('vacations.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover your next adventure</p>
        </div>
        <VacationFiltersBar filters={filters} onChange={f => dispatch(setFilters(f))} />
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
          <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible">
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
                              : 'bg-transparent text-gray-500 hover:bg-green-50 hover:text-green-700'
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {filteredHotels.length === 0 ? (
                <p className="text-center text-gray-400 py-16">No hotels found for “{hotelSearch}”.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredHotels.map(h => <HotelCard key={h.id} {...h} />)}
                </div>
              )}
            </div>
          )}

          {vacationType === 'bundle' && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="text-5xl mb-4">📦</span>
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
