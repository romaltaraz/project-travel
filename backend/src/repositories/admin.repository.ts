import { pool } from '../config/db.js';
import { LikesReport } from '../types/index.js';

export async function getLikesReport(): Promise<LikesReport[]> {
  const [rows] = await pool.query(
    `SELECT v.destination, COUNT(l.userId) AS likesCount
     FROM vacations v
     LEFT JOIN likes l ON l.vacationId = v.id
     GROUP BY v.id, v.destination
     ORDER BY likesCount DESC`,
  ) as [{ destination: string; likesCount: number }[], unknown];
  return rows.map(r => ({ destination: r.destination, likesCount: Number(r.likesCount) }));
}

export async function getLike(userId: number, vacationId: number): Promise<boolean> {
  const [rows] = await pool.query(
    'SELECT 1 FROM likes WHERE userId = ? AND vacationId = ?',
    [userId, vacationId],
  ) as [unknown[], unknown];
  return rows.length > 0;
}

export async function addLike(userId: number, vacationId: number): Promise<void> {
  await pool.query('INSERT INTO likes (userId, vacationId) VALUES (?, ?)', [userId, vacationId]);
}

export async function removeLike(userId: number, vacationId: number): Promise<void> {
  await pool.query('DELETE FROM likes WHERE userId = ? AND vacationId = ?', [userId, vacationId]);
}
