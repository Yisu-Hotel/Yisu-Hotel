const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { Client } = require('pg');

async function initDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully!');

        const sqlFilePath = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing SQL script...');
        const statements = sql
            .split(';')
            .map((statement) => statement.trim())
            .filter(Boolean);

        for (const statement of statements) {
            try {
                await client.query(statement);
            } catch (error) {
                if (error.code === '42P07' || error.code === '42710') {
                    continue;
                }
                throw error;
            }
        }
        console.log('Database initialized successfully!');

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('Connection closed.');
    }
}

initDatabase();
