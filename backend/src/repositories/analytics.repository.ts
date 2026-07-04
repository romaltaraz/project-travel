import { pool } from '../config/db.js';

export async function getOverview() {
  const [[row]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'user')                            AS totalUsers,
      (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed')                  AS totalBookings,
      (SELECT COALESCE(SUM(numTravelers), 0) FROM bookings WHERE status = 'confirmed') AS totalTravelers,
      (SELECT COALESCE(SUM(totalPrice), 0) FROM bookings WHERE status = 'confirmed') AS totalRevenue,
      (SELECT COALESCE(AVG(rating), 0) FROM reviews)                              AS averageRating,
      (SELECT COUNT(*) FROM likes)                                                 AS totalLikes
  `) as [[Record<string, unknown>], unknown];
  return {
    totalUsers:      Number(row.totalUsers),
    totalBookings:   Number(row.totalBookings),
    totalTravelers:  Number(row.totalTravelers),
    totalRevenue:    Number(row.totalRevenue),
    averageRating:   Number(Number(row.averageRating).toFixed(2)),
    totalLikes:      Number(row.totalLikes),
  };
}

export async function getBookingStatusBreakdown() {
  const [rows] = await pool.query(
    `SELECT status, COUNT(*) AS count FROM bookings GROUP BY status`,
  ) as [{ status: string; count: string }[], unknown];
  return rows.map(r => ({ status: r.status, count: Number(r.count) }));
}

export async function getRatingDistribution() {
  const [rows] = await pool.query(
    `SELECT rating, COUNT(*) AS count FROM reviews GROUP BY rating`,
  ) as [{ rating: number; count: string }[], unknown];
  const byRating = new Map(rows.map(r => [Number(r.rating), Number(r.count)]));
  // Always return all 5 stars, even ones with zero reviews, so the chart's x-axis is stable.
  return [1, 2, 3, 4, 5].map(rating => ({ rating, count: byRating.get(rating) ?? 0 }));
}

export async function getRatingsByDestination() {
  const [rows] = await pool.query(`
    SELECT v.id, v.destination, r.rating, COUNT(*) AS count
    FROM reviews r
    JOIN vacations v ON v.id = r.vacationId
    GROUP BY v.id, r.rating
    ORDER BY v.id
  `) as [{ id: number; destination: string; rating: number; count: string }[], unknown];

  const byVacation = new Map<number, { id: number; destination: string; ratings: Record<number, number> }>();
  for (const r of rows) {
    if (!byVacation.has(r.id)) {
      byVacation.set(r.id, { id: r.id, destination: r.destination, ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    }
    byVacation.get(r.id)!.ratings[Number(r.rating)] = Number(r.count);
  }

  return Array.from(byVacation.values()).map(v => ({
    id: v.id,
    destination: v.destination,
    rating1: v.ratings[1],
    rating2: v.ratings[2],
    rating3: v.ratings[3],
    rating4: v.ratings[4],
    rating5: v.ratings[5],
    totalReviews: Object.values(v.ratings).reduce((sum, c) => sum + c, 0),
  }));
}

export async function getRevenueByMonth() {
  const [rows] = await pool.query(`
    SELECT
      DATE_FORMAT(createdAt, '%Y-%m') AS month,
      SUM(totalPrice)                 AS revenue
    FROM bookings
    WHERE status = 'confirmed'
    GROUP BY month
    ORDER BY month ASC
  `) as [{ month: string; revenue: string }[], unknown];
  return rows.map(r => ({ month: r.month, revenue: Number(r.revenue) }));
}

export async function getPopularVacations() {
  const [rows] = await pool.query(`
    SELECT
      v.id, v.destination, v.startDate, v.endDate, v.price, v.imageFileName,
      COUNT(DISTINCT b.id)       AS bookingsCount,
      (SELECT COALESCE(SUM(b2.numTravelers), 0) FROM bookings b2
         WHERE b2.vacationId = v.id AND b2.status = 'confirmed')  AS travelersCount,
      COUNT(DISTINCT l.userId)   AS likesCount,
      COALESCE(AVG(r.rating), 0) AS averageRating,
      COUNT(DISTINCT r.id)       AS reviewsCount
    FROM vacations v
    LEFT JOIN bookings b ON b.vacationId = v.id AND b.status = 'confirmed'
    LEFT JOIN likes    l ON l.vacationId = v.id
    LEFT JOIN reviews  r ON r.vacationId = v.id
    GROUP BY v.id
    ORDER BY bookingsCount DESC, likesCount DESC, averageRating DESC
    LIMIT 20
  `) as [Record<string, unknown>[], unknown];
  const toDate = (v: unknown) => v instanceof Date ? v.toISOString().split('T')[0] : String(v);
  return rows.map(r => ({
    id:            Number(r.id),
    destination:   String(r.destination),
    startDate:     toDate(r.startDate),
    endDate:       toDate(r.endDate),
    price:         Number(r.price),
    imageFileName: String(r.imageFileName),
    bookingsCount: Number(r.bookingsCount),
    travelersCount: Number(r.travelersCount),
    likesCount:    Number(r.likesCount),
    averageRating: Number(Number(r.averageRating).toFixed(2)),
    reviewsCount:  Number(r.reviewsCount),
  }));
}

// Used by MCP tools
export async function getAverageRating(vacationId?: number) {
  if (vacationId) {
    const [[row]] = await pool.query(
      'SELECT COALESCE(AVG(rating), 0) AS avg FROM reviews WHERE vacationId = ?',
      [vacationId],
    ) as [[{ avg: string }], unknown];
    return Number(Number(row.avg).toFixed(2));
  }
  const [[row]] = await pool.query(
    'SELECT COALESCE(AVG(rating), 0) AS avg FROM reviews',
  ) as [[{ avg: string }], unknown];
  return Number(Number(row.avg).toFixed(2));
}

export async function getTopRatedVacations(limit = 5) {
  const [rows] = await pool.query(`
    SELECT v.id, v.destination, COALESCE(AVG(r.rating), 0) AS avg, COUNT(r.id) AS cnt
    FROM vacations v
    LEFT JOIN reviews r ON r.vacationId = v.id
    GROUP BY v.id
    ORDER BY avg DESC, cnt DESC
    LIMIT ?
  `, [limit]) as [Record<string, unknown>[], unknown];
  return rows.map(r => ({ id: Number(r.id), destination: String(r.destination), averageRating: Number(Number(r.avg).toFixed(2)), reviewsCount: Number(r.cnt) }));
}

export async function getBookingStats(dateFrom?: string, dateTo?: string) {
  const clauses: string[] = ["status = 'confirmed'"];
  const params: unknown[] = [];
  if (dateFrom) { clauses.push('createdAt >= ?'); params.push(dateFrom); }
  if (dateTo)   { clauses.push('createdAt <= ?'); params.push(dateTo + ' 23:59:59'); }
  const where = clauses.join(' AND ');
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total, COALESCE(SUM(totalPrice), 0) AS revenue FROM bookings WHERE ${where}`,
    params,
  ) as [[{ total: string; revenue: string }], unknown];
  return { totalBookings: Number(row.total), totalRevenue: Number(row.revenue) };
}

export async function getMostBookedVacations(limit = 5) {
  const [rows] = await pool.query(`
    SELECT v.id, v.destination, COUNT(b.id) AS bookings
    FROM vacations v
    LEFT JOIN bookings b ON b.vacationId = v.id AND b.status = 'confirmed'
    GROUP BY v.id
    ORDER BY bookings DESC
    LIMIT ?
  `, [limit]) as [Record<string, unknown>[], unknown];
  return rows.map(r => ({ id: Number(r.id), destination: String(r.destination), bookings: Number(r.bookings) }));
}
