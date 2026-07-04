import { pool } from '../config/db.js';
import { HotelWithLikes } from '../types/index.js';

type Row = HotelWithLikes & Record<string, unknown>;

function parseJsonArray(value: unknown): string[] {
  return typeof value === 'string' ? JSON.parse(value) : (value as string[]);
}

export async function findAll(userId = 0): Promise<HotelWithLikes[]> {
  const [rows] = await pool.query(
    `SELECT
       h.*,
       COUNT(DISTINCT hl.userId)    AS likesCount,
       IF(SUM(hl.userId = ?), 1, 0) AS likedByMe
     FROM hotels h
     LEFT JOIN hotel_likes hl ON hl.hotelId = h.id
     GROUP BY h.id
     ORDER BY h.id ASC`,
    [userId],
  ) as [Row[], unknown];

  return rows.map(r => ({
    ...r,
    guestScore: Number(r.guestScore),
    pricePerNight: Number(r.pricePerNight),
    freeCancellation: Boolean(r.freeCancellation),
    amenities: parseJsonArray(r.amenities),
    images: parseJsonArray(r.images),
    likesCount: Number(r.likesCount),
    likedByMe: Boolean(r.likedByMe),
  }));
}

export async function findById(id: number, userId = 0): Promise<HotelWithLikes | null> {
  const [rows] = await pool.query(
    `SELECT
       h.*,
       COUNT(DISTINCT hl.userId)    AS likesCount,
       IF(SUM(hl.userId = ?), 1, 0) AS likedByMe
     FROM hotels h
     LEFT JOIN hotel_likes hl ON hl.hotelId = h.id
     WHERE h.id = ?
     GROUP BY h.id`,
    [userId, id],
  ) as [Row[], unknown];

  if (!rows[0]) return null;
  const r = rows[0];
  return {
    ...r,
    guestScore: Number(r.guestScore),
    pricePerNight: Number(r.pricePerNight),
    freeCancellation: Boolean(r.freeCancellation),
    amenities: parseJsonArray(r.amenities),
    images: parseJsonArray(r.images),
    likesCount: Number(r.likesCount),
    likedByMe: Boolean(r.likedByMe),
  };
}

export async function getLike(userId: number, hotelId: number): Promise<boolean> {
  const [rows] = await pool.query(
    'SELECT 1 FROM hotel_likes WHERE userId = ? AND hotelId = ?',
    [userId, hotelId],
  ) as [unknown[], unknown];
  return rows.length > 0;
}

export async function addLike(userId: number, hotelId: number): Promise<void> {
  await pool.query('INSERT INTO hotel_likes (userId, hotelId) VALUES (?, ?)', [userId, hotelId]);
}

export async function removeLike(userId: number, hotelId: number): Promise<void> {
  await pool.query('DELETE FROM hotel_likes WHERE userId = ? AND hotelId = ?', [userId, hotelId]);
}
