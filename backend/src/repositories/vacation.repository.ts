import { pool } from '../config/db.js';
import { VacationWithStats, VacationFilters } from '../types/index.js';

type Row = VacationWithStats & Record<string, unknown>;

function buildFilterClause(
  filters: VacationFilters,
  params: unknown[],
): string {
  const clauses: string[] = [];
  const today = new Date().toISOString().split('T')[0];

  if (filters.likedOnly && filters.userId) {
    clauses.push('EXISTS (SELECT 1 FROM likes l WHERE l.vacationId = v.id AND l.userId = ?)');
    params.push(filters.userId);
  }
  if (filters.activeOnly) {
    clauses.push('v.startDate <= ? AND v.endDate >= ?');
    params.push(today, today);
  }
  if (filters.notStartedOnly) {
    clauses.push('v.startDate > ?');
    params.push(today);
  }
  return clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
}

export async function findAll(
  filters: VacationFilters,
  page: number,
  pageSize: number,
): Promise<{ vacations: VacationWithStats[]; total: number }> {
  const params: unknown[] = [];
  const userId = filters.userId ?? 0;
  const filterSql = buildFilterClause(filters, params);

  const countSql = `SELECT COUNT(*) AS total FROM vacations v ${filterSql}`;
  const [countRows] = await pool.query(countSql, params) as [{ total: number }[], unknown];
  const total = countRows[0].total;

  const selectSql = `
    SELECT
      v.*,
      COUNT(DISTINCT l.userId)    AS likesCount,
      IF(SUM(l.userId = ?), 1, 0) AS likedByMe,
      COALESCE(AVG(r.rating), 0)  AS averageRating,
      COUNT(DISTINCT r.id)        AS reviewsCount
    FROM vacations v
    LEFT JOIN likes   l ON l.vacationId = v.id
    LEFT JOIN reviews r ON r.vacationId = v.id
    ${filterSql}
    GROUP BY v.id
    ORDER BY v.startDate ASC
    LIMIT ? OFFSET ?
  `;
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(selectSql, [userId, ...params, pageSize, offset]) as [Row[], unknown];

  const vacations = rows.map(r => ({
    ...r,
    price: Number(r.price),
    likesCount: Number(r.likesCount),
    likedByMe: Boolean(r.likedByMe),
    averageRating: Number(Number(r.averageRating).toFixed(1)),
    reviewsCount: Number(r.reviewsCount),
  }));

  return { vacations, total };
}

export async function findById(id: number, userId = 0): Promise<VacationWithStats | null> {
  const [rows] = await pool.query(
    `SELECT
       v.*,
       COUNT(DISTINCT l.userId)    AS likesCount,
       IF(SUM(l.userId = ?), 1, 0) AS likedByMe,
       COALESCE(AVG(r.rating), 0)  AS averageRating,
       COUNT(DISTINCT r.id)        AS reviewsCount
     FROM vacations v
     LEFT JOIN likes   l ON l.vacationId = v.id
     LEFT JOIN reviews r ON r.vacationId = v.id
     WHERE v.id = ?
     GROUP BY v.id`,
    [userId, id],
  ) as [Row[], unknown];

  if (!rows[0]) return null;
  const r = rows[0];
  return {
    ...r,
    price: Number(r.price),
    likesCount: Number(r.likesCount),
    likedByMe: Boolean(r.likedByMe),
    averageRating: Number(Number(r.averageRating).toFixed(1)),
    reviewsCount: Number(r.reviewsCount),
  };
}

export async function create(data: {
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  imageFileName: string;
}): Promise<number> {
  const [result] = await pool.query(
    'INSERT INTO vacations (destination, description, startDate, endDate, price, imageFileName) VALUES (?, ?, ?, ?, ?, ?)',
    [data.destination, data.description, data.startDate, data.endDate, data.price, data.imageFileName],
  ) as [{ insertId: number }, unknown];
  return result.insertId;
}

export async function update(
  id: number,
  data: Partial<{
    destination: string;
    description: string;
    startDate: string;
    endDate: string;
    price: number;
    imageFileName: string;
  }>,
): Promise<void> {
  const fields = Object.keys(data) as (keyof typeof data)[];
  if (!fields.length) return;
  const setSql = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => data[f]);
  await pool.query(`UPDATE vacations SET ${setSql} WHERE id = ?`, [...values, id]);
}

export async function remove(id: number): Promise<void> {
  await pool.query('DELETE FROM vacations WHERE id = ?', [id]);
}
