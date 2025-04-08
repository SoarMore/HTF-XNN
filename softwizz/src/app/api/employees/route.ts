import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// PostgreSQL config
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CompanyJobs',
  password: 'vish2005',
  port: 5432,
});

// GET handler for employee info
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ success: false, message: 'Username is required' });
    }

    // 1. Find the user from 'users' table
    const userRes = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    const userId = userRes.rows[0].id;

    // 2. Get employee details from employee_skills using user_id
    const empRes = await pool.query('SELECT * FROM employee_skills WHERE user_id = $1', [userId]);
    if (empRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Employee not found' });
    }

    return NextResponse.json({ success: true, employee: empRes.rows[0] });

  } catch (err) {
    console.error('🔥 Server error:', err);
    return NextResponse.json({ success: false, message: 'Server error' });
  }
}
