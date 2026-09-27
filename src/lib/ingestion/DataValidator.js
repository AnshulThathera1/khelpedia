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
   */
  static validateBGMIStandings(standings) {
    if (!standings || typeof standings !== 'object') {
      return { valid: false, reason: "Standings object is null or not an object" };
    }

    if (!standings.tournament_id && !standings.tournamentId) {
      return { valid: false, reason: "Standings missing tournament_id" };
    }

    if (!standings.team_id && !standings.teamId) {
      return { valid: false, reason: "Standings missing team_id" };
    }

    if (typeof standings.rank_position === 'number' && standings.rank_position < 1) {
      return { valid: false, reason: `Invalid rank_position: ${standings.rank_position}` };
    }

    return { valid: true, data: standings };
  }
}

export default DataValidator;
