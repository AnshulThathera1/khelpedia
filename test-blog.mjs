import { config } from 'dotenv';
import { query } from './src/lib/db.js';

config({ path: '.env.local' });

async function run() {
    const link = 'https://www.vlr.gg/760697/loud-silences-edward-gaming-with-sweep-in-shanghai';
    const res = await query('SELECT id FROM blogs WHERE source_url = $1 LIMIT 1', [link]);
    if (res.rows.length > 0) {
        console.log('EXISTING_SOURCE_DETECTED');
        console.log('New blog records: 0');
    }
    process.exit(0);
}
run();
