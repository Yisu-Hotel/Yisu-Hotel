const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    await client.query('ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_base64 TEXT');
    await client.query('ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_gender_check');
    await client.query("ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_gender_check CHECK (gender IN ('男', '女', '保密'))");

    console.log('Migration completed.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

migrate();
