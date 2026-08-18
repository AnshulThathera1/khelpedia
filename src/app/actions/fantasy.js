'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getValorantProfile } from './valorant';

// Fetch the currently active global league
export async function getActiveLeague() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('fantasy_leagues')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (error) return { error: error.message };
    return { data };
}

// Get the user's fantasy team for a specific league
export async function getUserFantasyTeam(userId, leagueId) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('fantasy_teams')
        .select(`
            id, name, total_points,
            rosters:fantasy_rosters(
                id, slot_index, points_earned,
                player:players(
                    id, name, ign, role, image_url,
                    team:teams(name, logo_url),
                    stats:player_stats(game:games(name, slug))
                )
            )
        `)
        .eq('user_id', userId)
        .eq('league_id', leagueId)
        .maybeSingle();
    
    if (error) return { error: error.message };
    return { data };
}

// Create a new fantasy team
export async function createFantasyTeam(name, leagueId) {
    const supabase = await createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
        .from('fantasy_teams')
        .insert({
            user_id: userData.user.id,
            league_id: leagueId,
            name: name
        })
        .select()
        .single();
    
    if (error) return { error: error.message };
    revalidatePath('/fantasy');
    return { data };
}

// Draft a player to a specific slot (1-5)
export async function draftPlayer(teamId, playerId, slotIndex) {
    const supabase = await createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) return { error: 'Not authenticated' };

    // Server-side validation: Rule check (Max 2 players per game)
    // 1. Fetch current roster
    const { data: currentRoster, error: rosterError } = await supabase
        .from('fantasy_rosters')
        .select(`
            player_id, 
            player:players(
                stats:player_stats(game:games(slug))
            )
        `)
        .eq('team_id', teamId);
    
    if (rosterError) return { error: rosterError.message };

    // 2. Fetch the target player to see their game
    const { data: targetPlayer, error: playerError } = await supabase
        .from('players')
        .select('stats:player_stats(game:games(slug))')
        .eq('id', playerId)
        .single();
    
    if (playerError) return { error: playerError.message };

    const targetGameSlug = targetPlayer.stats?.[0]?.game?.slug;
    
    // 3. Count how many current players have this game
    let gameCount = 0;
    for (const roster of currentRoster) {
        if (roster.player?.stats?.[0]?.game?.slug === targetGameSlug) {
            gameCount++;
        }
    }

    if (gameCount >= 2) {
        return { error: `You can only draft a maximum of 2 players from ${targetGameSlug}.` };
    }

    // 4. Insert/Upsert the roster spot
    const { error } = await supabase
        .from('fantasy_rosters')
        .upsert({
            team_id: teamId,
            player_id: playerId,
            slot_index: slotIndex
        }, { onConflict: 'team_id, slot_index' });
    
    if (error) return { error: error.message };
    
    revalidatePath('/fantasy');
    revalidatePath('/fantasy/draft');
    return { success: true };
}

// Remove a player from a slot
export async function removePlayer(teamId, slotIndex) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('fantasy_rosters')
        .delete()
        .eq('team_id', teamId)
        .eq('slot_index', slotIndex);
    
    if (error) return { error: error.message };
    
    revalidatePath('/fantasy');
    revalidatePath('/fantasy/draft');
    return { success: true };
}

// Get the top teams on the global leaderboard
export async function getGlobalLeaderboard(leagueId, limit = 100) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('fantasy_teams')
        .select(`
            id, name, total_points, user_id,
            user:profiles!user_id(display_name, avatar_url)
        `)
        .eq('league_id', leagueId)
        .order('total_points', { ascending: false })
        .limit(limit);
    
    if (error) return { error: error.message };
    return { data };
}

// Search for available players in the DB to draft
export async function getAvailablePlayers(searchTerm = '', gameSlug = 'all') {
    const supabase = await createClient();
    
    let query = supabase
        .from('players')
        .select(`
            id, name, ign, role, image_url,
            team:teams(name, logo_url),
            stats:player_stats!inner(game:games!inner(name, slug))
        `)
        .order('ign', { ascending: true })
        .limit(50);
        
    if (searchTerm) {
        query = query.ilike('ign', `%${searchTerm}%`);
    }
    
    if (gameSlug && gameSlug !== 'all') {
        query = query.eq('stats.game.slug', gameSlug);
    }
    
    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data };
}

// ----------------------------------------------------
// DYNAMIC SCOUTING
// ----------------------------------------------------

export async function verifyAndDraftPlayer(teamId, gameSlug, gameName, tagLine, slotIndex) {
    const supabase = await createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) return { error: 'Not authenticated' };

    // 1. Verify gameSlug is supported
    if (gameSlug !== 'valorant') {
        return { error: 'Currently, only Valorant accounts can be dynamically scouted. Support for other games coming soon!' };
    }

    // 2. Fetch from Riot API
    const profile = await getValorantProfile(gameName, tagLine);
    if (!profile) {
        return { error: `Could not find a Valorant account for ${gameName}#${tagLine}. Please check the spelling.` };
    }

    // 3. Find the game ID for Valorant
    const { data: gameData } = await supabase.from('games').select('id').eq('slug', 'valorant').single();
    if (!gameData) return { error: 'Valorant game missing from database.' };

    const gameId = gameData.id;
    const playerSlug = `${gameName.toLowerCase()}-${tagLine.toLowerCase()}`;
    
    // 4. Upsert this player into the DB (so they become trackable)
    // First try to find them
    let { data: existingPlayer } = await supabase.from('players').select('id').eq('slug', playerSlug).maybeSingle();
    
    let playerId;
    
    if (existingPlayer) {
        playerId = existingPlayer.id;
    } else {
        // Insert new player
        const { data: newPlayer, error: insertError } = await supabase.from('players').insert({
            name: `${gameName}#${tagLine}`,
            ign: gameName,
            slug: playerSlug,
            role: 'Scouted Player', // They don't have a team yet
            image_url: profile.playerCard?.small || null
        }).select().single();
        
        if (insertError) return { error: `DB Insert error: ${insertError.message}` };
        playerId = newPlayer.id;
        
        // Insert initial stats for the simulation to use
        await supabase.from('player_stats').insert({
            player_id: playerId,
            game_id: gameId,
            rating: profile.performanceScore ? (profile.performanceScore / 100).toFixed(2) : 1.0,
            win_rate: profile.overall?.winRate || 50,
            headshot_pct: profile.overall?.hsPercent || 20,
            matches_played: profile.overall?.matches || 0
        });
    }

    // 5. Now that we have the player ID, draft them using the standard logic
    return await draftPlayer(teamId, playerId, slotIndex);
}

