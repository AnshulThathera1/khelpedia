'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function MatchFeedClient({ recentMatches, agentDict, mapDict, tiersRes }) {
  return (
    <div className="flex flex-col gap-4">
      {recentMatches.map((match, idx) => (
        <ExpandableMatchCard 
          key={match.matchId} 
          match={match} 
          agentDict={agentDict} 
          mapDict={mapDict} 
          tiersRes={tiersRes} 
        />
      ))}
    </div>
  );
}

function ExpandableMatchCard({ match, agentDict, mapDict, tiersRes }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { hasWon, stats, combatScore, characterId, mapId, scoreString, matchHsPercent, matchAdr, rawMatch } = match;
  
  const outcomeColor = hasWon ? 'bg-[#18231e]' : 'bg-[#2a171a]';
  const outcomeBar = hasWon ? 'bg-green-500' : 'bg-red-500';
  const outcomeText = hasWon ? 'text-green-500' : 'text-red-500';
  const outcomeLabel = hasWon ? `${scoreString} VICTORY` : `${scoreString} DEFEAT`;

  const agent = agentDict[characterId?.toLowerCase()];
  const mapName = mapDict[mapId]?.displayName || mapId;
  const kd = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);

  // Sorting players for the expanded scoreboard
  const redTeam = rawMatch?.players?.filter(p => p.teamId === 'Red').sort((a, b) => b.stats.score - a.stats.score) || [];
  const blueTeam = rawMatch?.players?.filter(p => p.teamId === 'Blue').sort((a, b) => b.stats.score - a.stats.score) || [];

  return (
    <div className="flex flex-col rounded border border-zinc-800 overflow-hidden shadow-sm transition-all">
      
      {/* Clickable Header (Standard MatchCard) */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative flex items-center w-full text-left ${outcomeColor} hover:brightness-110 transition-all`}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${outcomeBar}`} />
        
        <div className="flex items-center w-52 py-2.5 px-4 pl-5">
          <div className="w-12 h-12 bg-zinc-800 rounded-sm flex-shrink-0 overflow-hidden border border-zinc-700">
             {agent ? (
                <img src={agent.displayIcon} alt={agent.displayName} className="w-full h-full object-cover scale-110" />
             ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">?</div>
             )}
          </div>
          <div className="ml-3 flex flex-col justify-center">
            <p className={`font-black text-[13px] tracking-wide ${outcomeText}`}>{outcomeLabel}</p>
            <p className="text-[12px] text-zinc-300 font-semibold">{mapName}</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Competitive</p>
          </div>
        </div>

        <div className="flex-1 hidden md:grid grid-cols-5 gap-2 py-2.5 px-4 items-center border-l border-zinc-800/50">
          <div className="flex flex-col items-center justify-center col-span-2">
             <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">K / D / A</p>
             <p className="text-sm font-bold text-white tracking-wide">
               {stats.kills} <span className="text-zinc-600">/</span> {stats.deaths} <span className="text-zinc-600">/</span> {stats.assists}
             </p>
          </div>
          <div className="flex flex-col items-center justify-center">
             <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">K/D</p>
             <p className={`text-sm font-black ${kd >= 1 ? 'text-green-400' : 'text-zinc-300'}`}>{kd}</p>
          </div>
          <div className="flex flex-col items-center justify-center">
             <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">HS%</p>
             <p className={`text-sm font-bold ${matchHsPercent >= 20 ? 'text-green-400' : 'text-zinc-300'}`}>{matchHsPercent}%</p>
          </div>
          <div className="flex flex-col items-center justify-center">
             <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">ADR</p>
             <p className="text-sm font-bold text-white">{matchAdr}</p>
          </div>
        </div>
        
        {/* Mobile Stats summary */}
        <div className="md:hidden flex-1 flex flex-col justify-center px-4 border-l border-zinc-800/50">
           <p className="text-xs font-bold text-white">{stats.kills} / {stats.deaths} / {stats.assists}</p>
           <p className="text-[10px] text-zinc-400">K/D: {kd}</p>
        </div>
        
        <div className="px-4 py-2 flex items-center justify-center border-l border-zinc-800/50 text-zinc-600">
           <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180 text-white' : ''}`} />
        </div>
      </button>

      {/* Expanded Scoreboard */}
      {isExpanded && (
        <div className="bg-[#101014] border-t border-zinc-800">
           <ScoreboardTeam teamName="Blue Team" players={blueTeam} agentDict={agentDict} tiersRes={tiersRes} rawMatch={rawMatch} />
           <ScoreboardTeam teamName="Red Team" players={redTeam} agentDict={agentDict} tiersRes={tiersRes} rawMatch={rawMatch} />
        </div>
      )}

    </div>
  );
}

function ScoreboardTeam({ teamName, players, agentDict, tiersRes, rawMatch }) {
  if (!players || players.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="px-4 py-2 bg-zinc-900 border-y border-zinc-800">
        <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400">{teamName}</h3>
      </div>
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
             <div className="col-span-4">Player</div>
             <div className="col-span-2 text-center">Rank</div>
             <div className="col-span-2 text-center">ACS</div>
             <div className="col-span-2 text-center">K / D / A</div>
             <div className="col-span-2 text-center">K/D</div>
          </div>
          {players.map(p => {
            const a = agentDict[p.characterId?.toLowerCase()];
            const r = tiersRes.find(t => t.tier === p.competitiveTier);
            const pkd = p.stats.deaths > 0 ? (p.stats.kills / p.stats.deaths).toFixed(2) : p.stats.kills.toFixed(2);
            const rounds = p.stats.roundsPlayed || 1;
            const acs = Math.round(p.stats.score / rounds);

            return (
              <div key={p.puuid} className="grid grid-cols-12 px-4 py-2.5 items-center border-b border-zinc-800/20 hover:bg-zinc-800/30">
                 <div className="col-span-4 flex items-center gap-3">
                   <img src={a?.displayIcon} className="w-8 h-8 rounded border border-zinc-700 bg-zinc-800" />
                   <div>
                      <p className="text-sm font-bold text-white truncate max-w-[120px]">{p.gameName || 'Unknown'}</p>
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase truncate">#{p.tagLine || '0000'}</p>
                   </div>
                 </div>
                 <div className="col-span-2 flex justify-center">
                    {r && <img src={r.smallIcon} className="w-6 h-6" title={r.tierName} />}
                 </div>
                 <div className="col-span-2 text-center font-bold text-white">{acs}</div>
                 <div className="col-span-2 text-center font-semibold text-zinc-300 whitespace-nowrap">
                   {p.stats.kills} / {p.stats.deaths} / {p.stats.assists}
                 </div>
                 <div className="col-span-2 text-center font-bold text-zinc-400">{pkd}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
