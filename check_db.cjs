const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:MNbniQbo7aGBzInQ@db.yfzibvkdizzajnevvqde.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log('Connected!');

    const res = await client.query('SELECT COUNT(*) FROM teams');
    console.log('Teams count:', res.rows[0].count);
    const res2 = await client.query('SELECT COUNT(*) FROM players');
    console.log('Players count:', res2.rows[0].count);
    const res3 = await client.query('SELECT COUNT(*) FROM seasons');
    console.log('Seasons count:', res3.rows[0].count);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
