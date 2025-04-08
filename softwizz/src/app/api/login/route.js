import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'vish2005', // 👈 your actual password here
  database: 'CompanyJobs',
});

export async function POST(req) {
  const { username, password } = await req.json();

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid password' });
    }

    return NextResponse.json({ success: true, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' });
  }
}
