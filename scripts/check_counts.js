import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDetailedCounts() {
  try {
    const { count: blogs } = await supabase.from('blogs').select('*', { count: 'exact', head: true });
    const { count: blogPublished } = await supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('is_published', true);
    
    const { count: players } = await supabase.from('players').select('*', { count: 'exact', head: true });
    const { count: playersWithTeam } = await supabase.from('players').select('*', { count: 'exact', head: true }).not('team_id', 'is', null);
    const { count: playersWithEditorial } = await supabase.from('players').select('*', { count: 'exact', head: true }).not('editorial_content', 'is', null);

    const { count: teams } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    const { count: teamsWithEditorial } = await supabase.from('teams').select('*', { count: 'exact', head: true }).not('editorial_content', 'is', null);

    const { count: tournaments } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });
    const { count: tourneysWithEditorial } = await supabase.from('tournaments').select('*', { count: 'exact', head: true }).not('editorial_content', 'is', null);

    const { count: matches } = await supabase.from('matches').select('*', { count: 'exact', head: true });

    const { data: samplePlayers } = await supabase.from('players').select('id, ign, name, editorial_content, team_id, country').limit(5);
    const { data: sampleTeams } = await supabase.from('teams').select('id, name, region, editorial_content').limit(5);
    const { data: sampleBlogs } = await supabase.from('blogs').select('id, title, category, excerpt, content, author_id').limit(5);

    console.log("=== DB DETAILED COUNTS ===");
    console.log("Blogs total:", blogs);
    console.log("Blogs published:", blogPublished);
    console.log("Players total:", players);
    console.log("Players with team:", playersWithTeam);
    console.log("Players with editorial content:", playersWithEditorial);
    console.log("Teams total:", teams);
    console.log("Teams with editorial content:", teamsWithEditorial);
    console.log("Tournaments total:", tournaments);
    console.log("Tournaments with editorial content:", tourneysWithEditorial);
    console.log("Matches total:", matches);

    console.log("\n=== SAMPLE PLAYERS ===");
    console.log(samplePlayers);

    console.log("\n=== SAMPLE TEAMS ===");
    console.log(sampleTeams);

    console.log("\n=== SAMPLE BLOGS ===");
    console.log(sampleBlogs?.map(b => ({ title: b.title, category: b.category, excerptLength: b.excerpt?.length, contentLength: b.content?.length, author_id: b.author_id })));

    process.exit(0);
  } catch (err) {
    console.error("Error running DB check:", err);
    process.exit(1);
  }
}

checkDetailedCounts();
