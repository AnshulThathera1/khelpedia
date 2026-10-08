const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const statsHighlight = [
  { label: 'Games', value: '32,819', subtext: 'Clash Squad career' },
  { label: 'Wins', value: '18,575', subtext: '56.60% win rate' },
  { label: 'Eliminations', value: '137,043', subtext: 'Total eliminations' },
  { label: 'KDA', value: '2.33', subtext: 'Kill/Death/Assist' },
  { label: 'Headshots', value: '44,081', subtext: '32.17% headshot rate' },
  { label: 'MVPs', value: '11,658', subtext: 'Match MVP honors' },
];

const articleHtml = `
<p>In mobile gaming, player milestones are usually framed around tournament podiums, official league championships, or streaming highlights. Yet the vast majority of gaming takes place far away from broadcast stages. It happens on crowded commutes, late at night in shared bedrooms, and on hardware that was never engineered for demanding 3D games.</p>

<p>For Adarsh, known in Free Fire by the in-game name <strong>꧁☆☠ A A C H U ☠☆꧂</strong> (UID: 2619610630), gaming was never about entering the esports circuit or chasing a professional contract. Instead, it became a quiet, multi-year test of consistency across two budget smartphones. At the time of the screenshots provided to KhelPediA, his in-game records reflect <strong>32,819 Clash Squad matches</strong>, <strong>18,575 victories</strong>, and <strong>137,043 eliminations</strong>.</p>

<figure>
  <img src="/stories/adarsh/free-fire-career-stats.png" alt="Free Fire Clash Squad career statistics screenshot shared by Adarsh showing 32,819 matches and 137,043 eliminations" />
  <figcaption>Free Fire career statistics shared by Adarsh with KhelPediA.</figcaption>
</figure>

<blockquote style="border-left: 3px solid var(--accent-cyan); background: rgba(0, 189, 165, 0.05); padding: 1rem 1.25rem; margin: 1.75rem 0; font-style: normal;">
  <p style="margin: 0; font-size: 0.92rem; color: var(--text-secondary); line-height: 1.6;">
    <strong style="color: var(--accent-cyan);">Editorial Note:</strong> This community story was produced from an interview with Adarsh and screenshots he provided to KhelPediA. Adarsh confirmed that KhelPediA could use the supplied screenshots and discuss his gaming-device experience. Statistics shown are based on the screenshots provided by the player and reflect his in-game career profile at the time of submission.
  </p>
</blockquote>

<h2>Starting Free Fire in 2018</h2>

<p>Adarsh began playing Free Fire around 2018. Like many players across India during that period, he was introduced to the title after seeing friends at school and in his neighborhood playing together on their phones. Battle royale gaming was taking off on mobile, and Free Fire offered a low download footprint that made it accessible.</p>

<p>His starting setup was as basic as it got: a <strong>Samsung Galaxy J2</strong>. Powered by an entry-level processor and equipped with just <strong>1 GB of RAM</strong>, the handset struggled with almost any graphics-intensive workload. Loading times were long, textures stuttered, and extended sessions caused the phone to warm up quickly.</p>

<p>From the outset, Adarsh approached the game casually. He did not assemble a dedicated squad, set practice routines, or coordinate voice-comms strategies. When he had time during the day, he simply tapped matchmaking and jumped into a lobby.</p>

<h2>Why Clash Squad Became His Main Mode</h2>

<p>Although Battle Royale is Free Fire’s signature format, the technical demands of 50-player lobbies on large maps like Bermuda or Purgatory proved too taxing for a 1 GB device. Long draw distances, multiple squads rendering simultaneously, vehicle physics, and widespread particle effects caused persistent lag, intense device heating, and occasional game freezes.</p>

<p>When Garena introduced Clash Squad — a round-based 4v4 mode set in compact, sectioned-off areas of the map — Adarsh found a format where his phone could hold a stable frame rate. The smaller environments placed far less strain on his device's memory and processor.</p>

<p>Beyond performance, the rhythm of Clash Squad matched how he liked to play. Matches were brisk, decisive, and focused entirely on direct gunfights. Unlike Battle Royale, where several minutes could pass looting and rotating without spotting an enemy, Clash Squad put players into combat within seconds of the buy-phase countdown. Once he found that rhythm, Clash Squad became his primary mode.</p>

<h2>32,819 Matches and 137,043 Eliminations</h2>

<p>Over the years, those quick 4v4 rounds accumulated into a career total that few casual players ever approach. According to the screenshots shared with KhelPediA, Adarsh logged <strong>32,819 Clash Squad matches</strong>, recording <strong>18,575 wins</strong> — representing a <strong>56.60% win rate</strong> across thousands of rounds.</p>

<p>Along the way, he tallied <strong>137,043 eliminations</strong> with a career <strong>2.33 KDA</strong>, while registering <strong>44,081 headshots</strong> (a 32.17% headshot rate) and earning <strong>11,658 MVP awards</strong>.</p>

<div style="overflow-x: auto; margin: 2rem 0;">
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); text-align: left;">Metric</th>
        <th style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--accent-cyan); text-align: right;">Career Total</th>
        <th style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-muted); text-align: left;">Context</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color);">Games Played</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); font-weight: 700; text-align: right; color: var(--text-primary);">32,819</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); color: var(--text-muted);">Clash Squad lifetime</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color);">Matches Won</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); font-weight: 700; text-align: right; color: var(--text-primary);">18,575</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); color: var(--text-muted);">56.60% win rate</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color);">Total Eliminations</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); font-weight: 700; text-align: right; color: var(--text-primary);">137,043</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); color: var(--text-muted);">Career opponents eliminated</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color);">Knockdowns</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); font-weight: 700; text-align: right; color: var(--text-primary);">162,172</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); color: var(--text-muted);">Total players downed</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color);">Headshots</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); font-weight: 700; text-align: right; color: var(--text-primary);">44,081</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); color: var(--text-muted);">32.17% precision rate</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color);">Average Damage</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); font-weight: 700; text-align: right; color: var(--text-primary);">2,037</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); color: var(--text-muted);">Damage per match</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color);">MVP Finishes</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); font-weight: 700; text-align: right; color: var(--text-primary);">11,658</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); color: var(--text-muted);">Match MVP selections</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color);">Double Takedowns</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); font-weight: 700; text-align: right; color: var(--text-primary);">24,535</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); color: var(--text-muted);">2 quick eliminations</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color);">Triple Takedowns</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); font-weight: 700; text-align: right; color: var(--text-primary);">9,181</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); color: var(--text-muted);">3 quick eliminations</td>
      </tr>
      <tr>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color);">Quadra Takedowns</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); font-weight: 700; text-align: right; color: var(--text-primary);">2,752</td>
        <td style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); color: var(--text-muted);">Full team wipes (4-man)</td>
      </tr>
    </tbody>
  </table>
</div>
<p style="font-size: 0.8rem; color: var(--text-muted); margin-top: -1rem; margin-bottom: 2rem;"><em>Source note: Statistics shown are based on screenshots provided to KhelPediA by Adarsh.</em></p>

<figure>
  <img src="/stories/adarsh/free-fire-profile-uid.png" alt="Free Fire in-game profile screen for Adarsh showing IGN ꧁☆☠ A A C H U ☠☆꧂, UID 2619610630, Level 73, and Clash Squad badges" />
  <figcaption>In-game profile screen showing player IGN and UID 2619610630, shared by Adarsh with KhelPediA.</figcaption>
</figure>

<h2>Playing Mostly With Random Teammates</h2>

<p>One of the most defining aspects of Adarsh’s journey is that he built these totals almost entirely through solo queue matchmaking. Unlike competitive clans who play with regular teammates over Discord, call out enemy positions, and assign tactical roles, Adarsh queued by himself.</p>

<p>Playing with random teammates in Clash Squad introduces complete unpredictability. In some games, players coordinate rotations and share gloo walls instinctively. In others, teammates leave during the first round, run into open lines of fire, or go AFK entirely. Adarsh notes that the experience produced a wide mix of funny moments and genuinely frustrating losses.</p>

<p>Over thousands of matches, solo queuing shaped how he played. Knowing he could not depend on teammates to watch his flanks or trade eliminations, he learned to rely on himself: keeping an eye on the mini-map, conserving gloo walls for tight corners, and playing angles where he wouldn’t be caught without cover.</p>

<h2>Years of Playing on Low-End Phones</h2>

<p>As time went on, Adarsh upgraded from the Samsung Galaxy J2 to a <strong>POCO C3</strong>. With 4 GB of RAM and an octa-core MediaTek Helio G35 processor, the POCO was a step up from a 1 GB device, but it was still an entry-level smartphone with clear hardware ceilings.</p>

<figure class="story-figure-portrait">
  <img src="/stories/adarsh/poco-c3-device-specs.png" alt="POCO C3 device specifications screen showing 4 GB RAM, Octa-core Max 2.30 GHz CPU, and MIUI Global software" />
  <figcaption>POCO C3 specifications showing the device Adarsh used during his Free Fire journey.</figcaption>
</figure>

<p>During longer gaming sessions, the phone presented familiar budget-device symptoms:</p>

<ul>
  <li><strong>Device heating:</strong> Extended play warmed up the chassis, prompting thermal throttling.</li>
  <li><strong>Frame drops and lag:</strong> When multiple players threw smoke grenades or rushed simultaneously, framerates dipped noticeably.</li>
  <li><strong>Occasional game hangs:</strong> The app would occasionally freeze during intense moments, requiring a quick restart.</li>
  <li><strong>Battery drain:</strong> Sustained gaming drew down battery life quickly, forcing him to balance charge cycles with play sessions.</li>
</ul>

<h2>Learning to Adapt to Hardware Limitations</h2>

<p>Rather than putting down the game because his phone lagged, Adarsh learned to adapt his mechanics to the phone’s capabilities. On higher-end hardware, players often rely on instantaneous touch response and high frame rates to execute rapid claw swipes, quick gloo-wall placements, and aggressive snap turns.</p>

<p>On a device prone to micro-stutters, attempting rapid, erratic swipes often resulted in dropped inputs. Adarsh adjusted by focusing on fundamentals: pre-aiming corners where opponents were likely to emerge, controlling engagement distances, and timing shots carefully instead of relying purely on reaction speed.</p>

<p>He believes dealing with hardware limitations ultimately helped him as a player. It required patience and forced him to think through his positioning rather than depending on hardware advantage.</p>

<h2>What Kept Him Playing for So Long</h2>

<p>Reaching over 32,000 matches requires hundreds of hours invested across years. When asked what kept him coming back for so long, Adarsh pointed simply to consistency. Playing Clash Squad had become part of his everyday routine — an enjoyable way to unwind after his day.</p>

<p>He never had a specific long-term competitive ambition. He wasn't practicing to become a professional tournament player or looking to build a social media following. He kept queuing because he genuinely enjoyed the core loop of Clash Squad.</p>

<h2>What the Numbers Mean to Him</h2>

<p>Looking back at his career numbers — 32,819 matches and 137,043 eliminations — Adarsh feels proud of what he accomplished through simple persistence. At the same time, he mentioned that after spending so many years on the game, he has felt that the journey unfolded without much recognition. He would simply be happy if his story received some recognition and reached fellow players across the gaming community who understand what grinding on low-end hardware feels like.</p>

<p>Currently, Adarsh is not playing much, and he does not have a specific future goal in Free Fire. His focus is on other aspects of life, while his career statistics remain as a clear record of an era of dedicated gaming.</p>

<h2>Advice for Budget-Phone Players</h2>

<p>For players who want to enjoy mobile games but feel held back because they cannot afford a high-end device, Adarsh offers practical advice drawn directly from his experience:</p>

<ul>
  <li><strong>Don't stress over having an expensive phone:</strong> You don't need a flagship device to play and get better.</li>
  <li><strong>Learn to play around your hardware limits:</strong> Understand when your phone struggles, avoid cluttered fights that cause frame drops, and focus on positioning.</li>
  <li><strong>Don't depend completely on random teammates:</strong> In solo queue, focus on your own gameplay, make smart choices, and be prepared to hold your own round.</li>
  <li><strong>Play your own game and enjoy it:</strong> Games are meant to be fun. Don't let gear comparisons take away from your enjoyment.</li>
</ul>

<h2>The Story Behind the Numbers</h2>

<p>It is easy to glance at an in-game profile, see 32,819 matches and 137,043 eliminations, and view them simply as large numbers on a screen. But behind those statistics is the story of thousands of matches played one round at a time, through lag spikes, heating handsets, and random squadmates.</p>

<p>Adarsh's main message is that the numbers did not come easily. They were built through years of quiet consistency on a Samsung Galaxy J2 and a POCO C3 — an authentic grassroots journey that represents what mobile gaming is for millions of players across India.</p>
`;

async function updateAdarshStory() {
  try {
    const updateQuery = `
      UPDATE community_stories
      SET
        title = $1,
        subtitle = $2,
        excerpt = $3,
        content = $4,
        game_name = $5,
        category = $6,
        player_name = $7,
        player_ign = $8,
        player_uid = $9,
        player_mode = $10,
        cover_image = $11,
        og_image = $12,
        stats_highlight = $13,
        verification_notes = $14,
        author_name = $15,
        status = $16,
        featured = $17,
        seo_title = $18,
        seo_description = $19,
        published_at = COALESCE(published_at, NOW()),
        updated_at = NOW()
      WHERE slug = $20
      RETURNING id, slug, title, status, player_ign;
    `;

    const values = [
      "32,819 Clash Squad Matches on a Low-End Phone: Adarsh's Free Fire Journey",
      "From a Samsung Galaxy J2 to a POCO C3, Adarsh spent years playing Free Fire's Clash Squad mode, mostly with random teammates, building more than 32,000 matches and 137,043 eliminations along the way.",
      "From a Samsung Galaxy J2 to a POCO C3, Adarsh spent years playing Free Fire's Clash Squad mode with random teammates, reaching 32,819 matches and 137,043 eliminations on low-end hardware.",
      articleHtml,
      "Free Fire",
      "Player Story",
      "Adarsh",
      "꧁☆☠ A A C H U ☠☆꧂",
      "2619610630",
      "Clash Squad",
      "/stories/adarsh/free-fire-career-stats.png",
      "/stories/adarsh/free-fire-career-stats.png",
      JSON.stringify(statsHighlight),
      "Statistics shown are based on screenshots provided to KhelPediA by Adarsh.",
      "KhelPediA Editorial",
      "published",
      true,
      "Adarsh's Free Fire Journey: 32,819 Clash Squad Matches",
      "Discover Adarsh's Free Fire journey, from playing on a Samsung Galaxy J2 to reaching 32,819 Clash Squad matches and 137,043 eliminations on a POCO C3.",
      "adarsh-free-fire-journey"
    ];

    const result = await pool.query(updateQuery, values);
    console.log('Update result:', result.rows);
  } catch (error) {
    console.error('Error updating Adarsh story:', error);
  } finally {
    await pool.end();
  }
}

updateAdarshStory();
