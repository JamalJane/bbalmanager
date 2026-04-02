const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres:MNbniQbo7aGBzInQ@db.yfzibvkdizzajnevvqde.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL!');

    const sql = fs.readFileSync('C:/Users/bashe/TryingOut/src/sql/hardwood_complete.sql', 'utf8');
    console.log('Executing schema...');
    await client.query(sql);
    console.log('Schema applied successfully!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
