import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateWeek() {
    console.log("🏆 Starting KhelPediA Pick'Ems Week Simulation...");
    
    // 1. Get active league
    const { data: league } = await supabase
        .from('fantasy_leagues')
        .select('id')
        .eq('status', 'active')
        .single();
        
    if (!league) {
        console.error("No active league found!");
        process.exit(1);
    }
    
    // 2. Fetch all fantasy rosters
    const { data: rosters, error: rosterError } = await supabase
        .from('fantasy_rosters')
        .select(`
            id, team_id, slot_index, points_earned,
            player:players (
                id, ign,
                stats:player_stats(
                    rating, win_rate, headshot_pct, avg_damage
                )
            )
        `);
        
    if (rosterError) {
        console.error("Error fetching rosters:", rosterError);
        process.exit(1);
    }
    
    if (!rosters || rosters.length === 0) {
        console.log("No players drafted yet. Nothing to simulate.");
        process.exit(0);
    }

    // 3. Simulate points for each drafted player
    const teamPointsUpdates = {}; // Track new points per team
    
    console.log(`Simulating matches for ${rosters.length} drafted players...`);
    
    for (const roster of rosters) {
        const player = roster.player;
        const stats = player.stats?.[0];
        
        // Base points logic:
        // Use their historical rating as a baseline (e.g. 1.25 -> 12.5 points)
        // Add some RNG to simulate a "good" or "bad" week.
        let basePoints = stats && stats.rating ? (parseFloat(stats.rating) * 10) : 10;
        
        // Random multiplier between 0.5 (bad week) and 1.8 (insane week)
        const rngMultiplier = 0.5 + (Math.random() * 1.3);
        
        let newPoints = Math.round(basePoints * rngMultiplier);
        
        // Bonus for high win rate
        if (stats && parseFloat(stats.win_rate) > 55) {
            newPoints += Math.floor(Math.random() * 5);
        }

        // Update roster points_earned
        const totalPointsEarned = parseFloat(roster.points_earned) + newPoints;
        
        await supabase
            .from('fantasy_rosters')
            .update({ points_earned: totalPointsEarned })
            .eq('id', roster.id);
            
        // Accumulate points for the team
        if (!teamPointsUpdates[roster.team_id]) {
            teamPointsUpdates[roster.team_id] = 0;
        }
        teamPointsUpdates[roster.team_id] += newPoints;
        
        console.log(`  🎮 ${player.ign} scored ${newPoints} pts this week!`);
    }

    // 4. Update team total points
    console.log("\nUpdating Global Leaderboards...");
    for (const [teamId, newPoints] of Object.entries(teamPointsUpdates)) {
        // Fetch current points
        const { data: team } = await supabase
            .from('fantasy_teams')
            .select('total_points, name')
            .eq('id', teamId)
            .single();
            
        const updatedTotal = parseFloat(team.total_points) + newPoints;
        
        await supabase
            .from('fantasy_teams')
            .update({ total_points: updatedTotal })
            .eq('id', teamId);
            
        console.log(`  📈 ${team.name} gained ${newPoints} pts (Total: ${updatedTotal})`);
    }
    
    console.log("\n✅ Simulation complete! Week concluded.");
}

simulateWeek();
