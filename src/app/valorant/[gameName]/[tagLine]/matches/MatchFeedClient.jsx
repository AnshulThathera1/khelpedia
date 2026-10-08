'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { loadMoreValorantMatchesAction } from '@/app/actions/valorant';
import AdContainer from '@/app/components/ads/AdContainer';

const QUEUE_MODES = [
  { id: 'all', label: 'All Modes' },
  { id: 'competitive', label: 'Competitive' },
  { id: 'skirmish2v2', label: '2v2 Skirmish' },
  { id: 'unrated', label: 'Unrated' },
  { id: 'deathmatch', label: 'Deathmatch' },
  { id: 'swiftplay', label: 'Swiftplay' },
  { id: 'spikerush', label: 'Spike Rush' }
];

export default function MatchFeedClient({
  initialMatches = [],
  recentMatches = [],
  puuid,
  totalAvailableMatches = 0,
  initialCursor = null,
  hasMoreInitial = false,
  agentDict = {},
  mapDict = {},
  tiersRes = []
}) {
  const baseMatches = initialMatches.length > 0 ? initialMatches : recentMatches;

  const [matches, setMatches] = useState(baseMatches);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(hasMoreInitial);
  const [totalAvailable, setTotalAvailable] = useState(totalAvailableMatches || baseMatches.length);
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedMap, setSelectedMap] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reqIdRef = useRef(0);

  // Available map options from map dictionary
  const mapOptions = Object.values(mapDict || {})
    .filter(m => m?.displayName && m?.mapUrl)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  // Handler for changing filters (Queue mode or Map)
  const handleFilterChange = async (newMode, newMap) => {
    const currentReqId = ++reqIdRef.current;
    setIsLoading(true);
    setError(null);
    setSelectedMode(newMode);
    setSelectedMap(newMap);

    try {
      const res = await loadMoreValorantMatchesAction({
        puuid,
        cursor: null,
        queueId: newMode !== 'all' ? newMode : null,
        mapId: newMap !== 'all' ? newMap : null,
        limit: 20
      });

      // Avoid race conditions if a newer filter change was made
      if (currentReqId !== reqIdRef.current) return;

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setMatches(res.data.matches || []);
        setCursor(res.data.nextCursor || null);
        setHasMore(Boolean(res.data.hasMore));
        setTotalAvailable(res.data.totalAvailable || 0);
      }
    } catch (err) {
      if (currentReqId !== reqIdRef.current) return;
      console.error('Filter request error:', err);
      setError('Unable to load matches for the selected filter. Please try again.');
    } finally {
      if (currentReqId === reqIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Handler for pagination: load next 20 matches preserving current filters
  const handleLoadMore = async () => {
    if (isLoading || !hasMore || !cursor) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await loadMoreValorantMatchesAction({
        puuid,
        cursor,
        queueId: selectedMode !== 'all' ? selectedMode : null,
        mapId: selectedMap !== 'all' ? selectedMap : null,
        limit: 20
      });

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        const newMatches = res.data.matches || [];
        setMatches(prev => {
          const existingIds = new Set(prev.map(m => m.matchId));
          const uniqueNew = newMatches.filter(m => !existingIds.has(m.matchId));
          return [...prev, ...uniqueNew];
        });
        setCursor(res.data.nextCursor || null);
        setHasMore(Boolean(res.data.hasMore));
        if (typeof res.data.totalAvailable === 'number') {
          setTotalAvailable(res.data.totalAvailable);
        }
      }
    } catch (err) {
      console.error('Load more error:', err);
      setError('Unable to load more matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeModeLabel = QUEUE_MODES.find(m => m.id === selectedMode)?.label || selectedMode;
  const activeMapLabel = mapOptions.find(m => m.mapUrl === selectedMap)?.displayName || 'All Maps';

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Dynamic Count */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-xl text-[var(--text-primary)]">Detailed Match History</h2>
        <span className="text-xs text-[var(--text-muted)] font-semibold">
          {selectedMode === 'all' && selectedMap === 'all'
            ? `${totalAvailable} total ${totalAvailable === 1 ? 'match' : 'matches'} recorded`
            : `${totalAvailable} ${totalAvailable === 1 ? 'match' : 'matches'} found`}
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded">
        {/* Mode filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {QUEUE_MODES.map(mode => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleFilterChange(mode.id, selectedMap)}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                selectedMode === mode.id
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Map filter select */}
        <div className="flex items-center gap-2">
          <label htmlFor="map-select-filter" className="text-xs text-[var(--text-muted)] font-semibold hidden sm:inline">
            Map:
          </label>
          <select
            id="map-select-filter"
            value={selectedMap}
            onChange={e => handleFilterChange(selectedMode, e.target.value)}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] rounded px-3 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Maps</option>
            {mapOptions.map(m => (
              <option key={m.mapUrl} value={m.mapUrl}>
                {m.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Match cards feed */}
      {matches.map((match, index) => (
        <div key={match.matchId} className="flex flex-col gap-4">
          <ExpandableMatchCard
            match={match}
            agentDict={agentDict}
            mapDict={mapDict}
            tiersRes={tiersRes}
          />
          {/* Mobile / Tablet Ad: Rendered after Match 5 only when enough matches exist */}
          {index === 4 && matches.length > 5 && (
            <div className="block 2xl:hidden my-2 flex justify-center">
              <AdContainer
                type="banner_320x50"
                placement="valorant_matches_feed"
              />
            </div>
          )}
        </div>
      ))}

      {/* Loading state indicator during filter change */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 bg-[var(--bg-card)] rounded border border-[var(--border-color)]">
          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Updating matches...</span>
        </div>
      )}

      {/* Empty State */}
      {matches.length === 0 && !isLoading && (
        <div className="text-center p-12 bg-[var(--bg-card)] rounded border border-[var(--border-color)]">
          <p className="text-[var(--text-secondary)] font-medium mb-3">
            No matches found {selectedMode !== 'all' ? `for ${activeModeLabel}` : ''} {selectedMap !== 'all' ? `on ${activeMapLabel}` : ''}.
          </p>
          <button
            type="button"
            onClick={() => handleFilterChange('all', 'all')}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={cursor ? handleLoadMore : () => handleFilterChange(selectedMode, selectedMap)}
            className="underline font-bold hover:text-red-300 ml-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Load More Button and Pagination Progress */}
      {hasMore ? (
        <div className="flex flex-col items-center justify-center pt-2 pb-6">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest rounded shadow-sm hover:border-[var(--text-muted)] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-w-[220px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                <span>Loading matches...</span>
              </>
            ) : (
              <span>Load More Matches</span>
            )}
          </button>
          <p className="text-[11px] text-[var(--text-muted)] mt-2 font-medium">
            Showing {matches.length} of {totalAvailable} available {totalAvailable === 1 ? 'match' : 'matches'}
          </p>
        </div>
      ) : (
        matches.length > 0 && (
          <div className="text-center py-6 border-t border-[var(--border-color)]/30 mt-2">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              All {matches.length} available {matches.length === 1 ? 'match' : 'matches'} loaded.
            </p>
          </div>
        )
      )}
    </div>
  );
}

function ExpandableMatchCard({ match, agentDict, mapDict, tiersRes }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { hasWon, stats, characterId, mapId, scoreString, matchHsPercent, matchAdr, rawMatch, queueId } = match;

  const outcomeColor = hasWon ? 'bg-green-500/10' : 'bg-red-500/10';
  const outcomeBar = hasWon ? 'bg-green-500' : 'bg-red-500';
  const outcomeText = hasWon ? 'text-green-500' : 'text-red-500';
  const outcomeLabel = hasWon ? `${scoreString} VICTORY` : `${scoreString} DEFEAT`;

  const agent = agentDict[characterId?.toLowerCase()];
  const mapName = mapDict[mapId]?.displayName || mapId || 'Unknown Map';
  const kd = stats?.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : (stats?.kills || 0).toFixed(2);
  const modeLabel = queueId ? queueId.charAt(0).toUpperCase() + queueId.slice(1) : 'Competitive';

  // Sorting players for the expanded scoreboard
  const redTeam = rawMatch?.players?.filter(p => p.teamId === 'Red').sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0)) || [];
  const blueTeam = rawMatch?.players?.filter(p => p.teamId === 'Blue').sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0)) || [];

  return (
    <div className="flex flex-col rounded border border-[var(--border-color)] overflow-hidden shadow-sm transition-all">
      {/* Clickable Header (Standard MatchCard) */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative flex items-center w-full text-left ${outcomeColor} hover:brightness-110 transition-all`}
        aria-expanded={isExpanded}
        aria-label={`Toggle scoreboard for ${mapName} ${outcomeLabel}`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${outcomeBar}`} />

        <div className="flex items-center w-52 py-2.5 px-4 pl-5">
          <div className="w-12 h-12 bg-[var(--bg-card)] rounded-sm flex-shrink-0 overflow-hidden border border-[var(--border-color)]">
            {agent ? (
              <img src={agent.displayIcon} alt={agent.displayName} className="w-full h-full object-cover scale-110" />
            ) : (
              <div className="w-full h-full bg-[var(--bg-card)] flex items-center justify-center text-[10px] text-[var(--text-muted)]">?</div>
            )}
          </div>
          <div className="ml-3 flex flex-col justify-center">
            <p className={`font-black text-[13px] tracking-wide ${outcomeText}`}>{outcomeLabel}</p>
            <p className="text-[12px] text-[var(--text-secondary)] font-semibold">{mapName}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">{modeLabel}</p>
          </div>
        </div>

        <div className="flex-1 hidden md:grid grid-cols-5 gap-2 py-2.5 px-4 items-center border-l border-[var(--border-color)]">
          <div className="flex flex-col items-center justify-center col-span-2">
            <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mb-0.5">K / D / A</p>
            <p className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
              {stats?.kills ?? 0} <span className="text-[var(--text-muted)]">/</span> {stats?.deaths ?? 0} <span className="text-[var(--text-muted)]">/</span> {stats?.assists ?? 0}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mb-0.5">K/D</p>
            <p className={`text-sm font-black ${kd >= 1 ? 'text-green-400' : 'text-[var(--text-secondary)]'}`}>{kd}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mb-0.5">HS%</p>
            <p className={`text-sm font-bold ${matchHsPercent >= 20 ? 'text-green-400' : 'text-[var(--text-secondary)]'}`}>{matchHsPercent}%</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mb-0.5">ADR</p>
            <p className="text-sm font-bold text-[var(--text-primary)]">{matchAdr}</p>
          </div>
        </div>

        {/* Mobile Stats summary */}
        <div className="md:hidden flex-1 flex flex-col justify-center px-4 border-l border-[var(--border-color)]">
          <p className="text-xs font-bold text-[var(--text-primary)]">
            {stats?.kills ?? 0} / {stats?.deaths ?? 0} / {stats?.assists ?? 0}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)]">K/D: {kd}</p>
        </div>

        <div className="px-4 py-2 flex items-center justify-center border-l border-[var(--border-color)] text-[var(--text-muted)]">
          <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180 text-[var(--text-primary)]' : ''}`} />
        </div>
      </button>

      {/* Expanded Scoreboard */}
      {isExpanded && (
        <div className="bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
          <ScoreboardTeam teamName="Blue Team" players={blueTeam} agentDict={agentDict} tiersRes={tiersRes} />
          <ScoreboardTeam teamName="Red Team" players={redTeam} agentDict={agentDict} tiersRes={tiersRes} />
        </div>
      )}
    </div>
  );
}

function ScoreboardTeam({ teamName, players, agentDict, tiersRes }) {
  if (!players || players.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="px-4 py-2 bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
        <h3 className="font-bold text-xs uppercase tracking-widest text-[var(--text-secondary)]">{teamName}</h3>
      </div>
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-color)]">
            <div className="col-span-4">Player</div>
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-2 text-center">ACS</div>
            <div className="col-span-2 text-center">K / D / A</div>
            <div className="col-span-2 text-center">K/D</div>
          </div>
          {players.map(p => {
            const a = agentDict[p.characterId?.toLowerCase()];
            const r = tiersRes?.find ? tiersRes.find(t => t.tier === p.competitiveTier) : null;
            const pkd = p.stats?.deaths > 0 ? (p.stats.kills / p.stats.deaths).toFixed(2) : (p.stats?.kills || 0).toFixed(2);
            const rounds = p.stats?.roundsPlayed || 1;
            const acs = Math.round((p.stats?.score || 0) / rounds);

            const hasValidIdentity = Boolean(p.gameName);
            const displayName = p.gameName || 'Player unavailable';
            const displayTag = p.tagLine ? `#${p.tagLine}` : null;
            const profileUrl = p.profileUrl || null;

            return (
              <div
                key={p.puuid || `${p.gameName}-${p.tagLine}`}
                className="grid grid-cols-12 px-4 py-2.5 items-center border-b border-[var(--border-color)]/20 hover:bg-[var(--bg-card-hover)]"
              >
                {/* Player identity column */}
                <div className="col-span-4 flex items-center gap-3">
                  {a?.displayIcon ? (
                    <img
                      src={a.displayIcon}
                      alt={a.displayName || 'Agent'}
                      className="w-8 h-8 rounded border border-[var(--border-color)] bg-[var(--bg-card)] object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center text-[10px] text-[var(--text-muted)] font-bold flex-shrink-0">
                      ?
                    </div>
                  )}

                  <div className="min-w-0">
                    {profileUrl ? (
                      <Link
                        href={profileUrl}
                        className="group/player inline-flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-0.5"
                        aria-label={`View profile for ${displayName}${displayTag ? ` ${displayTag}` : ''}`}
                      >
                        <span className="text-sm font-bold text-[var(--text-primary)] group-hover/player:text-red-400 group-hover/player:underline transition-colors truncate max-w-[140px] block">
                          {displayName}
                        </span>
                        {displayTag && (
                          <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase truncate block">
                            {displayTag}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <div className="inline-flex flex-col text-left">
                        <span className={`text-sm font-medium ${hasValidIdentity ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] italic'} truncate max-w-[140px] block`}>
                          {displayName}
                        </span>
                        {displayTag && (
                          <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase truncate block">
                            {displayTag}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Rank column */}
                <div className="col-span-2 flex justify-center">
                  {r?.smallIcon ? (
                    <img src={r.smallIcon} className="w-6 h-6" title={r.tierName} alt={r.tierName || 'Rank'} />
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)] font-semibold">-</span>
                  )}
                </div>

                {/* ACS column */}
                <div className="col-span-2 text-center font-bold text-[var(--text-primary)]">{acs}</div>

                {/* K/D/A column */}
                <div className="col-span-2 text-center font-semibold text-[var(--text-secondary)] whitespace-nowrap">
                  {p.stats?.kills ?? 0} / {p.stats?.deaths ?? 0} / {p.stats?.assists ?? 0}
                </div>

                {/* K/D column */}
                <div className="col-span-2 text-center font-bold text-[var(--text-secondary)]">{pkd}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
