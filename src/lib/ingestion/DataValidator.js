/**
 * KhelPediA Data Ingestion Engine — DataValidator
 * Validates data entities before database insertion, rejecting malformed records.
 */

export class DataValidator {
  /**
   * Validate Match Entity
   */
  static validateMatch(match) {
    if (!match || typeof match !== 'object') {
      return { valid: false, reason: "Match object is null or not an object" };
    }

    if (!match.source_match_id && !match.raw_identifier) {
      return { valid: false, reason: "Match missing source_match_id or raw_identifier" };
    }

    if (!match.team1_name && !match.team1_id) {
      return { valid: false, reason: "Match missing Team 1 identification" };
    }

    if (!match.team2_name && !match.team2_id) {
      return { valid: false, reason: "Match missing Team 2 identification" };
    }

    if (!match.tournament_name && !match.tournament_id) {
      return { valid: false, reason: "Match missing Tournament identification" };
    }

    // Validate scores are non-negative numbers
    if (typeof match.score1 === 'number' && match.score1 < 0) {
      return { valid: false, reason: `Invalid score1: ${match.score1}` };
    }
    if (typeof match.score2 === 'number' && match.score2 < 0) {
      return { valid: false, reason: `Invalid score2: ${match.score2}` };
    }

    // Validate timestamp format if provided
    if (match.played_at || match.scheduled_at) {
      const dateVal = new Date(match.played_at || match.scheduled_at);
      if (isNaN(dateVal.getTime())) {
        return { valid: false, reason: `Invalid match timestamp: ${match.played_at || match.scheduled_at}` };
      }
    }

    return { valid: true };
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

    if (!tourney.source_tournament_id && !tourney.slug) {
      return { valid: false, reason: "Tournament missing source_tournament_id and slug" };
    }

    if (tourney.start_date) {
      const startDt = new Date(tourney.start_date);
      if (isNaN(startDt.getTime())) {
        return { valid: false, reason: `Invalid start_date: ${tourney.start_date}` };
      }
    }

    return { valid: true };
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

    return { valid: true };
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

    return { valid: true };
  }
}
