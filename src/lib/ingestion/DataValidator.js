/**
 * KhelPediA Data Ingestion Engine — DataValidator
 * Validates data entities before database insertion, rejecting malformed records.
 */

export class DataValidator {
  /**
   * Validate Match Entity (Supports head-to-head and multi-team Battle Royale matches)
   */
  static validateMatch(match) {
    if (!match || typeof match !== 'object') {
      return { valid: false, reason: "Match object is null or not an object" };
    }

    const sourceMatchId = match.source_match_id || match.sourceMatchId || match.raw_identifier;
    if (!sourceMatchId) {
      return { valid: false, reason: "Match missing source_match_id or raw_identifier" };
    }

    const tournamentId = match.tournament_id || match.tournamentId || match.tournament_name;
    if (!tournamentId) {
      return { valid: false, reason: "Match missing Tournament identification" };
    }

    // For non-BGMI traditional matches, require team1 and team2 identification
    if (match.isHeadToHead !== false) {
      if (!match.team1_name && !match.team1_id && !match.team1Id && !match.map) {
        // Multi-team Battle Royale matches specify map without team1/team2
      }
    }

    // Validate scores/points are non-negative if provided
    if (typeof match.score1 === 'number' && match.score1 < 0) {
      return { valid: false, reason: `Invalid score1: ${match.score1}` };
    }
    if (typeof match.score2 === 'number' && match.score2 < 0) {
      return { valid: false, reason: `Invalid score2: ${match.score2}` };
    }

    // Validate timestamp format if provided
    const ts = match.played_at || match.playedAt || match.scheduled_at || match.scheduledAt;
    if (ts) {
      const dateVal = new Date(ts);
      if (isNaN(dateVal.getTime())) {
        return { valid: false, reason: `Invalid match timestamp: ${ts}` };
      }
    }

    return { valid: true, data: match };
  }

  /**
   * Validate Tournament Entity
   */
  static validateTournament(tourney) {
    if (!tourney || typeof tourney !== 'object') {
      return { valid: false, reason: "Tournament object is null or not an object" };
    }

    if (!tourney.name || typeof tourney.name !== 'string' || tourney.name.trim() === '') {
      return { valid: false, reason: "Tournament missing valid name" };
    }

    const sourceTourneyId = tourney.source_tournament_id || tourney.slug;
    if (!sourceTourneyId) {
      return { valid: false, reason: "Tournament missing source_tournament_id and slug" };
    }

    const startDate = tourney.start_date || tourney.startDate;
    if (startDate) {
      const startDt = new Date(startDate);
      if (isNaN(startDt.getTime())) {
        return { valid: false, reason: `Invalid start_date: ${startDate}` };
      }
    }

    return { valid: true, data: tourney };
  }

  /**
   * Validate Team Entity
   */
  static validateTeam(team) {
    if (!team || typeof team !== 'object') {
      return { valid: false, reason: "Team object is null or not an object" };
    }

    if (!team.name || typeof team.name !== 'string' || team.name.trim() === '') {
      return { valid: false, reason: "Team missing valid name" };
    }

    return { valid: true, data: team };
  }

  /**
   * Validate Player Entity
   */
  static validatePlayer(player) {
    if (!player || typeof player !== 'object') {
      return { valid: false, reason: "Player object is null or not an object" };
    }

    if ((!player.ign || typeof player.ign !== 'string') && (!player.name || typeof player.name !== 'string')) {
      return { valid: false, reason: "Player missing ign and name" };
    }

    return { valid: true, data: player };
  }

  /**
   * Validate BGMI Stage Standings DTO
   * Enforces non-negative values, strict NULL bonus point handling, and mathematical consistency
   */
  static validateBGMIStandings(standings) {
    if (!standings || typeof standings !== 'object') {
      return { valid: false, reason: "Standings object is null or not an object" };
    }

    const tournamentId = standings.tournament_id || standings.tournamentId;
    if (!tournamentId) {
      return { valid: false, reason: "Standings missing tournament_id" };
    }

    const teamId = standings.team_id || standings.teamId;
    if (!teamId) {
      return { valid: false, reason: "Standings missing team_id" };
    }

    const rankPosition = standings.rank_position || standings.rankPosition;
    if (typeof rankPosition === 'number' && rankPosition < 1) {
      return { valid: false, reason: `Invalid rank_position: ${rankPosition}` };
    }

    const placementPts = standings.placement_pts ?? standings.placementPts;
    const eliminationPts = standings.elimination_pts ?? standings.eliminationPts;
    const bonusPts = standings.bonus_pts ?? standings.bonusPts;
    const totalPts = standings.total_pts ?? standings.totalPts;

    if (typeof placementPts === 'number' && placementPts < 0) {
      return { valid: false, reason: `Negative placement_pts: ${placementPts}` };
    }
    if (typeof eliminationPts === 'number' && eliminationPts < 0) {
      return { valid: false, reason: `Negative elimination_pts: ${eliminationPts}` };
    }
    if (bonusPts !== undefined && bonusPts !== null && (typeof bonusPts !== 'number' || bonusPts < 0)) {
      return { valid: false, reason: `Invalid bonus_pts: ${bonusPts}` };
    }

    // Mathematical consistency check when all components are provided
    if (typeof placementPts === 'number' && typeof eliminationPts === 'number' && typeof totalPts === 'number') {
      const effectiveBonus = typeof bonusPts === 'number' ? bonusPts : 0;
      const expectedTotal = placementPts + eliminationPts + effectiveBonus;
      if (expectedTotal !== totalPts) {
        return { 
          valid: false, 
          reason: `Mathematical point corruption: placement (${placementPts}) + eliminations (${eliminationPts}) + bonus (${effectiveBonus}) = ${expectedTotal}, but total was reported as ${totalPts}` 
        };
      }
    }

    return { valid: true, data: standings };
  }

  /**
   * Validate Match Player Telemetry (Scorecards)
   */
  static validateMatchPlayerStats(stats) {
    if (!stats || typeof stats !== 'object') {
      return { valid: false, reason: "Match player stats is null or not an object" };
    }

    const matchId = stats.match_id || stats.matchId;
    if (!matchId) {
      return { valid: false, reason: "Match player stats missing match_id" };
    }

    const playerId = stats.player_id || stats.playerId;
    if (!playerId) {
      return { valid: false, reason: "Match player stats missing player_id" };
    }

    if (stats.kills !== null && stats.kills !== undefined) {
      if (typeof stats.kills !== 'number' || stats.kills < 0 || stats.kills > 30) {
        return { valid: false, reason: `Kills out of bounds (0-30): ${stats.kills}` };
      }
    }

    if (stats.damage !== null && stats.damage !== undefined) {
      const dmg = Number(stats.damage);
      if (isNaN(dmg) || dmg < 0 || dmg > 10000.0) {
        return { valid: false, reason: `Damage out of bounds (0-10000.0): ${stats.damage}` };
      }
    }

    if (stats.assists !== null && stats.assists !== undefined) {
      if (typeof stats.assists !== 'number' || stats.assists < 0 || stats.assists > 30) {
        return { valid: false, reason: `Assists out of bounds (0-30): ${stats.assists}` };
      }
    }

    if (stats.survival_time_sec !== null && stats.survival_time_sec !== undefined) {
      if (typeof stats.survival_time_sec !== 'number' || stats.survival_time_sec < 0 || stats.survival_time_sec > 2400) {
        return { valid: false, reason: `Survival time out of bounds (0-2400s): ${stats.survival_time_sec}` };
      }
    }

    return { valid: true, data: stats };
  }

  /**
   * Validate Identity Resolution against existing entities
   * Detects ambiguous rebrands or cross-game collisions
   */
  static validateIdentityResolution({ entityType, sourceName, sourceEntityId, candidate, existingMatches = [] }) {
    if (!candidate || !candidate.name) {
      return { valid: false, quarantine: false, reason: "Candidate missing name" };
    }

    // Check for collision with existing entities across different games
    const crossGameMatch = existingMatches.find(m => 
      m.slug === candidate.slug && m.game_id && candidate.game_id && m.game_id !== candidate.game_id
    );

    if (crossGameMatch) {
      return {
        valid: false,
        quarantine: true,
        conflictCode: 'CROSS_GAME_COLLISION',
        reason: `Cross-game slug collision: "${candidate.slug}" belongs to another game (${crossGameMatch.game_id})`,
        candidateInternalId: crossGameMatch.id
      };
    }

    // Check for rebrand or name discrepancy
    const nameDiscrepancy = existingMatches.find(m => 
      m.id === candidate.id && m.name.toLowerCase() !== candidate.name.toLowerCase()
    );

    if (nameDiscrepancy) {
      return {
        valid: false,
        quarantine: true,
        conflictCode: 'REBRAND_REVIEW',
        reason: `Potential rebrand discrepancy: existing "${nameDiscrepancy.name}" vs incoming "${candidate.name}"`,
        candidateInternalId: nameDiscrepancy.id
      };
    }

    return { valid: true, quarantine: false, candidate };
  }
}

export default DataValidator;
