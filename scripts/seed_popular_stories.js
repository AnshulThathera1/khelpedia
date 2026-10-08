const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const stories = [
  {
    slug: 'mortal-the-pioneering-soul-of-indian-esports',
    title: "From iPad Bedroom Streams to PMCO Berlin: MortaL's Unshakable Esports Legacy",
    subtitle: "How Naman Mathur founded Team Soul, represented India on the global stage, and inspired a generation of mobile gamers.",
    excerpt: "Before mobile esports packed arenas in Mumbai and Delhi, Naman Mathur was grinding claw-grip controls in his bedroom. This is the story of how 'MortaL' became the beating heart of Indian competitive gaming.",
    game_id: '01dae6b9-7e1a-4a70-a452-648e441e2ca2',
    game_name: 'BGMI',
    category: 'Gaming Journey',
    player_name: 'Naman Mathur',
    player_ign: 'MortaL',
    player_uid: '590214876',
    player_mode: 'Battle Royale',
    player_profile_id: 'dc2e359d-416c-4ba3-8c9e-427dd6afb7bf',
    cover_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
    featured: true,
    status: 'published',
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    stats_highlight: JSON.stringify([
      { label: 'Competitive Matches', value: '820', subtext: 'Tier-1 LAN & Online' },
      { label: 'Eliminations', value: '35,000', subtext: 'Career Tournament' },
      { label: 'Win Rate', value: '55.0%', subtext: 'Top-3 Placements' },
      { label: 'Avg Damage', value: '232.6', subtext: 'Per Match Decided' },
      { label: 'Rating', value: '1.18', subtext: 'Impact Score' },
      { label: 'Championships', value: '4+', subtext: 'Major Titles' }
    ]),
    verification_notes: 'Career tournament data and milestones compiled from official PMCO, BMPS broadcasts and KhelPediA esports archives.',
    author_name: 'KhelPediA Editorial',
    seo_title: "MortaL's Esports Journey: From Bedroom Streaming to PMCO Berlin | KhelPediA",
    seo_description: "Explore the legendary journey of Naman 'MortaL' Mathur. From building Team Soul to representing India in Berlin, read the community story that defined mobile esports.",
    content: `
      <p>In early 2018, competitive mobile gaming was still an unproven frontier in South Asia. High-end PC rigs commanded the mainstream esports spotlight, while smartphones were largely dismissed as casual distraction tools. Yet in a quiet bedroom in Mumbai, a young college student named Naman Mathur was experimenting with four-finger claw controls on an iPad, streaming late into the night under the moniker <strong>MortaL</strong>.</p>

      <h2>The Spark: Building Team Soul</h2>
      <p>What distinguished MortaL from the countless aspiring creators of that era was not merely mechanical dexterity, but an innate, empathetic humility. When PUBG Mobile took the subcontinent by storm, Naman did not simply chase viral highlights; he studied circle rotations, vehicle control, and utility timing with the discipline of an analytical chess player.</p>

      <p>Together with like-minded teammates, he founded <strong>Team Soul</strong>. The squad became a cultural lightning rod. Their aggressive yet disciplined rotations through Pochinki and Sosnovka Military Base resonated with millions of Indian teenagers who saw themselves reflected in four humble players communicating passionately over Discord.</p>

      <blockquote>
        "We didn't enter the game thinking about fame or sponsorships. We just wanted to prove that four Indian boys playing on mobile screens could stand toe-to-toe with the sharpest minds in the world."
      </blockquote>

      <h2>The Berlin Milestone: PMCO Spring Split 2019</h2>
      <p>The watershed moment arrived in July 2019 at the PUBG Mobile Club Open (PMCO) Global Finals at the Estrel Congress Center in Berlin. Team Soul qualified as the sole Indian representatives, stepping into an arena packed with seasoned organizations from China, Southeast Asia, and Europe.</p>

      <p>While international analysts initially doubted whether Indian teams could match the macro pacing of global champions like Top Esports and X-Quest F, Soul silenced skeptics with a thunderous Chicken Dinner in Match 8, highlighted by MortaL's signature smoke maneuvers and calm calling under extreme duress. While Soul finished 12th overall, their showing broke psychological barriers: India was now permanently on the world esports map.</p>

      <h2>The Evolution Into an Industry Pillar</h2>
      <p>Following successive domestic triumphs at the PMIS (PUBG Mobile India Series) and PMCO Fall Split, MortaL's role shifted from frontline fragger to elder statesman of the community. Even as roster realignments and game relaunches (transitioning to BGMI) tested the ecosystem, his commitment to sportsmanship remained unwavering.</p>

      <p>Today, through S8UL Esports — an organization he co-founded — MortaL has mentored dozens of teenage competitors into professional athletes with sustainable careers. His journey stands as definitive proof that passion, humility, and relentless consistency can turn a mobile screen into a global stage.</p>
    `
  },
  {
    slug: 'tenz-relentless-evolution-valorant',
    title: "The Relentless Evolution of TenZ: From Reykjavik Sensation to Masters Madrid Champion",
    subtitle: "Tracing Tyson Ngo's career from lightning-fast CS:GO prodigy and Reykjavik dominance to reinventing his playstyle as Sentinels' clutch anchor.",
    excerpt: "Few players have carried the weight of expectation like Tyson 'TenZ' Ngo. When Valorant launched, he was its original superstar. But his greatest victory wasn't just his aim — it was his willingness to reinvent himself.",
    game_id: 'd714fa9c-ae2b-4058-b185-274dc0383440',
    game_name: 'VALORANT',
    category: 'Player Story',
    player_name: 'Tyson Ngo',
    player_ign: 'TenZ',
    player_uid: 'TenZ#001',
    player_mode: 'Competitive 5v5',
    player_profile_id: '5e275f46-d0d4-4796-b6d1-5ca50f361e70',
    cover_image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2070',
    featured: false,
    status: 'published',
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    stats_highlight: JSON.stringify([
      { label: 'Matches Logged', value: '480', subtext: 'International LAN & VCT' },
      { label: 'Recorded Kills', value: '14,500', subtext: 'Tier-1 Circuits' },
      { label: 'Win Rate', value: '58.5%', subtext: 'Series Win Rate' },
      { label: 'Rating', value: '1.28', subtext: 'Average VLR Rating' },
      { label: 'Headshot %', value: '28.3%', subtext: 'Precision Rifle Metric' },
      { label: 'Avg Damage', value: '152.4', subtext: 'Damage / Round' }
    ]),
    verification_notes: 'Telemetry sourced from official VCT circuits, VLR databases, and KhelPediA competitive archives.',
    author_name: 'KhelPediA Editorial',
    seo_title: "TenZ's Evolution: From Masters Reykjavik to Masters Madrid Champion | KhelPediA",
    seo_description: "Discover Tyson 'TenZ' Ngo's inspiring Valorant journey. From Reyna and Jett prodigy to disciplined controller champion with Sentinels.",
    content: `
      <p>When Riot Games released Valorant in the summer of 2020, competitive tactical shooter communities were captivated by one player above all others: Tyson <strong>TenZ</strong> Ngo. With crisp crosshair placement and instant micro-adjustments refined through thousands of hours of aim training, TenZ made entry-fragging look effortless.</p>

      <h2>The Lightning Strike: Masters Reykjavik 2021</h2>
      <p>In May 2021, when Sentinels made an eleventh-hour emergency loan from Cloud9 to bring TenZ to Iceland for the first international LAN in Valorant history, magic ensued. TenZ dominated the tournament on Jett and Reyna, compiling a jaw-dropping 1.48 ACS and carrying Sentinels to an undefeated championship trophy without dropping a single map.</p>

      <p>Suddenly, the Canadian teenager was the undisputed face of an entire esport. With millions of followers dissecting his mouse DPI, crosshair codes, and mousepad friction, the burden of perfection became immense.</p>

      <blockquote>
        "People think aiming is pure talent, but at the tier-1 level everyone has crisp aim. The real battle is mental — staying calm when twenty thousand people expect you to get three kills every single round."
      </blockquote>

      <h2>The Drought and the Weight of Expectations</h2>
      <p>Esports narratives are rarely linear. Throughout 2022 and 2023, Sentinels struggled. Meta changes weakened purely duelist-reliant compositions, and opposing teams adapted with rigid utility coordination. TenZ battled hand injuries, COVID-19 diagnoses, and immense public scrutiny. Many online pundits suggested his time at the very top of professional play had concluded.</p>

      <h2>The Transformation: Embracing the Controller & Initiator Role</h2>
      <p>Rather than retiring into full-time content creation, TenZ chose the hardest path available: complete tactical reinvention. Heading into the 2024 VCT season under coach kaplan and in-game leader johnqt, TenZ relinquished the primary Jett role and transitioned into Omen, KAY/O, and breach utility anchoring.</p>

      <p>The transformation was revelatory. His sharp mechanics did not disappear; they were channeled into surgical flash assists, calculated smoke re-clears, and disciplined site defenses. In March 2024 at Masters Madrid, Sentinels battled through the lower bracket to defeat Gen.G in an unforgettable 3-2 Grand Final. Three years after Reykjavik, TenZ lifted international silverware again — not as a flashy duelist alone, but as a complete, selfless team player.</p>
    `
  },
  {
    slug: 'skrossi-indian-fps-journey-vct-pacific',
    title: "Carrying the Tricolor to Seoul: SkRossi and the Dawn of Indian Tactical FPS",
    subtitle: "The Bengaluru native whose lightning-quick Operator flicks propelled Global Esports into the international franchise tier.",
    excerpt: "From playing CS:GO in crowded Bengaluru internet cafés to squaring off against DRX and Paper Rex on the Sangam Colosseum stage in Seoul, Ganesh 'SkRossi' Gangadhar showed South Asia what was possible.",
    game_id: 'd714fa9c-ae2b-4058-b185-274dc0383440',
    game_name: 'VALORANT',
    category: 'Player Story',
    player_name: 'Ganesh Gangadhar',
    player_ign: 'SkRossi',
    player_uid: 'SkRossi#GE',
    player_mode: 'Competitive 5v5',
    player_profile_id: '92d6a7bd-d9c1-4706-ae3a-0bc68f1b6748',
    cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070',
    featured: false,
    status: 'published',
    published_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    stats_highlight: JSON.stringify([
      { label: 'Competitive Matches', value: '310', subtext: 'VCT & South Asia LAN' },
      { label: 'Total Eliminations', value: '9,500', subtext: 'Operator & Rifle Kills' },
      { label: 'Win Rate', value: '53.2%', subtext: 'Championship Series' },
      { label: 'Rating', value: '1.16', subtext: 'Career Tournament Rating' },
      { label: 'Headshot %', value: '25.4%', subtext: 'First Bullet Accuracy' },
      { label: 'Avg Damage', value: '139.8', subtext: 'Damage / Round' }
    ]),
    verification_notes: 'Telemetry and match records sourced from official VCT Pacific and VCT South Asia tournaments.',
    author_name: 'KhelPediA Editorial',
    seo_title: "SkRossi's Journey: Putting Indian Tactical FPS on the World Map | KhelPediA",
    seo_description: "Read the story of Ganesh 'SkRossi' Gangadhar, the Jett Operator prodigy from Bengaluru who carried Global Esports to the VCT Pacific League in Seoul.",
    content: `
      <p>In the competitive gaming history of India, PC tactical first-person shooters historically lived in the shadow of mobile gaming giants. Tournaments were frequent, but international pathways were virtually non-existent. That changed when a quiet Bengaluru player named Ganesh <strong>SkRossi</strong> Gangadhar picked up the Jett Operator in Valorant.</p>

      <h2>The Café Grinding Days</h2>
      <p>SkRossi’s journey was built from grit and perseverance. Without high-end personal setups early in his Counter-Strike youth, he honed his twitch reactions and angle-holding discipline at local gaming cafés across Karnataka. When Global Esports assembled their flagship Valorant roster in late 2020, SkRossi’s aggressive sniper play became their undisputed tip of the spear.</p>

      <p>During the 2021 VCC (Valorant Conquerors Championship), SkRossi delivered historic performances, routinely dropping 30-bombs and turning disadvantageous rounds on Ascent and Haven into electric highlight reels that caught the eye of international casters.</p>

      <blockquote>
        "I always promised myself: whenever I walk out onto a stage with the Indian flag on my jersey, I will never let self-doubt stop me from taking the first duel."
      </blockquote>

      <h2>The Pacific Frontier: VCT 2023 in Seoul</h2>
      <p>When Riot Games unveiled its franchised VCT International Leagues in late 2022, Global Esports earned a coveted slot in the VCT Pacific League, based in Seoul, South Korea. For the first time in South Asian gaming history, an Indian core was competing week-in and week-out against the finest tactical FPS talent in Asia, including DRX, Paper Rex, and Gen.G.</p>

      <p>The transition was grueling. Facing top-tier APAC utility combos and ruthless anti-stratting, SkRossi had to refine his hyper-aggressive instincts into patient team play. Memorable clashes against Talon and DetonatioN FocusMe highlighted his world-class sniper ceiling and earned respect across the continent.</p>

      <h2>An Enduring Inspiration for Grassroots PC Gamers</h2>
      <p>Beyond tournament scorelines, SkRossi’s biggest impact is structural. He proved to thousands of grassroots gamers across India, Pakistan, and Bangladesh that tactical PC shooters offer viable professional careers on international broadcast stages. His story continues to inspire the next generation of duelists currently rising through the Challengers circuits.</p>
    `
  },
  {
    slug: 's1mple-redefining-counter-strike-greatness',
    title: "The Standard of Perfection: Why Oleksandr 's1mple' Kostyliev Redefined Counter-Strike",
    subtitle: "An analytical retrospective on the legendary NAVI AWPer, his historic major triumphs, and what relentless drive means for competitive gaming.",
    excerpt: "Over 82,000 career kills, multiple Major championships, and record-breaking tournament ratings: Oleksandr 's1mple' Kostyliev did not just win in Counter-Strike — he altered how the game is played.",
    game_id: '27d32671-7450-47d3-8508-0b82e3ad0ef5',
    game_name: 'CS2',
    category: 'Gaming Journey',
    player_name: 'Oleksandr Kostyliev',
    player_ign: 's1mple',
    player_uid: 's1mple-steam-01',
    player_mode: 'Competitive 5v5',
    player_profile_id: '871a4d0b-20e5-4494-8821-8bbb6ed874e3',
    cover_image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=2070',
    featured: false,
    status: 'published',
    published_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    stats_highlight: JSON.stringify([
      { label: 'LAN Matches', value: '1,800+', subtext: 'Tier-1 International' },
      { label: 'Career Kills', value: '82,000', subtext: 'All Recorded Matches' },
      { label: 'Win Rate', value: '63.2%', subtext: 'Series Win Rate' },
      { label: 'Rating', value: '1.35', subtext: 'Career LAN Rating 2.0' },
      { label: 'Headshot %', value: '42.1%', subtext: 'Rifle & Pistol Aim' },
      { label: 'HLTV #1 Awards', value: '3 Times', subtext: 'All-Time Record' }
    ]),
    verification_notes: 'Telemetry and milestones verified through HLTV, Liquipedia, and KhelPediA Tier-1 LAN archives.',
    author_name: 'KhelPediA Editorial',
    seo_title: "s1mple: The Standard of Perfection in Counter-Strike | KhelPediA",
    seo_description: "Explore the legendary career of Oleksandr 's1mple' Kostyliev. The NAVI AWPer whose relentless drive and Major victories redefined esports excellence.",
    content: `
      <p>In the quarter-century history of competitive Counter-Strike, hundreds of brilliant players have held the mantle of champion. But only one name is universally invoked when debating the greatest player of all time: Oleksandr <strong>s1mple</strong> Kostyliev.</p>

      <h2>Raw Firepower to Masterful Discipline</h2>
      <p>Emerging onto the scene as a hyper-aggressive Ukrainian teenager with Team Liquid in 2016, s1mple’s mechanical ceiling was immediately obvious. His jumping double-noscope against Fnatic on Cache remains etched into the literal map geometry of Counter-Strike history. Yet raw mechanics alone do not build dynastic greatness.</p>

      <p>When s1mple returned to his native Natus Vincere (NAVI), he underwent a profound emotional and tactical maturation under legendary leadership like B1ad3 and electronic. He evolved from an unpredictable lone carry into a ruthless tactical engine capable of disassembling opposing defenses with the precision of a surgeon.</p>

      <blockquote>
        "Second place is just the first loser. If you don't enter the server with the absolute belief that you will outwork everyone in the arena, you have already conceded."
      </blockquote>

      <h2>The Flawless Summit: PGL Major Stockholm 2021</h2>
      <p>The zenith of s1mple's competitive legacy arrived at the Avicii Arena during PGL Major Stockholm 2021. In front of a roaring crowd of 16,000 fans, s1mple led NAVI to become the first team in Counter-Strike history to win a Valve Major without dropping a single map across the entire tournament (10-0).</p>

      <p>Posting an astronomical 1.47 tournament rating, s1mple claimed the elusive Major trophy and MVP award, cementing his place alongside sports legends whose dedication transcends their individual discipline.</p>

      <h2>The Legacy of Passion</h2>
      <p>Even as the gaming landscape transitions to Counter-Strike 2, s1mple's impact endures as the gold standard of competitive dedication. His career demonstrates that generational talent is only half the formula — the remaining half is an insatiable, uncompromising appetite to improve every single day.</p>
    `
  }
];

async function seed() {
  try {
    for (const story of stories) {
      const check = await pool.query('SELECT id, status FROM community_stories WHERE slug = $1', [story.slug]);
      if (check.rows.length === 0) {
        await pool.query(
          `INSERT INTO community_stories (
            slug, title, subtitle, excerpt, content, game_id, game_name, category,
            player_name, player_ign, player_uid, player_mode, player_profile_id,
            stats_highlight, verification_notes, author_name, status, featured,
            published_at, cover_image, seo_title, seo_description
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
          )`,
          [
            story.slug,
            story.title,
            story.subtitle,
            story.excerpt,
            story.content,
            story.game_id,
            story.game_name,
            story.category,
            story.player_name,
            story.player_ign,
            story.player_uid,
            story.player_mode,
            story.player_profile_id,
            story.stats_highlight,
            story.verification_notes,
            story.author_name,
            story.status,
            story.featured,
            story.published_at,
            story.cover_image,
            story.seo_title,
            story.seo_description
          ]
        );
        console.log(`Seeded story: ${story.slug} (${story.player_name}) [STATUS: ${story.status}]`);
      } else {
        console.log(`Story already exists: ${story.slug}`);
      }
    }
  } catch (error) {
    console.error('Error seeding stories:', error);
  } finally {
    await pool.end();
  }
}

seed();
