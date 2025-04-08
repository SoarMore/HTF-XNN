import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'vish2005',
  database: process.env.DB_NAME || 'CompanyJobs',
});

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password); // ✅ bcrypt verify

    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: 'Invalid password' });
    }

    return NextResponse.json({ success: true, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, message: 'Server error' });
  }
}
