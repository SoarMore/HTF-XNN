// /app/api/employees/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'vish2005',
  database: 'CompanyJobs',
});

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM employees_skills');
    return NextResponse.json({ employees: result.rows });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
