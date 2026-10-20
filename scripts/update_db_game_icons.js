const { Client } = require('pg');

const DATABASE_URL = 'postgresql://khelpedia_db:Anshul%4012@88.222.245.63:5433/khelpedia';

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const mapping = {
    'valorant': '/images/games/valorant.svg',
    'cs2': '/images/games/cs2.svg',
    'bgmi': '/images/games/bgmi.png',
    'dota-2': '/images/games/dota2.svg',
    'free-fire': '/images/games/free_fire.svg',
    'pubg-mobile': '/images/games/pubg_mobile.svg'
  };

  for (const [slug, url] of Object.entries(mapping)) {
    const res = await client.query('UPDATE games SET icon_url = $1 WHERE slug = $2', [url, slug]);
    console.log(`Updated ${slug}:`, res.rowCount, 'row(s)');
  }

  const result = await client.query('SELECT slug, name, icon_url FROM games');
  console.log('Current games in DB:', result.rows);

  await client.end();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
