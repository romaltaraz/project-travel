import { pool } from '../config/db.js';
import { Review } from '../types/index.js';

type Row = Review & Record<string, unknown>;

export async function findByVacation(
  vacationId: number,
  page: number,
  pageSize: number,
): Promise<{ reviews: Review[]; total: number }> {
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM reviews WHERE vacationId = ?',
    [vacationId],
  ) as [[{ total: number }], unknown];

  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT r.*, u.firstName AS userFirstName, u.lastName AS userLastName
     FROM reviews r
     JOIN users u ON u.id = r.userId
     WHERE r.vacationId = ?
     ORDER BY r.createdAt DESC
     LIMIT ? OFFSET ?`,
    [vacationId, pageSize, offset],
  ) as [Row[], unknown];

  return { reviews: rows, total };
}

export async function findById(id: number): Promise<Review | null> {
  const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]) as [Row[], unknown];
  return rows[0] ?? null;
}

export async function findByUserAndVacation(
  userId: number,
  vacationId: number,
): Promise<Review | null> {
  const [rows] = await pool.query(
    'SELECT * FROM reviews WHERE userId = ? AND vacationId = ?',
    [userId, vacationId],
  ) as [Row[], unknown];
  return rows[0] ?? null;
}

export async function create(
  userId: number,
  vacationId: number,
  rating: number,
  comment?: string,
): Promise<Review> {
  const [result] = await pool.query(
    'INSERT INTO reviews (userId, vacationId, rating, comment) VALUES (?, ?, ?, ?)',
    [userId, vacationId, rating, comment ?? null],
  ) as [{ insertId: number }, unknown];
  return {
    id: result.insertId,
    userId,
    vacationId,
    rating,
    comment,
    createdAt: new Date(),
  };
}

export async function update(
  id: number,
  rating: number,
  comment?: string,
): Promise<void> {
  await pool.query(
    'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
    [rating, comment ?? null, id],
  );
}

export async function remove(id: number): Promise<void> {
  await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
}

export async function getAverageRating(vacationId: number): Promise<number> {
  const [[row]] = await pool.query(
    'SELECT COALESCE(AVG(rating), 0) AS avg FROM reviews WHERE vacationId = ?',
    [vacationId],
  ) as [[{ avg: number }], unknown];
  return Number(Number(row.avg).toFixed(1));
}
