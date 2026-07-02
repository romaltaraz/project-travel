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
