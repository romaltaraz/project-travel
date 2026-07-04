/**
 * Seed script — runs automatically on backend startup if the users table is empty.
 * Creates: 1 admin + 3 regular users, 14 vacations, likes, reviews, and bookings.
 */
import bcrypt from 'bcrypt';
import { pool } from './config/db.js';
import { generateBookingRef } from './utils/bookingRef.js';

const BCRYPT_ROUNDS = 10;

const users = [
  { firstName: 'Admin',  lastName: 'User',  email: 'admin@vacations.com', password: 'admin1234', role: 'admin' },
  { firstName: 'Alice',  lastName: 'Cohen', email: 'alice@example.com',   password: 'user1234',  role: 'user'  },
  { firstName: 'Bob',    lastName: 'Levi',  email: 'bob@example.com',     password: 'user1234',  role: 'user'  },
  { firstName: 'Carol',  lastName: 'Ben-David', email: 'carol@example.com', password: 'user1234', role: 'user' },
];

const vacations = [
  // Past vacations
  {
    destination: 'Rome, Italy',
    description: 'Walk through 2,700 years of history. The Colosseum, the Vatican, and the best carbonara of your life — Roma aeterna never disappoints.',
    startDate: '2024-06-15', endDate: '2024-06-22',
    price: 1200, imageFileName: 'rome-italy.jpg',
  },
  {
    destination: 'Paris, France',
    description: 'The city of light lives up to every expectation. Stroll along the Seine, visit the Louvre, and watch the Eiffel Tower sparkle after dark.',
    startDate: '2025-02-14', endDate: '2025-02-21',
    price: 1850, imageFileName: 'paris-france.jpg',
  },
  {
    destination: 'Tokyo, Japan',
    description: 'Neon-lit streets, cherry blossom parks, Michelin-starred ramen, and the world\'s most punctual trains. Tokyo is a city that never stops surprising.',
    startDate: '2025-04-01', endDate: '2025-04-10',
    price: 2500, imageFileName: 'tokyo-japan.jpg',
  },
  // Currently active vacations (around today: 2026-06-27)
  {
    destination: 'Bali, Indonesia',
    description: 'Rice terraces, ancient Hindu temples, world-class surf breaks, and an infectious spiritual energy. Bali rewards slow travel.',
    startDate: '2026-06-20', endDate: '2026-07-05',
    price: 950, imageFileName: 'bali-indonesia.jpg',
  },
  {
    destination: 'Santorini, Greece',
    description: 'Iconic blue-domed churches perched over the caldera, flawless sunsets from Oia, and the freshest grilled octopus you\'ll ever eat.',
    startDate: '2026-06-25', endDate: '2026-07-03',
    price: 1650, imageFileName: 'santorini-greece.jpg',
  },
  // Future vacations
  {
    destination: 'Barcelona, Spain',
    description: 'Gaudí\'s fantastical architecture, a beach right in the city center, tapas that stretch into the small hours, and an electric footballing culture.',
    startDate: '2026-07-10', endDate: '2026-07-18',
    price: 1350, imageFileName: 'barcelona-spain.jpg',
  },
  {
    destination: 'New York, USA',
    description: 'The skyline, Central Park, the High Line, Broadway, and an impossibly diverse food scene — New York City is its own planet.',
    startDate: '2026-08-01', endDate: '2026-08-08',
    price: 2200, imageFileName: 'new-york-usa.jpg',
  },
  {
    destination: 'Maldives',
    description: 'Crystal-clear lagoons in seventeen shades of blue, overwater bungalows above the reef, and the rare luxury of true disconnection.',
    startDate: '2026-08-15', endDate: '2026-08-25',
    price: 3500, imageFileName: 'maldives.jpg',
  },
  {
    destination: 'Sydney, Australia',
    description: 'The Opera House, Bondi Beach, the Blue Mountains day trip, and a coffee culture that the rest of the world quietly envies.',
    startDate: '2026-09-05', endDate: '2026-09-15',
    price: 2800, imageFileName: 'sydney-australia.jpg',
  },
  {
    destination: 'Cape Town, South Africa',
    description: 'Table Mountain rising above the Atlantic, the scenic Cape Peninsula drive, world-class winelands an hour away, and dramatic sunsets every evening.',
    startDate: '2026-09-20', endDate: '2026-09-28',
    price: 1500, imageFileName: 'cape-town-south-africa.jpg',
  },
  {
    destination: 'Machu Picchu, Peru',
    description: 'The Lost City of the Incas emerges from the clouds at 2,400 m — a trek through the Sacred Valley you will remember for decades.',
    startDate: '2026-10-05', endDate: '2026-10-14',
    price: 2100, imageFileName: 'machu-picchu-peru.jpg',
  },
  {
    destination: 'Dubai, UAE',
    description: 'Burj Khalifa observation deck, desert dune bashing at sunset, a souk that smells of oud and spices, and shopping on a scale that defies comprehension.',
    startDate: '2026-10-20', endDate: '2026-10-27',
    price: 2900, imageFileName: 'dubai-uae.jpg',
  },
  {
    destination: 'Amsterdam, Netherlands',
    description: 'Cycling along 165 canals, world-class museums including the Rijksmuseum and Van Gogh, and a liberally-minded café culture that welcomes everyone.',
    startDate: '2026-11-01', endDate: '2026-11-08',
    price: 1450, imageFileName: 'amsterdam-netherlands.jpg',
  },
  {
    destination: 'Reykjavik, Iceland',
    description: 'Chase the Northern Lights by night, soak in geothermal pools by day. Iceland\'s volcanic landscapes are the most otherworldly scenery on Earth.',
    startDate: '2026-11-15', endDate: '2026-11-22',
    price: 2400, imageFileName: 'reykjavik-iceland.jpg',
  },
  {
    destination: 'Kyoto, Japan',
    description: 'Ancient temples, moss gardens, geisha districts, and streets lined with cherry blossoms. Kyoto is Japan at its most refined — timeless and utterly unforgettable.',
    startDate: '2026-12-01', endDate: '2026-12-10',
    price: 1800, imageFileName: 'kyoto-japan.jpg',
  },
  {
    destination: 'Phuket, Thailand',
    description: 'Turquoise Andaman waters, dramatic limestone karsts jutting from the sea, golden-sand beaches, and vibrant street-food markets open until dawn.',
    startDate: '2026-12-15', endDate: '2026-12-24',
    price: 1250, imageFileName: 'phuket-thailand.jpg',
  },
  {
    destination: 'Amalfi Coast, Italy',
    description: 'Pastel villages clinging to vertiginous cliffs above the Mediterranean — a UNESCO wonder of color, limoncello, and breathtaking coastal drives.',
    startDate: '2027-01-10', endDate: '2027-01-18',
    price: 2100, imageFileName: 'amalfi-italy.jpg',
  },
  {
    destination: 'Havana, Cuba',
    description: 'Vintage American cars rolling past crumbling colonial facades, salsa rhythms drifting from open doorways, and sunsets over the Malecón that feel like a Hemingway novel.',
    startDate: '2027-01-25', endDate: '2027-02-03',
    price: 1400, imageFileName: 'havana-cuba.jpg',
  },
  {
    destination: 'Marrakech, Morocco',
    description: 'Labyrinthine medina souks bursting with spices, silk, and silverwork. Ancient riads hidden behind unassuming doors open to world-class gardens and hammams.',
    startDate: '2027-02-10', endDate: '2027-02-17',
    price: 1100, imageFileName: 'marrakech-morocco.jpg',
  },
  {
    destination: 'Queenstown, New Zealand',
    description: 'The adventure capital of the world — bungee jumping, heli-skiing, and fjord cruises surrounded by the most dramatic mountain scenery on the planet.',
    startDate: '2027-02-25', endDate: '2027-03-06',
    price: 3200, imageFileName: 'queenstown-newzealand.jpg',
  },
  {
    destination: 'Lisbon, Portugal',
    description: 'Seven hills of sun-bleached buildings, the mournful beauty of fado echoing through Alfama alleys, and the best pastel de nata in the world — at €1.20 each.',
    startDate: '2027-03-15', endDate: '2027-03-22',
    price: 1350, imageFileName: 'lisbon-portugal.jpg',
  },
  {
    destination: 'Patagonia, Argentina',
    description: 'Torres del Paine\'s granite towers piercing a sky of extraordinary blue. The end of the world rewards those who make the journey with landscapes beyond imagination.',
    startDate: '2027-04-01', endDate: '2027-04-12',
    price: 3800, imageFileName: 'patagonia-argentina.jpg',
  },
];

// Real photos of each named hotel: Wikimedia Commons (freely licensed) where available,
// otherwise the hotel's own official site (their copyrighted marketing photos — fine for
// this demo, not for commercial reuse without permission).
const WC = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;

const hotels = [
  { name: 'Hotel Artemide', city: 'Rome, Italy', starRating: 4, guestScore: 8.6, reviewsCount: 4210, pricePerNight: 180, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://www.hotelartemide.it/static/ee6ae7db978739bb0f8f969d03796604/ff2b2/8dfdb95c-05ea-4fbc-92cd-c22fb3a54562.jpg',
      'https://www.hotelartemide.it/static/bfefbb4c07326bb12cc39d40a6e526f4/ba0b2/9a0380ff-f194-4314-b5df-2adb5d847d74.jpg',
      'https://www.hotelartemide.it/static/c8ec2ae85589b1ef995317a5cb6b0496/ff2b2/c8a9414b-7760-4bcd-9076-7b8019cf245c.jpg',
    ] },
  { name: 'Hôtel Le Six', city: 'Paris, France', starRating: 4, guestScore: 8.9, reviewsCount: 3120, pricePerNight: 220, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://www.hotel-le-six.com/cache/img/home-67813-1620-720-auto.jpeg',
      'https://www.hotel-le-six.com/cache/img/le-six-hotel-lounge-67964-800-950-auto.jpg',
      'https://www.hotel-le-six.com/cache/img/le-six-hotel-breakfast-67958-540-360-crop.jpg',
    ] },
  { name: 'Shinjuku Granbell Hotel', city: 'Tokyo, Japan', starRating: 4, guestScore: 8.7, reviewsCount: 5860, pricePerNight: 150, freeCancellation: true, amenities: ['Free WiFi'],
    images: [
      WC('Shinjuku Granbell Hotel, Tokyo, 2019 - 225.jpg'),
      WC('Bathroom in the Shinjuku Granbell Hotel in Tokyo, 2019 - 001.jpg'),
    ] },
  { name: 'The Kayon Resort', city: 'Bali, Indonesia', starRating: 5, guestScore: 9.1, reviewsCount: 2740, pricePerNight: 120, freeCancellation: true, amenities: ['Pool', 'Free WiFi', 'Breakfast included'],
    images: [
      'https://thekayonresort.com/wp-content/uploads/2025/01/header-kayon-royal-retreat.jpg',
      'https://thekayonresort.com/wp-content/uploads/2024/10/river-edge-pool-villa.jpg',
      'https://thekayonresort.com/wp-content/uploads/2024/10/kayon-river-suite.jpg',
    ] },
  { name: 'Canaves Oia Suites', city: 'Santorini, Greece', starRating: 5, guestScore: 9.4, reviewsCount: 1980, pricePerNight: 340, freeCancellation: false, amenities: ['Pool', 'Free WiFi', 'Breakfast included'],
    images: [
      'https://canaves.com/wp-content/uploads/2024/12/5_luxury_star_hotel_santorini_oia_canaves-_suites_gallery-2-600x389.jpg',
      'https://canaves.com/wp-content/uploads/2024/12/5_luxury_star_hotel_santorini_oia_canaves-_suites_gallery-4-600x439.jpg',
      'https://canaves.com/wp-content/uploads/2024/12/5_luxury_star_hotel_santorini_oia_canaves-_suites_gallery-7-600x1062.jpg',
    ] },
  { name: 'Hotel Casa Bonay', city: 'Barcelona, Spain', starRating: 4, guestScore: 8.8, reviewsCount: 3340, pricePerNight: 190, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://cdn-hhbfohb.nitrocdn.com/MWVuFFQrOubRCgucqTrIdzQgXRECTcge/assets/images/optimized/rev-54fad52/casabonay.com/wp-content/uploads/2021/08/ATP2775@antp-scaled-e1628597088539-659x879.jpg',
      'https://cdn-hhbfohb.nitrocdn.com/MWVuFFQrOubRCgucqTrIdzQgXRECTcge/assets/images/optimized/rev-54fad52/casabonay.com/wp-content/uploads/2016/05/CASA_BONAY_SAILING-CLUB-999x660.jpg',
      'https://cdn-hhbfohb.nitrocdn.com/MWVuFFQrOubRCgucqTrIdzQgXRECTcge/assets/images/optimized/rev-54fad52/casabonay.com/wp-content/uploads/2018/02/DSC0429-999x660.jpg',
    ] },
  { name: 'The Pod Times Square', city: 'New York, USA', starRating: 3, guestScore: 8.2, reviewsCount: 9120, pricePerNight: 210, freeCancellation: true, amenities: ['Free WiFi'],
    images: [
      'https://assets.milestoneinternet.com/cdn-cgi/image/width=1800,height=1200,f=auto/pod-hotels/the-pod-hotels/siteimages/pod-rooms-pod-times-square-brooklyn-newyork.jpg',
      'https://assets.milestoneinternet.com/cdn-cgi/image/f=auto/pod-hotels/the-pod-hotels/siteimages/pod-tsq-queen-pod.jpg',
      'https://assets.milestoneinternet.com/cdn-cgi/image/f=auto/pod-hotels/the-pod-hotels/siteimages/pod-tsq-bunk-pod.jpg',
    ] },
  { name: 'Sun Siyam Iru Fushi', city: 'Maldives', starRating: 5, guestScore: 9.5, reviewsCount: 1420, pricePerNight: 480, freeCancellation: false, amenities: ['Pool', 'Beach access', 'Breakfast included'],
    images: [
      'https://www.sunsiyam.com/media/pxjjnfgw/dji_0180-1.jpg',
      'https://www.sunsiyam.com/media/aeejkefc/irufushi_hidden_retreat_0129.jpg',
      'https://www.sunsiyam.com/media/3kelpb2j/6g5a0110-avec-accentuation-nr-1.jpg',
    ] },
  { name: 'Ovolo Woolloomooloo', city: 'Sydney, Australia', starRating: 4, guestScore: 8.7, reviewsCount: 2650, pricePerNight: 200, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      WC('Blue Hotel Woolloomooloo, Sydney - panoramio.jpg'),
      WC('Blue Hotel Interior I - panoramio.jpg'),
      WC('(1)Finger Wharf-1.jpg'),
    ] },
  { name: 'The Silo Hotel', city: 'Cape Town, South Africa', starRating: 5, guestScore: 9.3, reviewsCount: 980, pricePerNight: 310, freeCancellation: true, amenities: ['Pool', 'Free WiFi', 'Spa'],
    images: [
      'https://wp.theroyalportfolio.com/app/uploads/2022/06/Silo-Hotel-2228-scaled.jpg',
      'https://wp.theroyalportfolio.com/app/uploads/2022/06/DSC_2635_-scaled.jpg',
    ] },
  { name: 'Sumaq Machu Picchu Hotel', city: 'Machu Picchu, Peru', starRating: 5, guestScore: 9.2, reviewsCount: 760, pricePerNight: 260, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://image-tc.galaxy.tf/wijpeg-9b8zh7l2e0tmfj13y1mmc5zcv/dsf3392_standard.jpg',
      'https://image-tc.galaxy.tf/wijpeg-eqyh2gi0vya6yynvvmk7siwx6/room-sumaq-deluxe-garden-view_standard.jpg',
      'https://image-tc.galaxy.tf/wijpeg-11eswlfjazo2rv69buoe72qke/fg8a3181-copia-copia_standard.jpg',
    ] },
  { name: 'Jumeirah Beach Hotel', city: 'Dubai, UAE', starRating: 5, guestScore: 9.0, reviewsCount: 6210, pricePerNight: 290, freeCancellation: true, amenities: ['Pool', 'Beach access', 'Free WiFi'],
    images: [WC('MTM A8 in Dubai.jpg')] },
  { name: 'Hotel V Nesplein', city: 'Amsterdam, Netherlands', starRating: 4, guestScore: 8.7, reviewsCount: 2890, pricePerNight: 175, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://admin.hotelv.com/wp-content/uploads/2025/05/Gallery-slide-1-scaled.jpg',
      'https://admin.hotelv.com/wp-content/uploads/2025/05/Gallery-slide-4.jpg',
      'https://admin.hotelv.com/wp-content/uploads/2025/05/Gallery-slide-6-scaled.jpg',
    ] },
  { name: 'Reykjavik Konsulat Hotel', city: 'Reykjavik, Iceland', starRating: 4, guestScore: 8.9, reviewsCount: 1340, pricePerNight: 260, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://www.reykjavikkonsulathotel.is/static/strevda/1522159717-_z9a3136-2.jpg',
      'https://www.reykjavikkonsulathotel.is/static/strevda/1522141265-_z9a2890.jpg',
      'https://www.reykjavikkonsulathotel.is/static/extras/images/.of/REKCUQQ-Lobby-Bar-Lounge%20(2)120.jpg',
    ] },
  { name: 'The Ritz-Carlton Kyoto', city: 'Kyoto, Japan', starRating: 5, guestScore: 9.4, reviewsCount: 1150, pricePerNight: 420, freeCancellation: true, amenities: ['Free WiFi', 'Spa', 'Breakfast included'],
    images: [WC('The Ritz-Carton Kyoto 2.jpg'), WC('The Ritz-Carton Kyoto.jpg')] },
  { name: 'Trisara Phuket', city: 'Phuket, Thailand', starRating: 5, guestScore: 9.3, reviewsCount: 890, pricePerNight: 340, freeCancellation: false, amenities: ['Pool', 'Beach access', 'Spa'],
    images: [WC('Thumb_Thailand_Phuket_NaithornBeach_TRISARA_Ocean_Front_Pool_Villa_View.jpg')] },
  { name: 'Le Sirenuse', city: 'Amalfi Coast, Italy', starRating: 5, guestScore: 9.5, reviewsCount: 1020, pricePerNight: 550, freeCancellation: false, amenities: ['Pool', 'Free WiFi', 'Breakfast included'],
    images: [
      'https://sirenuse.it/media/qxdob5yf/le-sirenuse-hotel-positano_views_9997.jpg',
      'https://sirenuse.it/media/0s5ep1xf/le_sirenuse_pool-1042-1.jpg',
      'https://sirenuse.it/media/qguhthws/le-sirenuse_room_junior-suite-superior-b1j_9627.jpg',
    ] },
  { name: 'Hotel Nacional de Cuba', city: 'Havana, Cuba', starRating: 4, guestScore: 8.3, reviewsCount: 3560, pricePerNight: 140, freeCancellation: true, amenities: ['Pool', 'Free WiFi'],
    images: [WC('Entrance to Hotel Nacional de Cuba in Old Havana.JPG'), WC('Cuba, Havana, Sunset over Hotel Nacional.jpg')] },
  { name: 'La Mamounia', city: 'Marrakech, Morocco', starRating: 5, guestScore: 9.2, reviewsCount: 2140, pricePerNight: 310, freeCancellation: true, amenities: ['Pool', 'Spa', 'Breakfast included'],
    images: [WC('La Mamounia entrance.jpg'), WC('La Mamounia interior.jpg'), WC('La Mamounia outdoor pool.jpg')] },
  { name: 'Eichardt’s Private Hotel', city: 'Queenstown, New Zealand', starRating: 5, guestScore: 9.3, reviewsCount: 640, pricePerNight: 380, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [WC("Eichardt's Hotel 642.jpg"), WC("Eichardt's Hotel 963.jpg"), WC("Eichardt's hotel restaurant 01.jpg")] },
  { name: 'Memmo Alfama Hotel', city: 'Lisbon, Portugal', starRating: 4, guestScore: 9.0, reviewsCount: 2980, pricePerNight: 160, freeCancellation: true, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://static.guestcentric.net/bin/1e4cb8b06c6e9c4d/memmo-alfama-bannermemmo-alfama_banner-inicial_new2.webp',
      'https://static.guestcentric.net/bin/1e4cb8b06c6e9c4d/memmo-alfama-bannermemmo-alfama_banner-inicial_new3.webp',
    ] },
  { name: 'EOLO Patagonia’s Spirit', city: 'Patagonia, Argentina', starRating: 5, guestScore: 9.4, reviewsCount: 410, pricePerNight: 470, freeCancellation: false, amenities: ['Free WiFi', 'Breakfast included'],
    images: [
      'https://www.eolopatagonia.com/images/slider_home/slide1.jpg',
      'https://www.eolopatagonia.com/images/slider_home/slide2.jpg',
      'https://www.eolopatagonia.com/images/slider_home/slide3.jpg',
    ] },
];

export async function seedHotelsIfEmpty(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT COUNT(*) AS cnt FROM hotels') as [{ cnt: number }[], unknown];
    if (rows[0].cnt > 0) {
      console.log('ℹ️  Hotels already seeded — skipping');
      return;
    }

    console.log('🌱 Seeding hotels…');
    for (const h of hotels) {
      await conn.query(
        `INSERT INTO hotels
           (name, city, starRating, guestScore, reviewsCount, pricePerNight, freeCancellation, amenities, images)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          h.name, h.city, h.starRating, h.guestScore, h.reviewsCount, h.pricePerNight, h.freeCancellation,
          JSON.stringify(h.amenities), JSON.stringify(h.images),
        ],
      );
    }
    console.log(`✅ Seeded ${hotels.length} hotels`);
  } finally {
    conn.release();
  }
}

export async function seedIfEmpty(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT COUNT(*) AS cnt FROM users') as [{ cnt: number }[], unknown];
    if (rows[0].cnt > 0) {
      console.log('ℹ️  Database already seeded — skipping');
      return;
    }

    console.log('🌱 Seeding database…');

    // Users
    const userIds: number[] = [];
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, BCRYPT_ROUNDS);
      const [result] = await conn.query(
        'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [u.firstName, u.lastName, u.email, hash, u.role],
      ) as [{ insertId: number }, unknown];
      userIds.push(result.insertId);
    }
    // userIds[0] = admin, [1] = alice, [2] = bob, [3] = carol

    // Vacations
    const vacIds: number[] = [];
    for (const v of vacations) {
      const [result] = await conn.query(
        'INSERT INTO vacations (destination, description, startDate, endDate, price, imageFileName) VALUES (?, ?, ?, ?, ?, ?)',
        [v.destination, v.description, v.startDate, v.endDate, v.price, v.imageFileName],
      ) as [{ insertId: number }, unknown];
      vacIds.push(result.insertId);
    }

    // Likes (users 1-3 like various vacations)
    const likePairs = [
      [userIds[1], vacIds[0]], [userIds[1], vacIds[1]], [userIds[1], vacIds[3]],
      [userIds[1], vacIds[5]], [userIds[1], vacIds[7]],
      [userIds[2], vacIds[0]], [userIds[2], vacIds[2]], [userIds[2], vacIds[4]],
      [userIds[2], vacIds[6]], [userIds[2], vacIds[8]],
      [userIds[3], vacIds[1]], [userIds[3], vacIds[3]], [userIds[3], vacIds[5]],
      [userIds[3], vacIds[9]], [userIds[3], vacIds[11]],
    ];
    for (const [uid, vid] of likePairs) {
      await conn.query('INSERT INTO likes (userId, vacationId) VALUES (?, ?)', [uid, vid]);
    }

    // Reviews
    const reviewsData = [
      // Rome
      { userId: userIds[1], vacationId: vacIds[0], rating: 5, comment: 'Absolutely stunning! The Colosseum blew my mind.' },
      { userId: userIds[2], vacationId: vacIds[0], rating: 4, comment: 'Amazing history but very crowded in summer.' },
      { userId: userIds[3], vacationId: vacIds[0], rating: 5, comment: 'The food alone was worth the trip.' },
      // Paris
      { userId: userIds[1], vacationId: vacIds[1], rating: 4, comment: 'Magical city, though a bit pricey.' },
      { userId: userIds[2], vacationId: vacIds[1], rating: 5, comment: 'I fell in love with Paris all over again.' },
      // Tokyo
      { userId: userIds[1], vacationId: vacIds[2], rating: 5, comment: 'Most organised and clean city I\'ve ever visited. Cherry blossoms in April are unreal.' },
      { userId: userIds[3], vacationId: vacIds[2], rating: 5, comment: 'The ramen scene alone deserves 5 stars.' },
      // Bali
      { userId: userIds[2], vacationId: vacIds[3], rating: 4, comment: 'Beautiful temples and great surf. The rice terraces are breathtaking.' },
      { userId: userIds[3], vacationId: vacIds[3], rating: 5, comment: 'So peaceful, I never wanted to leave.' },
      // Santorini
      { userId: userIds[1], vacationId: vacIds[4], rating: 5, comment: 'The sunsets from Oia are everything the photos promise.' },
      { userId: userIds[2], vacationId: vacIds[4], rating: 4, comment: 'Beautiful but very touristy. Go off-season if you can.' },
      // Barcelona
      { userId: userIds[3], vacationId: vacIds[5], rating: 5, comment: 'Sagrada Familia is a masterpiece. The food scene is incredible.' },
    ];
    for (const r of reviewsData) {
      await conn.query(
        'INSERT INTO reviews (userId, vacationId, rating, comment) VALUES (?, ?, ?, ?)',
        [r.userId, r.vacationId, r.rating, r.comment],
      );
    }

    // Bookings (past bookings for analytics data)
    const bookingsData = [
      { userId: userIds[1], vacationId: vacIds[0], numTravelers: 2, price: vacations[0].price },
      { userId: userIds[2], vacationId: vacIds[0], numTravelers: 4, price: vacations[0].price },
      { userId: userIds[1], vacationId: vacIds[1], numTravelers: 2, price: vacations[1].price },
      { userId: userIds[3], vacationId: vacIds[1], numTravelers: 1, price: vacations[1].price },
      { userId: userIds[2], vacationId: vacIds[2], numTravelers: 3, price: vacations[2].price },
      { userId: userIds[1], vacationId: vacIds[3], numTravelers: 2, price: vacations[3].price },
      { userId: userIds[3], vacationId: vacIds[4], numTravelers: 2, price: vacations[4].price },
      { userId: userIds[2], vacationId: vacIds[5], numTravelers: 1, price: vacations[5].price },
    ];
    for (const b of bookingsData) {
      const totalPrice = b.price * b.numTravelers;
      // Insert with a temp reference, then update with the real id-based one
      const [res] = await conn.query(
        'INSERT INTO bookings (userId, vacationId, numTravelers, totalPrice, status, bookingReference) VALUES (?, ?, ?, ?, "confirmed", ?)',
        [b.userId, b.vacationId, b.numTravelers, totalPrice, `TEMP-${Date.now()}-${Math.random()}`],
      ) as [{ insertId: number }, unknown];
      const ref = generateBookingRef(res.insertId);
      await conn.query('UPDATE bookings SET bookingReference = ? WHERE id = ?', [ref, res.insertId]);
    }

    console.log('✅ Database seeded successfully');
    console.log('   Admin login: admin@vacations.com / admin1234');
    console.log('   User login:  alice@example.com  / user1234');
  } finally {
    conn.release();
  }
}
