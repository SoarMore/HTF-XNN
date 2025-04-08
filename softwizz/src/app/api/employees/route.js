import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'vish2005',
  database: process.env.DB_NAME || 'CompanyJobs',
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ success: false, message: 'Username required' }, { status: 400 });
  }

  try {
    const result = await pool.query('SELECT * FROM employees_skills WHERE name = $1', [username]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, employee: result.rows[0] });
  } catch (err) {
    console.error('Error fetching employee:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
