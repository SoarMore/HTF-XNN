import 'dotenv/config';
console.log('👉 DATABASE_URL:', process.env.DATABASE_URL);

import dotenv from 'dotenv';
dotenv.config(); // ✅ load variables from .env.local

import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
});

async function addUser() {
  const username = 'admin';
  const rawPassword = 'admin456';
  const hashed = await bcrypt.hash(rawPassword, 10);

  await pool.query(
    'INSERT INTO admin (username, password) VALUES ($1, $2)',
    [username, hashed]
  );

  console.log('✅ User added');
}

addUser();
