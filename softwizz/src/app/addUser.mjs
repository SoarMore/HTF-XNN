import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addUser() {
  const username = 'testuser';
  const rawPassword = 'test123';
  const hashed = await bcrypt.hash(rawPassword, 10);

  await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2)',
    [username, hashed]
  );

  console.log('User added');
  process.exit();
}

addUser();
