import { pool } from '../config/db.js';
import { Booking, BookingWithDetails } from '../types/index.js';
import { generateBookingRef } from '../utils/bookingRef.js';

type Row = BookingWithDetails & Record<string, unknown>;

export async function findByUser(userId: number): Promise<BookingWithDetails[]> {
  const [rows] = await pool.query(
    `SELECT b.*,
            v.destination, v.description, v.startDate, v.endDate, v.price, v.imageFileName
     FROM bookings b
     JOIN vacations v ON v.id = b.vacationId
     WHERE b.userId = ?
     ORDER BY b.createdAt DESC`,
    [userId],
  ) as [Row[], unknown];
  return rows.map(r => ({
    ...r,
    totalPrice: Number(r.totalPrice),
    vacation: {
      id: r.vacationId,
      destination: r.destination as string,
      description: r.description as string,
      startDate: r.startDate as string,
      endDate: r.endDate as string,
      price: Number(r.price),
      imageFileName: r.imageFileName as string,
      createdAt: r.createdAt,
    },
  }));
}

export async function findById(id: number): Promise<Booking | null> {
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]) as [Row[], unknown];
  if (!rows[0]) return null;
  return { ...rows[0], totalPrice: Number(rows[0].totalPrice) };
}

export async function create(
  userId: number,
  vacationId: number,
  numTravelers: number,
  totalPrice: number,
): Promise<Booking> {
  // Insert with a temporary unique reference (max 20 chars), then update to the id-based format
  const tempRef = `T-${Date.now().toString(36)}`;
  const [result] = await pool.query(
    `INSERT INTO bookings (userId, vacationId, numTravelers, totalPrice, status, bookingReference)
     VALUES (?, ?, ?, ?, 'confirmed', ?)`,
    [userId, vacationId, numTravelers, totalPrice, tempRef],
  ) as [{ insertId: number }, unknown];

  const id = result.insertId;
  const bookingReference = generateBookingRef(id);
  await pool.query('UPDATE bookings SET bookingReference = ? WHERE id = ?', [bookingReference, id]);

  return {
    id,
    userId,
    vacationId,
    numTravelers,
    totalPrice,
    status: 'confirmed',
    bookingReference,
    createdAt: new Date(),
  };
}

export async function cancel(id: number): Promise<void> {
  await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [id]);
}

export async function adminFindAll(filters: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<BookingWithDetails[]> {
  const params: unknown[] = [];
  const clauses: string[] = [];

  if (filters.status) {
    clauses.push('b.status = ?');
    params.push(filters.status);
  }
  if (filters.dateFrom) {
    clauses.push('DATE(b.createdAt) >= ?');
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    clauses.push('DATE(b.createdAt) <= ?');
    params.push(filters.dateTo);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT b.*,
            v.destination, v.startDate AS vacStartDate, v.endDate AS vacEndDate, v.price AS vacPrice, v.imageFileName,
            u.firstName AS userFirstName, u.lastName AS userLastName, u.email AS userEmail
     FROM bookings b
     JOIN vacations v ON v.id = b.vacationId
     JOIN users     u ON u.id = b.userId
     ${where}
     ORDER BY b.createdAt DESC`,
    params,
  ) as [Row[], unknown];
  return rows.map(r => ({ ...r, totalPrice: Number(r.totalPrice) }));
}

export async function adminUpdate(id: number, status: 'confirmed' | 'cancelled'): Promise<void> {
  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
}
