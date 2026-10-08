const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function inspect() {
  try {
    const res = await pool.query('SELECT * FROM community_stories WHERE slug = $1', ['adarsh-free-fire-journey']);
    console.log('Found:', res.rows.length);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      console.log('Title:', row.title);
      console.log('Status:', row.status);
      console.log('Content preview:', row.content ? row.content.substring(0, 200) : 'null');
      console.log('Stats highlight:', row.stats_highlight);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

inspect();
