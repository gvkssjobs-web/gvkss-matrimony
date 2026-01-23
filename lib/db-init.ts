import pool from './db';

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Check if users table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Create users table if it doesn't exist
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'silver' CHECK (role IN ('admin', 'gold', 'silver', 'platinum')),
          photo VARCHAR(500),
          photo_blob BYTEA,
          photo_s3_url VARCHAR(500),
          phone_number VARCHAR(20),
          profession VARCHAR(255),
          age INTEGER,
          gender VARCHAR(20),
          education VARCHAR(255),
          city VARCHAR(255),
          dob DATE,
          partner_preference TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created successfully');
    } else {
      // Table exists, check and update role column if needed
      const roleColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'role'
        );
      `);

      if (!roleColumnExists.rows[0].exists) {
        // Add role column if it doesn't exist
        await client.query(`
          ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'silver';
          ALTER TABLE users ADD CONSTRAINT users_role_check 
          CHECK (role IN ('admin', 'gold', 'silver', 'platinum'));
        `);
        console.log('Role column added successfully');
      } else {
        // Update constraint if it exists
        try {
          await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;`);
          await client.query(`
            ALTER TABLE users ADD CONSTRAINT users_role_check 
            CHECK (role IN ('admin', 'gold', 'silver', 'platinum'));
          `);
          await client.query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'silver';`);
          console.log('Role constraint updated successfully');
        } catch (constraintError: any) {
          // Constraint might already exist with correct values, that's okay
          if (!constraintError.message.includes('already exists')) {
            throw constraintError;
          }
        }
      }

      // Check and add photo column if it doesn't exist
      const photoColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'photo'
        );
      `);

      if (!photoColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN photo VARCHAR(500);
        `);
        console.log('Photo column added successfully');
      }

      // Check and add photo_blob column for storing binary data
      const photoBlobColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'photo_blob'
        );
      `);

      if (!photoBlobColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN photo_blob BYTEA;
        `);
        console.log('Photo blob column added successfully');
      }

      // Check and add photo_s3_url column for S3 URL reference
      const photoS3UrlColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'photo_s3_url'
        );
      `);

      if (!photoS3UrlColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN photo_s3_url VARCHAR(500);
        `);
        console.log('Photo S3 URL column added successfully');
      }

      // Check and add phone_number column if it doesn't exist
      const phoneColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'phone_number'
        );
      `);

      if (!phoneColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
        `);
        console.log('Phone number column added successfully');
      }

      // Check and add profession column if it doesn't exist
      const professionColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'profession'
        );
      `);

      if (!professionColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN profession VARCHAR(255);
        `);
        console.log('Profession column added successfully');
      }

      // Check and add age column if it doesn't exist
      const ageColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'age'
        );
      `);

      if (!ageColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN age INTEGER;
        `);
        console.log('Age column added successfully');
      }

      // Check and add gender column if it doesn't exist
      const genderColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'gender'
        );
      `);

      if (!genderColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN gender VARCHAR(20);
        `);
        console.log('Gender column added successfully');
      }

      // Check and add education column if it doesn't exist
      const educationColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'education'
        );
      `);

      if (!educationColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN education VARCHAR(255);
        `);
        console.log('Education column added successfully');
      }

      // Check and add city column if it doesn't exist
      const cityColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'city'
        );
      `);

      if (!cityColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN city VARCHAR(255);
        `);
        console.log('City column added successfully');
      }

      // Check and add dob column if it doesn't exist
      const dobColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'dob'
        );
      `);

      if (!dobColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN dob DATE;
        `);
        console.log('DOB column added successfully');
      }

      // Check and add partner_preference column if it doesn't exist
      const partnerPreferenceColumnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'partner_preference'
        );
      `);

      if (!partnerPreferenceColumnExists.rows[0].exists) {
        await client.query(`
          ALTER TABLE users ADD COLUMN partner_preference TEXT;
        `);
        console.log('Partner preference column added successfully');
      }
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}
