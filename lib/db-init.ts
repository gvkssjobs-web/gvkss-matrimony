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
          role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
          photo VARCHAR(500),
          photo_blob BYTEA,
          photo_s3_url VARCHAR(500),
          phone_number VARCHAR(20),
          gender VARCHAR(20),
          dob DATE,
          marriage_status VARCHAR(50),
          birth_time TIME,
          birth_place VARCHAR(255),
          height VARCHAR(20),
          complexion VARCHAR(50),
          siblings_info JSONB,
          star VARCHAR(50),
          raasi VARCHAR(50),
          gothram VARCHAR(100),
          padam VARCHAR(50),
          uncle_gothram VARCHAR(100),
          education_category VARCHAR(100),
          education_details TEXT,
          employed_in VARCHAR(255),
          address TEXT,
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
          ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
          ALTER TABLE users ADD CONSTRAINT users_role_check 
          CHECK (role IN ('admin', 'user'));
        `);
        console.log('Role column added successfully');
      } else {
        // Update constraint if it exists - migrate from old roles to new simplified roles
        try {
          await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;`);
          // Update existing users with old roles to 'user'
          // Handle all variations: gold, silver, platinum, plat, etc.
          await client.query(`
            UPDATE users 
            SET role = 'user' 
            WHERE role NOT IN ('admin', 'user') OR role IS NULL;
          `);
          await client.query(`
            ALTER TABLE users ADD CONSTRAINT users_role_check 
            CHECK (role IN ('admin', 'user'));
          `);
          await client.query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';`);
          console.log('Role constraint updated successfully - migrated old roles to user');
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

      // Add new columns for extended profile information
      const newColumns = [
        { name: 'marriage_status', type: 'VARCHAR(50)' },
        { name: 'birth_time', type: 'TIME' },
        { name: 'birth_place', type: 'VARCHAR(255)' },
        { name: 'height', type: 'VARCHAR(20)' },
        { name: 'complexion', type: 'VARCHAR(50)' },
        { name: 'siblings_info', type: 'JSONB' }, // Store siblings info as JSON: {sisters: [{name, marriage_status}], brothers: [{name, marriage_status}]}
        { name: 'star', type: 'VARCHAR(50)' },
        { name: 'raasi', type: 'VARCHAR(50)' },
        { name: 'gothram', type: 'VARCHAR(100)' },
        { name: 'padam', type: 'VARCHAR(50)' },
        { name: 'uncle_gothram', type: 'VARCHAR(100)' },
        { name: 'education_category', type: 'VARCHAR(100)' },
        { name: 'education_details', type: 'TEXT' },
        { name: 'employed_in', type: 'VARCHAR(255)' },
        { name: 'address', type: 'TEXT' }
      ];

      for (const column of newColumns) {
        const columnExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = $1
          );
        `, [column.name]);

        if (!columnExists.rows[0].exists) {
          await client.query(`
            ALTER TABLE users ADD COLUMN ${column.name} ${column.type};
          `);
          console.log(`${column.name} column added successfully`);
        }
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
