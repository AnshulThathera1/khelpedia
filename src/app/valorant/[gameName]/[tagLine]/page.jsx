import { getValorantProfile } from '@/app/actions/valorant';

export default async function ValorantOverviewTab({ params }) {
  const { gameName, tagLine } = await params;
  const decodedName = decodeURIComponent(gameName);
  const decodedTag = decodeURIComponent(tagLine);

  const profileData = await getValorantProfile(decodedName, decodedTag);
  if (profileData.error) return null; // Error handled by layout.jsx

  const { playerStats, agentDict, mapDict } = profileData;
  const { summary, recentMatches } = playerStats;
  const topAgentId = summary.topAgents?.[0]?.characterId;
  const topAgent = topAgentId ? (agentDict[topAgentId.toLowerCase()]?.displayName || topAgentId) : null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: Performance Overview */}
      <div className="lg:col-span-4 space-y-4">
        
        <div className="bg-zinc-900 border border-zinc-800 rounded shadow-sm">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="font-bold text-lg text-white">Performance Overview</h2>
            <p className="text-xs text-zinc-400 font-medium">Last {summary.totalMatches} Matches • Competitive</p>
          </div>
          
          <div className="grid grid-cols-2 gap-px bg-zinc-800">
            <div className="bg-zinc-900 p-5 space-y-1">
              <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Win Rate</p>
              <p className={`text-3xl font-black ${summary.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {summary.winRate}%
              </p>
              <p className="text-xs text-zinc-500 font-medium">{summary.wins}W - {summary.losses}L</p>
            </div>
            
            <div className="bg-zinc-900 p-5 space-y-1">
              <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">K/D Ratio</p>
              <p className={`text-3xl font-black ${summary.kdRatio >= 1.0 ? 'text-green-500' : 'text-zinc-300'}`}>
                {summary.kdRatio}
              </p>
              <p className="text-xs text-zinc-500 font-medium">
                {summary.totalKills}K - {summary.totalDeaths}D
              </p>
            </div>

            <div className="bg-zinc-900 p-5 space-y-1">
              <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Headshot %</p>
              <p className={`text-3xl font-black ${summary.globalHsPercent >= 20 ? 'text-green-500' : 'text-zinc-300'}`}>
                {summary.globalHsPercent}%
              </p>
            </div>

            <div className="bg-zinc-900 p-5 space-y-1">
              <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Damage / Round</p>
              <p className={`text-3xl font-black ${summary.globalAdr >= 130 ? 'text-green-500' : 'text-zinc-300'}`}>
                {summary.globalAdr}
              </p>
            </div>
            
            <div className="bg-zinc-900 p-5 space-y-1 col-span-2">
              <div className="flex justify-between items-center">
                 <div>
                    <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">Kills / Deaths / Assists</p>
                    <p className="text-xl font-bold text-white tracking-wide">
                      {summary.totalKills} <span className="text-zinc-600">/</span> {summary.totalDeaths} <span className="text-zinc-600">/</span> {summary.totalAssists}
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">ACS</p>
                    <p className="text-xl font-bold text-white tracking-wide">{summary.globalAcs}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {summary.topAgents && summary.topAgents.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
              <h2 className="font-bold text-sm text-zinc-300 uppercase tracking-widest">Top Agents</h2>
            </div>
            <div className="divide-y divide-zinc-800">
              {summary.topAgents.map((agentStat, idx) => {
                const agent = agentDict[agentStat.characterId?.toLowerCase()];
                const name = agent?.displayName || agentStat.characterId;
                return (
                  <div key={idx} className="p-4 flex items-center gap-4 hover:bg-zinc-800/30 transition-colors">
                    {agent?.displayIcon ? (
                      <img src={agent.displayIcon} alt={name} className="w-12 h-12 rounded bg-zinc-800 border border-zinc-700" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-zinc-800 border border-zinc-700" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white capitalize">{name}</p>
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase">{agentStat.matches} Matches Played</p>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div>
                         <p className="text-zinc-400 text-[10px] font-bold uppercase">Win %</p>
                         <p className={`text-sm font-bold ${agentStat.winRate >= 50 ? 'text-green-400' : 'text-zinc-300'}`}>{agentStat.winRate}%</p>
                      </div>
                      <div>
                         <p className="text-zinc-400 text-[10px] font-bold uppercase">K/D</p>
                         <p className={`text-sm font-bold ${agentStat.kdRatio >= 1 ? 'text-green-400' : 'text-zinc-300'}`}>{agentStat.kdRatio}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
      </div>

      {/* Right Column: Match History feed */}
      <div className="lg:col-span-8 space-y-2">
        
        <div className="flex items-center justify-between pb-2">
           <h2 className="font-bold text-xl text-white">Recent Matches</h2>
        </div>

        <div className="flex flex-col gap-1.5">
          {recentMatches.map((match, idx) => (
            <MatchCard key={`${match.matchId}-${idx}`} match={match} agentDict={agentDict} mapDict={mapDict} />
          ))}

          {recentMatches.length === 0 && (
            <div className="text-center p-12 bg-zinc-900 rounded border border-zinc-800">
              <p className="text-zinc-400 font-medium">No recent matches found in the active region.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function MatchCard({ match, agentDict, mapDict }) {
  const { hasWon, stats, combatScore, characterId, mapId, scoreString, matchHsPercent, matchAdr } = match;
  
  const outcomeColor = hasWon ? 'bg-[#18231e]' : 'bg-[#2a171a]';
  const outcomeBar = hasWon ? 'bg-green-500' : 'bg-red-500';
  const outcomeText = hasWon ? 'text-green-500' : 'text-red-500';
  const outcomeLabel = hasWon ? `${scoreString} VICTORY` : `${scoreString} DEFEAT`;

  const agent = agentDict[characterId?.toLowerCase()];
  const mapName = mapDict[mapId]?.displayName || mapId;
  const kd = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);

  return (
    <div className={`relative flex items-center rounded border border-zinc-800 ${outcomeColor} overflow-hidden group hover:brightness-110 transition-all`}>
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

      <div className="flex-1 grid grid-cols-5 gap-2 py-2.5 px-4 items-center border-l border-zinc-800/50">
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
    </div>
  );
}
