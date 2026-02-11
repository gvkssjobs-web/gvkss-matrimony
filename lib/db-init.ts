import pool from './db';

export async function initDatabase() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        phone_number VARCHAR(20),
        gender VARCHAR(20),
        dob DATE,
        status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')),
        photo_s3_url VARCHAR(500),
        email_verification_token VARCHAR(255),
        email_verified_at TIMESTAMP,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ DB initialization failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
