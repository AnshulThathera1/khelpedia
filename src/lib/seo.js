import { query } from "./db";

// ---------------------------------------------------------
// SHARED INDEXABILITY RULES
// These conditions are shared between Sitemaps and Page Metadata
// to ensure Google only crawls what we actually index.
// ---------------------------------------------------------

export const TOURNAMENT_INDEXABLE_SQL = `
  LENGTH(TRIM(COALESCE(t.editorial_content, ''))) > 50
  OR (
    EXISTS (SELECT 1 FROM tournament_teams tt WHERE tt.tournament_id = t.id)
    AND EXISTS (SELECT 1 FROM matches m WHERE m.tournament_id = t.id)
  )
`;

export const TEAM_INDEXABLE_SQL = `
  LENGTH(TRIM(COALESCE(t.editorial_content, ''))) > 50
  OR (
    EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id)
    AND EXISTS (SELECT 1 FROM tournament_teams tt WHERE tt.team_id = t.id)
  )
`;

export const PLAYER_INDEXABLE_SQL = `
  p.ign IS NOT NULL AND TRIM(p.ign) != ''
`;

export const BLOG_INDEXABLE_SQL = `
  b.is_published = true
`;

// ---------------------------------------------------------
// PAGE-LEVEL HELPERS
// Used in generateMetadata to determine robots: { index }
// ---------------------------------------------------------

export async function checkTournamentIndexable(id) {
  try {
    const res = await query(`SELECT 1 FROM tournaments t WHERE t.id = $1 AND (${TOURNAMENT_INDEXABLE_SQL})`, [id]);
    return res.rowCount > 0;
  } catch (error) {
    console.error("Error checking tournament indexability", error);
    return false;
  }
}

export async function checkTeamIndexable(id) {
  try {
    const res = await query(`SELECT 1 FROM teams t WHERE t.id = $1 AND (${TEAM_INDEXABLE_SQL})`, [id]);
    return res.rowCount > 0;
  } catch (error) {
    console.error("Error checking team indexability", error);
    return false;
  }
}
