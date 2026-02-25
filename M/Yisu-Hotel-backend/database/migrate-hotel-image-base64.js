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

    await client.query('ALTER TABLE hotels ADD COLUMN IF NOT EXISTS main_image_base64 JSONB');
    await client.query('ALTER TABLE room_types ADD COLUMN IF NOT EXISTS room_image_base64 TEXT');

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
