'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getValorantProfile } from './valorant';
import { query } from '@/lib/db';

// Fetch the currently active global league
export async function getActiveLeague() {
    try {
        const res = await query(
            "SELECT * FROM fantasy_leagues WHERE status = 'active' ORDER BY created_at DESC LIMIT 1"
        );
        if (!res.rows[0]) return { error: 'No active league found' };
        return { data: res.rows[0] };
    } catch (error) {
        return { error: error.message };
    }
}

// Get the user's fantasy team for a specific league
export async function getUserFantasyTeam(userId, leagueId) {
    try {
        // Fetch team first
        const teamRes = await query(
            "SELECT id, name, total_points FROM fantasy_teams WHERE user_id = $1 AND league_id = $2 LIMIT 1",
            [userId, leagueId]
        );
        const team = teamRes.rows[0];
        if (!team) return { data: null };

        // Fetch rosters for team
        const rostersSql = `
            SELECT fr.id, fr.slot_index, fr.points_earned,
              json_build_object(
                'id', p.id,
                'name', p.name,
                'ign', p.ign,
                'role', p.role,
                'image_url', p.image_url,
                'team', CASE WHEN tm.id IS NOT NULL THEN json_build_object('name', tm.name, 'logo_url', tm.logo_url) ELSE NULL END,
                'stats', (
                  SELECT json_agg(json_build_object('game', json_build_object('name', g.name, 'slug', g.slug)))
                  FROM player_stats ps
                  LEFT JOIN games g ON ps.game_id = g.id
                  WHERE ps.player_id = p.id
                )
              ) AS player
            FROM fantasy_rosters fr
            LEFT JOIN players p ON fr.player_id = p.id
            LEFT JOIN teams tm ON p.team_id = tm.id
            WHERE fr.team_id = $1
            ORDER BY fr.slot_index ASC
        `;
        const rostersRes = await query(rostersSql, [team.id]);
        team.rosters = rostersRes.rows || [];

        return { data: team };
    } catch (error) {
        return { error: error.message };
    }
}

// Create a new fantasy team
export async function createFantasyTeam(name, leagueId) {
    const supabase = await createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) return { error: 'Not authenticated' };

    try {
        const res = await query(
            "INSERT INTO fantasy_teams (user_id, league_id, name) VALUES ($1, $2, $3) RETURNING *",
            [userData.user.id, leagueId, name]
        );
        revalidatePath('/fantasy');
        return { data: res.rows[0] };
    } catch (error) {
        return { error: error.message };
    }
}

// Draft a player to a specific slot (1-5)
export async function draftPlayer(teamId, playerId, slotIndex) {
    const supabase = await createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) return { error: 'Not authenticated' };

    try {
        // 1. Fetch current roster games
        const currentRosterSql = `
            SELECT fr.player_id, g.slug AS game_slug
            FROM fantasy_rosters fr
            JOIN players p ON fr.player_id = p.id
            LEFT JOIN player_stats ps ON ps.player_id = p.id
            LEFT JOIN games g ON ps.game_id = g.id
            WHERE fr.team_id = $1
        `;
        const currentRosterRes = await query(currentRosterSql, [teamId]);

        // 2. Fetch target player game
        const targetPlayerSql = `
            SELECT g.slug AS game_slug
            FROM players p
            LEFT JOIN player_stats ps ON ps.player_id = p.id
            LEFT JOIN games g ON ps.game_id = g.id
            WHERE p.id = $1
            LIMIT 1
        `;
        const targetPlayerRes = await query(targetPlayerSql, [playerId]);
        const targetGameSlug = targetPlayerRes.rows[0]?.game_slug;

        // 3. Rule check: max 2 players per game
        if (targetGameSlug) {
            let gameCount = 0;
            for (const row of currentRosterRes.rows) {
                if (row.game_slug === targetGameSlug) {
                    gameCount++;
                }
            }
            if (gameCount >= 2) {
                return { error: `You can only draft a maximum of 2 players from ${targetGameSlug}.` };
            }
        }

        // 4. Upsert fantasy_rosters
        const upsertSql = `
            INSERT INTO fantasy_rosters (team_id, player_id, slot_index)
            VALUES ($1, $2, $3)
            ON CONFLICT (team_id, slot_index)
            DO UPDATE SET player_id = EXCLUDED.player_id
        `;
        await query(upsertSql, [teamId, playerId, slotIndex]);

        revalidatePath('/fantasy');
        revalidatePath('/fantasy/draft');
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
}

// Remove a player from a slot
export async function removePlayer(teamId, slotIndex) {
    try {
        await query(
            "DELETE FROM fantasy_rosters WHERE team_id = $1 AND slot_index = $2",
            [teamId, slotIndex]
        );
        revalidatePath('/fantasy');
        revalidatePath('/fantasy/draft');
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
}

// Get the top teams on the global leaderboard
export async function getGlobalLeaderboard(leagueId, limit = 100) {
    try {
        const sql = `
            SELECT ft.id, ft.name, ft.total_points, ft.user_id,
              CASE WHEN pr.id IS NOT NULL THEN json_build_object('display_name', pr.display_name, 'avatar_url', pr.avatar_url) ELSE NULL END AS user
            FROM fantasy_teams ft
            LEFT JOIN profiles pr ON ft.user_id = pr.id
            WHERE ft.league_id = $1
            ORDER BY ft.total_points DESC NULLS LAST
            LIMIT $2
        `;
        const res = await query(sql, [leagueId, limit]);
        return { data: res.rows || [] };
    } catch (error) {
        return { error: error.message };
    }
}

// Search for available players in the DB to draft
export async function getAvailablePlayers(searchTerm = '', gameSlug = 'all') {
    try {
        const whereConditions = [];
        const params = [];
        let paramIndex = 1;

        if (searchTerm) {
            whereConditions.push(`p.ign ILIKE $${paramIndex++}`);
            params.push(`%${searchTerm}%`);
        }

        if (gameSlug && gameSlug !== 'all') {
            whereConditions.push(`g.slug = $${paramIndex++}`);
            params.push(gameSlug);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        const sql = `
            SELECT p.id, p.name, p.ign, p.role, p.image_url,
              CASE WHEN tm.id IS NOT NULL THEN json_build_object('name', tm.name, 'logo_url', tm.logo_url) ELSE NULL END AS team,
              (
                SELECT json_agg(json_build_object('game', json_build_object('name', g2.name, 'slug', g2.slug)))
                FROM player_stats ps2
                JOIN games g2 ON ps2.game_id = g2.id
                WHERE ps2.player_id = p.id
              ) AS stats
            FROM players p
            LEFT JOIN teams tm ON p.team_id = tm.id
            LEFT JOIN player_stats ps ON ps.player_id = p.id
            LEFT JOIN games g ON ps.game_id = g.id
            ${whereClause}
            ORDER BY p.ign ASC
            LIMIT 50
        `;
        const res = await query(sql, params);
        return { data: res.rows || [] };
    } catch (error) {
        return { error: error.message };
    }
}

// ----------------------------------------------------
// DYNAMIC SCOUTING
// ----------------------------------------------------

export async function verifyAndDraftPlayer(teamId, gameSlug, gameName, tagLine, slotIndex) {
    const supabase = await createClient();
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) return { error: 'Not authenticated' };

    if (gameSlug !== 'valorant') {
        return { error: 'Currently, only Valorant accounts can be dynamically scouted. Support for other games coming soon!' };
    }

    const profile = await getValorantProfile(gameName, tagLine);
    if (!profile) {
        return { error: `Could not find a Valorant account for ${gameName}#${tagLine}. Please check the spelling.` };
    }

    try {
        const gameRes = await query("SELECT id FROM games WHERE slug = 'valorant' LIMIT 1");
        if (!gameRes.rows[0]) return { error: 'Valorant game missing from database.' };

        const gameId = gameRes.rows[0].id;
        const playerSlug = `${gameName.toLowerCase()}-${tagLine.toLowerCase()}`;

        let existingRes = await query("SELECT id FROM players WHERE slug = $1 LIMIT 1", [playerSlug]);
        let playerId;

        if (existingRes.rows[0]) {
            playerId = existingRes.rows[0].id;
        } else {
            const insertPlayerRes = await query(
                `INSERT INTO players (name, ign, slug, role, image_url)
                 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                [`${gameName}#${tagLine}`, gameName, playerSlug, 'Scouted Player', profile.playerCard?.small || null]
            );
            playerId = insertPlayerRes.rows[0].id;

            await query(
                `INSERT INTO player_stats (player_id, game_id, rating, win_rate, headshot_pct, matches_played)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    playerId,
                    gameId,
                    profile.performanceScore ? parseFloat((profile.performanceScore / 100).toFixed(2)) : 1.0,
                    profile.overall?.winRate || 50,
                    profile.overall?.hsPercent || 20,
                    profile.overall?.matches || 0
                ]
            );
        }

        return await draftPlayer(teamId, playerId, slotIndex);
    } catch (error) {
        return { error: error.message };
    }
}
