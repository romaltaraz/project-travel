import { pool } from '../config/db.js';
import { User } from '../types/index.js';

type Row = User & Record<string, unknown>;

export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]) as [Row[], unknown];
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]) as [Row[], unknown];
  return rows[0] ?? null;
}

export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  hashedPassword: string,
): Promise<User> {
  const [result] = await pool.query(
    'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, "user")',
    [firstName, lastName, email, hashedPassword],
  ) as [{ insertId: number }, unknown];
  return {
    id: result.insertId,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: 'user',
    createdAt: new Date(),
  };
}
