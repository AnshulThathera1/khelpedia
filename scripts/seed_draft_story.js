const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function insertDraft() {
  try {
    const check = await pool.query('SELECT id, status FROM community_stories WHERE slug = $1', ['adarsh-free-fire-journey']);
    if (check.rows.length === 0) {
      const stats = [
        { label: 'Games', value: '32,819' },
        { label: 'Wins', value: '18,575' },
        { label: 'Eliminations', value: '137,043' },
        { label: 'Win Rate', value: '56.60%' },
        { label: 'KDA', value: '2.33' },
        { label: 'Headshots', value: '44,081' }
      ];

      await pool.query(
        `INSERT INTO community_stories (
          slug, title, subtitle, excerpt, content, game_id, game_name, category,
          player_name, player_ign, player_uid, player_mode, stats_highlight,
          verification_notes, author_name, status, featured,
          seo_title, seo_description
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )`,
        [
          'adarsh-free-fire-journey',
          '32,819 Clash Squad Matches on a Low-End Phone: Adarsh\'s Free Fire Journey',
          'How perseverance, hundreds of hours, and sheer discipline defined one player\'s relentless Clash Squad milestone.',
          'Over 32,000 matches, 18,000+ victories, and tens of thousands of clutch headshots: an in-depth community editorial on Adarsh\'s Free Fire journey.',
          '<p>Story content pending final player confirmation.</p>',
          '071fcf15-d458-49dd-8574-c4829c9f87ff',
          'Free Fire',
          'Player Story',
          'Adarsh',
          'A A C H U',
          '2619610630',
          'Clash Squad',
          JSON.stringify(stats),
          'Statistics shown are based on screenshots provided to KhelPediA by the player.',
          'KhelPediA Editorial',
          'draft', // DRAFT ONLY - WAITING FOR PLAYER CONFIRMATION
          true,
          'Adarsh\'s Free Fire Journey | Community Stories',
          'Read the inspiring community story of Adarsh (A A C H U) and his journey through 32,819 Clash Squad matches in Free Fire.'
        ]
      );
      console.log('Adarsh story prepared cleanly as DRAFT in community_stories table.');
    } else {
      console.log('Adarsh story already present with status:', check.rows[0].status);
    }
  } catch (error) {
    console.error('Error seeding draft:', error);
  } finally {
    await pool.end();
  }
}

insertDraft();
