import { getValorantProfile } from '@/app/actions/valorant';
import Link from 'next/link';

export default async function ValorantOverviewTab({ params }) {
   const { gameName, tagLine } = await params;
   const decodedName = decodeURIComponent(gameName);
   const decodedTag = decodeURIComponent(tagLine);

   const profileData = await getValorantProfile(decodedName, decodedTag);
   if (profileData.error) return null;

   const { playerStats, agentDict, mapDict, weaponDict, tiersRes } = profileData;
   const { summary, recentMatches, topWeapons, topMaps } = playerStats;

   // Group matches by date and calculate role stats
   const groupedMatches = [];
   let currentGroup = null;

   const roleStats = {
      Initiator: { wins: 0, matches: 0, kills: 0, deaths: 0, assists: 0, icon: 'https://media.valorant-api.com/agents/roles/1b47567f-8f7b-444b-aae3-b0c634622d10/displayicon.png' },
      Duelist: { wins: 0, matches: 0, kills: 0, deaths: 0, assists: 0, icon: 'https://media.valorant-api.com/agents/roles/dbe8757e-9e92-4ed4-b39f-9dfc589691d4/displayicon.png' },
      Sentinel: { wins: 0, matches: 0, kills: 0, deaths: 0, assists: 0, icon: 'https://media.valorant-api.com/agents/roles/4ee40330-ecdd-4f2f-98a8-eb1243428373/displayicon.png' },
      Controller: { wins: 0, matches: 0, kills: 0, deaths: 0, assists: 0, icon: 'https://media.valorant-api.com/agents/roles/4a3abe08-4ab8-4444-a077-9a84a6a57896/displayicon.png' },
   };

   recentMatches.forEach(match => {
      // Grouping logic
      const dateObj = new Date(match.gameStartMillis);
      const today = new Date();
      const isToday = dateObj.toDateString() === today.toDateString();
      let dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (isToday) dateStr = 'Today';

      if (!currentGroup || currentGroup.date !== dateStr) {
         currentGroup = { date: dateStr, matches: [], wins: 0, losses: 0 };
         groupedMatches.push(currentGroup);
      }

      currentGroup.matches.push(match);
      if (match.hasWon) currentGroup.wins++;
      else currentGroup.losses++;

      // Role Stats logic
      const agent = agentDict[match.characterId?.toLowerCase()];
      const roleName = agent?.role?.displayName;
      if (roleName && roleStats[roleName]) {
         roleStats[roleName].matches++;
         if (match.hasWon) roleStats[roleName].wins++;
         roleStats[roleName].kills += match.stats.kills;
         roleStats[roleName].deaths += match.stats.deaths;
         roleStats[roleName].assists += match.stats.assists;
      }
   });

   const sortedRoles = Object.keys(roleStats)
      .filter(r => roleStats[r].matches > 0)
      .sort((a, b) => roleStats[b].matches - roleStats[a].matches);

   // HS History for sparkline
   const hsHistory = [...recentMatches].reverse().map(m => parseFloat(m.matchHsPercent) || 0);
   const hsMax = Math.max(...hsHistory, 30);
   const chartPoints = hsHistory.map((val, i) => {
      const x = (i / (hsHistory.length - 1 || 1)) * 100;
      const y = 100 - ((val / hsMax) * 100);
      return `${x},${y}`;
   }).join(' ');

   const estimatedPlaytimeHours = Math.round((summary.totalMatches * 35) / 60);
   const rankObj = summary.currentRankTier ? tiersRes.find(t => t.tier === summary.currentRankTier) : null;

   return (
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-4 font-sans text-white">

         {/* Left Sidebar Column */}
         <div className="lg:col-span-3 space-y-4">

            {/* Rating Panel */}
            <div className="bg-[#1b2023] border border-zinc-800 rounded flex flex-col p-4 shadow-md relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-10">
                  {rankObj && <img src={rankObj.largeIcon} className="w-32 h-32" />}
               </div>
               <div className="relative z-10 flex items-center gap-4">
                  {rankObj ? (
                     <img src={rankObj.largeIcon} alt="Rank" className="w-16 h-16" />
                  ) : (
                     <div className="w-16 h-16 bg-zinc-800 rounded-full" />
                  )}
                  <div>
                     <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Rating</p>
                     <p className="text-xl font-black">{rankObj ? rankObj.tierName : 'Unranked'}</p>
                     <p className="text-xs font-semibold text-zinc-500">Peak: {rankObj ? rankObj.tierName : 'Unranked'}</p>
                  </div>
               </div>
            </div>

            {/* Accuracy Panel */}
            {summary.totalMatches > 0 && (
               <div className="bg-[#111518] border border-zinc-800 rounded shadow-md overflow-hidden">
                  <div className="p-3 pb-2 flex items-center justify-between">
                     <h3 className="font-black text-[13px] tracking-wide uppercase text-zinc-200">Accuracy</h3>
                     <span className="text-[10px] text-zinc-500 font-bold">Last 20 Matches</span>
                  </div>

                  <div className="p-4 pt-2 flex flex-col gap-4">
                     <div className="flex gap-6 items-center">
                        {/* Hit Map Diagram */}
                        <div className="w-16 h-28 relative flex flex-col items-center justify-center flex-shrink-0">
                           <svg viewBox="0 0 64 128" className="w-full h-full overflow-visible">
                              {/* Head */}
                              <circle cx="32" cy="18" r="14" fill="#6b7280" />

                              {/* Torso */}
                              <rect x="20" y="36" width="24" height="40" rx="3" fill="#16e5b7" />

                              {/* Arms */}
                              <rect x="8" y="38" width="9.5" height="36" rx="3" fill="#16e5b7" />
                              <rect x="46.5" y="38" width="9.5" height="36" rx="3" fill="#16e5b7" />

                              {/* Legs */}
                              <rect x="21" y="80" width="10" height="44" rx="3" fill="#6b7280" />
                              <rect x="33" y="80" width="10" height="44" rx="3" fill="#6b7280" />
                           </svg>
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                           <div className="flex justify-between items-center border-b border-zinc-800/60 pb-1">
                              <div className="flex items-center gap-3">
                                 <p className="text-[11px] font-bold text-zinc-500">Head</p>
                                 <p className="text-[15px] font-black text-orange-400">{summary.globalHsPercent}%</p>
                              </div>
                              <p className="text-[11px] font-bold text-white">{summary.totalHeadshots} <span className="text-zinc-500 font-normal">Hits</span></p>
                           </div>
                           <div className="flex justify-between items-center border-b border-zinc-800/60 pb-1">
                              <div className="flex items-center gap-3">
                                 <p className="text-[11px] font-bold text-zinc-500">Body</p>
                                 <p className="text-[15px] font-black text-[#16e5b7]">{summary.totalHits > 0 ? ((summary.totalBodyshots / summary.totalHits) * 100).toFixed(1) : 0}%</p>
                              </div>
                              <p className="text-[11px] font-bold text-white">{summary.totalBodyshots} <span className="text-zinc-500 font-normal">Hits</span></p>
                           </div>
                           <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                 <p className="text-[11px] font-bold text-zinc-500">Legs</p>
                                 <p className="text-[15px] font-black text-blue-400">{summary.totalHits > 0 ? ((summary.totalLegshots / summary.totalHits) * 100).toFixed(1) : 0}%</p>
                              </div>
                              <p className="text-[11px] font-bold text-white">{summary.totalLegshots} <span className="text-zinc-500 font-normal">Hits</span></p>
                           </div>
                        </div>
                     </div>

                     {/* HS% Line Chart */}
                     <div className="mt-2 relative">
                        <p className="text-[11px] font-bold text-white uppercase mb-4">Avg HS%</p>
                        <div className="w-full h-12 relative flex items-end">
                           {/* Y Axis Labels */}
                           <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] text-zinc-500 font-bold z-10 h-14 -mt-2">
                              <span>{Math.round(hsMax)}</span>
                              <span>{Math.round(hsMax * 0.66)}</span>
                              <span>{Math.round(hsMax * 0.33)}</span>
                              <span>0</span>
                           </div>

                           <div className="ml-6 flex-1 h-full relative">
                              {/* SVG Sparkline */}
                              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible preserve-aspect-ratio-none">
                                 <defs>
                                    <linearGradient id="hsGradient" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="0%" stopColor="#ff4655" stopOpacity="0.4" />
                                       <stop offset="100%" stopColor="#ff4655" stopOpacity="0" />
                                    </linearGradient>
                                 </defs>
                                 <polygon points={`0,100 ${chartPoints} 100,100`} fill="url(#hsGradient)" />
                                 <polyline points={chartPoints} fill="none" stroke="#ff4655" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                              </svg>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Roles Panel */}
            {sortedRoles.length > 0 && (
               <div className="bg-[#111518] border border-zinc-800 rounded shadow-md overflow-hidden mt-4">
                  <div className="p-3 border-b border-zinc-800">
                     <h3 className="font-black text-[13px] tracking-wide uppercase text-zinc-200">Roles</h3>
                  </div>
                  <div className="flex flex-col">
                     {sortedRoles.map((roleName, idx) => {
                        const rStats = roleStats[roleName];
                        const winRate = Math.round((rStats.wins / rStats.matches) * 100);
                        const kdRatio = rStats.deaths > 0 ? (rStats.kills / rStats.deaths).toFixed(2) : rStats.kills.toFixed(2);
                        const wrColor = winRate >= 50 ? 'text-[#16e5b7]' : 'text-red-500';
                        const arcColor = winRate >= 50 ? '#16e5b7' : '#ef4444';

                        return (
                           <div key={idx} className="flex items-center gap-4 p-4 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30">

                              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                 <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                    <circle cx="24" cy="24" r="21" stroke="#27272a" strokeWidth="3" fill="none" />
                                    <circle cx="24" cy="24" r="21" stroke={arcColor} strokeWidth="3" fill="none" strokeDasharray={`${winRate * 1.32} 132`} />
                                 </svg>
                                 <img src={rStats.icon} className="w-6 h-6 filter drop-shadow-md brightness-200" alt={roleName} />
                              </div>

                              <div className="flex-1">
                                 <p className="text-[11px] font-bold text-zinc-400 mb-0.5">{roleName}</p>
                                 <p className={`text-[13px] font-black ${wrColor}`}>WR {winRate}%</p>
                                 <p className="text-[9px] text-zinc-500 font-bold uppercase">{rStats.wins}W - {rStats.matches - rStats.wins}L</p>
                              </div>

                              <div className="text-right">
                                 <p className="text-[13px] font-black text-white">KDA {kdRatio}</p>
                                 <p className="text-[9px] text-zinc-500 font-bold mt-1">
                                    {rStats.kills} / {rStats.deaths} / {rStats.assists}
                                 </p>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            )}

            {/* Top Weapons Panel */}
            {topWeapons && topWeapons.length > 0 && (
               <div className="bg-[#111518] border border-zinc-800 rounded shadow-md overflow-hidden mt-4">
                  <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
                     <h3 className="font-black text-[13px] tracking-wide uppercase text-zinc-200">Top Weapons</h3>
                  </div>
                  <div className="flex flex-col">
                     {topWeapons.slice(0, 3).map((w, idx) => {
                        const weapon = weaponDict[w.weaponId];
                        if (!weapon) return null;
                        return (
                           <div key={idx} className="flex items-center p-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 gap-2">
                              <div className="flex flex-col justify-center w-20 flex-shrink-0">
                                 <div className="h-10 flex items-center justify-start">
                                    <img src={weapon.displayIcon} className="max-w-full max-h-full object-contain filter drop-shadow-md brightness-110" />
                                 </div>
                                 <p className="text-[12px] font-bold mt-1 text-white">{weapon.displayName}</p>
                                 <p className="text-[9px] text-zinc-500 font-bold">{weapon.shopData?.categoryText || 'Sidearm'}</p>
                              </div>

                              <div className="flex-1 flex items-center justify-center gap-2 border-l border-zinc-800/50 pl-2">
                                 <svg viewBox="0 0 64 128" className="w-8 h-12">
                                    <circle cx="32" cy="18" r="14" fill="#d1d5db" />
                                    <rect x="20" y="36" width="24" height="40" rx="3" fill="#6b7280" />
                                    <rect x="8" y="38" width="9.5" height="36" rx="3" fill="#6b7280" />
                                    <rect x="46.5" y="38" width="9.5" height="36" rx="3" fill="#6b7280" />
                                    <rect x="21" y="80" width="10" height="44" rx="3" fill="#4b5563" />
                                    <rect x="33" y="80" width="10" height="44" rx="3" fill="#4b5563" />
                                 </svg>
                                 <div className="flex flex-col justify-between h-12">
                                    <p className="text-[10px] font-bold text-zinc-300 leading-none">{w.headshots}%</p>
                                    <p className="text-[10px] font-bold text-zinc-300 leading-none">{w.bodyshots}%</p>
                                    <p className="text-[10px] font-bold text-zinc-300 leading-none">{w.legshots}%</p>
                                 </div>
                              </div>

                              <div className="w-16 text-right border-l border-zinc-800/50 pl-2">
                                 <p className="text-[10px] text-zinc-500 font-bold mb-0.5">Kills</p>
                                 <p className="text-[15px] font-black text-white">{w.kills}</p>
                              </div>
                           </div>
                        )
                     })}
                     <div className="p-3">
                        <button className="w-full bg-[#272b30] hover:bg-[#343a40] text-[11px] font-bold text-white py-2 rounded transition-colors">
                           View All Weapons
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* Top Maps Panel */}
            {topMaps && topMaps.length > 0 && (
               <div className="bg-[#1b2023] border border-zinc-800 rounded shadow-md overflow-hidden">
                  <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
                     <h3 className="font-black text-[13px] tracking-wide uppercase text-zinc-200">Top Maps</h3>
                  </div>
                  <div className="flex flex-col">
                     {topMaps.slice(0, 5).map((m, idx) => {
                        const map = mapDict[m.mapId];
                        if (!map) return null;
                        return (
                           <div key={idx} className="flex items-center justify-between p-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-8 rounded overflow-hidden relative border border-zinc-700">
                                    <img src={map.listViewIcon} className="absolute inset-0 w-full h-full object-cover" />
                                 </div>
                                 <p className="text-[13px] font-bold">{map.displayName}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] text-zinc-500 font-bold uppercase">Win %</p>
                                 <p className={`text-sm font-black ${m.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{m.winRate}%</p>
                                 <p className="text-[10px] text-zinc-500 font-medium">{m.wins}W - {m.losses}L</p>
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            )}
         </div>

         {/* Main Content Column */}
         <div className="lg:col-span-9 space-y-4">

            {/* Header Title Row */}
            <div className="flex items-end justify-between px-2 pt-1 pb-2 border-b border-zinc-800">
               <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                  Recent Matches Overview
               </h2>
               <div className="text-xs text-zinc-500 font-bold flex gap-4">
                  <span>{estimatedPlaytimeHours}h Playtime</span>
                  <span>//</span>
                  <span>{summary.totalMatches} Matches</span>
               </div>
            </div>

            {/* Big Dense Stats Grid */}
            <div className="bg-[#1b2023] border border-zinc-800 rounded shadow-md overflow-hidden">
               {/* Top Section: Ring chart + Main Stats */}
               <div className="p-6 border-b border-zinc-800 flex flex-wrap lg:flex-nowrap gap-8 items-center bg-gradient-to-br from-[#1b2023] to-[#15191b]">

                  {/* WL Circle Chart Simulation */}
                  <div className="w-28 h-28 rounded-full border-[8px] border-zinc-800 flex flex-col items-center justify-center relative shadow-inner flex-shrink-0">
                     {/* Fake SVG ring to simulate chart */}
                     <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="none" className="text-red-500" />
                        <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="none" className="text-green-500" strokeDasharray={`${summary.winRate * 2.76} 276`} />
                     </svg>
                     <p className="font-black text-xl text-green-500 leading-none mb-1">{summary.wins} <span className="text-xs font-bold uppercase text-green-500/70">W</span></p>
                     <p className="font-black text-xl text-red-500 leading-none">{summary.losses} <span className="text-xs font-bold uppercase text-red-500/70">L</span></p>
                  </div>

                  {/* Big 4 Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-4 divide-x divide-zinc-800">
                     <div className="px-4 flex flex-col justify-center">
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Damage/Round</p>
                        <p className="text-4xl font-black text-white">{summary.globalAdr}</p>
                     </div>
                     <div className="px-4 flex flex-col justify-center">
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">K/D Ratio</p>
                        <p className={`text-4xl font-black ${summary.kdRatio >= 1 ? 'text-green-400' : 'text-red-400'}`}>{summary.kdRatio}</p>
                     </div>
                     <div className="px-4 flex flex-col justify-center">
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Headshot %</p>
                        <p className="text-4xl font-black text-white">{summary.globalHsPercent}%</p>
                     </div>
                     <div className="px-4 flex flex-col justify-center">
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Win %</p>
                        <p className={`text-4xl font-black ${summary.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{summary.winRate}%</p>
                     </div>
                  </div>
               </div>

               {/* Middle Grid: Secondary Stats */}
               <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-zinc-800 border-b border-zinc-800 bg-[#161a1d]">
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Wins</p>
                     <p className="text-lg font-black text-white">{summary.wins}</p>
                  </div>
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">KAST</p>
                     <p className="text-lg font-black text-white">{summary.globalKast}%</p>
                  </div>
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">DDΔ/Round</p>
                     <p className={`text-lg font-black ${summary.globalDdPerRound > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {summary.globalDdPerRound > 0 ? '+' : ''}{summary.globalDdPerRound}
                     </p>
                  </div>
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Kills</p>
                     <p className="text-lg font-black text-white">{summary.totalKills}</p>
                  </div>
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Deaths</p>
                     <p className="text-lg font-black text-white">{summary.totalDeaths}</p>
                  </div>
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Assists</p>
                     <p className="text-lg font-black text-white">{summary.totalAssists}</p>
                  </div>
               </div>

               {/* Bottom Grid: Tertiary Stats */}
               <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-zinc-800 border-b border-zinc-800 bg-[#161a1d]">
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">ACS</p>
                     <p className="text-lg font-black text-white">{summary.globalAcs}</p>
                  </div>
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">KAD Ratio</p>
                     <p className="text-lg font-black text-white">{summary.globalKadRatio}</p>
                  </div>
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Kills/Round</p>
                     <p className="text-lg font-black text-white">{summary.globalKillsPerRound}</p>
                  </div>
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">First Bloods</p>
                     <p className="text-lg font-black text-white">{summary.totalFirstBloods}</p>
                  </div>
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Flawless Rnds</p>
                     <p className="text-lg font-black text-white">{summary.totalFlawlessRounds}</p>
                  </div>
                  <div className="p-4 flex flex-col">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Aces</p>
                     <p className="text-lg font-black text-white">{summary.totalAces}</p>
                  </div>
               </div>

               {/* Tracker Score Footer */}
               <div className="p-4 bg-[#1b2023] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-gradient-to-tr from-yellow-600 to-yellow-400 flex items-center justify-center text-zinc-900 shadow-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     </div>
                     <div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase">KhelPediA Score</p>
                        <p className="text-xl font-black text-yellow-400">{summary.kpsScore} <span className="text-xs text-zinc-500 font-semibold">/1000</span></p>
                     </div>
                  </div>
                  <div className="w-1/2 bg-zinc-800 h-2 rounded-full overflow-hidden">
                     <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full" style={{ width: `${Math.min(100, (summary.kpsScore / 1000) * 100)}%` }} />
                  </div>
               </div>
            </div>

            {/* Top Agents Dense Table */}
            {summary.topAgents && summary.topAgents.length > 0 && (
               <div className="bg-[#1b2023] border border-zinc-800 rounded shadow-md overflow-hidden mt-6">
                  <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                     <h3 className="font-black text-[11px] tracking-widest uppercase text-zinc-400">Top Agents</h3>
                     <span className="text-[10px] text-red-500 font-bold uppercase hover:underline cursor-pointer">View All Agents</span>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm border-collapse">
                        <thead>
                           <tr className="bg-[#161a1d] text-zinc-500 text-[10px] uppercase font-bold border-b border-zinc-800">
                              <th className="p-3 pl-4 font-bold">Agent</th>
                              <th className="p-3 font-bold text-center">Matches</th>
                              <th className="p-3 font-bold text-center">Win %</th>
                              <th className="p-3 font-bold text-center">K/D</th>
                              <th className="p-3 font-bold text-center">ACS</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                           {summary.topAgents.slice(0, 5).map((agentStat, idx) => {
                              const agent = agentDict[agentStat.characterId?.toLowerCase()];
                              const name = agent?.displayName || agentStat.characterId;
                              return (
                                 <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-3 pl-4 flex items-center gap-3">
                                       {agent?.displayIcon && <img src={agent.displayIcon} className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700" alt={name} />}
                                       <span className="font-bold text-white capitalize text-[13px]">{name}</span>
                                    </td>
                                    <td className="p-3 text-center font-bold text-zinc-300">{agentStat.matches}</td>
                                    <td className={`p-3 text-center font-black ${agentStat.winRate >= 50 ? 'text-green-400' : 'text-zinc-400'}`}>{agentStat.winRate}%</td>
                                    <td className={`p-3 text-center font-black ${agentStat.kdRatio >= 1 ? 'text-green-400' : 'text-zinc-400'}`}>{agentStat.kdRatio}</td>
                                    <td className="p-3 text-center font-bold text-zinc-300">{agentStat.acs}</td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* Match History feed */}
            <div className="mt-8 space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="font-bold text-sm text-zinc-300 uppercase tracking-widest">Match History</h2>
               </div>

               <div className="flex gap-2 flex-wrap mb-4">
                  <button className="bg-[#2a2a30] hover:bg-[#3f3f46] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors">All Agents</button>
                  <button className="bg-[#2a2a30] hover:bg-[#3f3f46] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors">All Maps</button>
                  <button className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors">Competitive</button>
               </div>

               {groupedMatches.map((group, gIdx) => (
                  <div key={gIdx} className="mb-6">
                     <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="font-black text-[13px] text-zinc-200 uppercase tracking-widest">{group.date}</h3>
                        <div className="flex items-center gap-4 text-[11px] font-bold uppercase">
                           <span className="text-zinc-500">{group.wins} W // {group.losses} L</span>
                           <span className={`px-2 py-0.5 rounded ${group.wins > group.losses ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {group.wins > group.losses ? 'Winning Day' : 'Losing Day'}
                           </span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-[3px]">
                        {group.matches.map((match, idx) => (
                           <MatchCard key={`${match.matchId}-${idx}`} match={match} agentDict={agentDict} mapDict={mapDict} />
                        ))}
                     </div>
                  </div>
               ))}

               {recentMatches.length === 0 && (
                  <div className="text-center p-12 bg-[#1b2023] rounded shadow border border-zinc-800 mt-4">
                     <p className="text-zinc-400 font-medium">No recent matches found.</p>
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
   const outcomeBar = hasWon ? 'bg-[#00ff00]' : 'bg-[#ff4655]';
   const outcomeText = hasWon ? 'text-[#00ff00]' : 'text-[#ff4655]';
   const outcomeLabel = hasWon ? `VICTORY` : `DEFEAT`;

   const agent = agentDict[characterId?.toLowerCase()];
   const mapName = mapDict[mapId]?.displayName || mapId;
   const kd = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);
   const dmgDelta = matchAdr > 140 ? '+' + (matchAdr - 140) : (matchAdr - 140); // very rough proxy since we don't have per match dmg delta passed down easily

   return (
      <div className={`relative flex items-center rounded-sm ${outcomeColor} border border-zinc-800/80 group hover:brightness-110 transition-all h-[68px]`}>
         <div className={`absolute left-0 top-0 bottom-0 w-1 ${outcomeBar}`} />

         {/* Left section: Agent & Score */}
         <div className="flex items-center w-64 pl-4 pr-2 border-r border-zinc-800/50 h-full py-1">
            <div className="w-12 h-12 bg-zinc-900 rounded flex-shrink-0 overflow-hidden border border-zinc-800">
               {agent ? (
                  <img src={agent.displayIcon} alt={agent.displayName} className="w-full h-full object-cover scale-110" />
               ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">?</div>
               )}
            </div>
            <div className="ml-3 flex flex-col justify-center gap-[1px]">
               <p className="text-[11px] text-zinc-400 font-semibold">{mapName} <span className="text-zinc-600 px-1">•</span> Comp</p>
               <div className="flex items-center gap-2">
                  <span className={`font-black text-sm tracking-wide ${outcomeText}`}>{scoreString}</span>
               </div>
            </div>
         </div>

         {/* Middle section: Badges (Fake for UI clone) */}
         <div className="hidden md:flex flex-1 px-4 border-r border-zinc-800/50 h-full items-center gap-1.5">
            {stats.kills >= 20 && <span className="bg-[#1b2023] border border-zinc-700 text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow">MVP</span>}
            {matchHsPercent >= 25 && <span className="bg-[#1b2023] border border-zinc-700 text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow">High HS%</span>}
            {kd >= 1.5 && <span className="bg-[#1b2023] border border-zinc-700 text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow">Carry</span>}
         </div>

         {/* Right section: Stats grid */}
         <div className="grid grid-cols-4 md:grid-cols-5 gap-0 h-full w-[360px] divide-x divide-zinc-800/30">
            <div className="flex flex-col items-center justify-center">
               <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">K/D</p>
               <p className={`text-xs font-black ${kd >= 1 ? 'text-[#00ff00]' : 'text-[#ff4655]'}`}>{kd}</p>
            </div>
            <div className="flex flex-col items-center justify-center col-span-2 md:col-span-1">
               <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">K / D / A</p>
               <p className="text-xs font-bold text-zinc-200 tracking-wide">
                  {stats.kills}<span className="text-zinc-600 px-0.5">/</span>{stats.deaths}<span className="text-zinc-600 px-0.5">/</span>{stats.assists}
               </p>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center">
               <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">HS%</p>
               <p className="text-xs font-bold text-zinc-300">{matchHsPercent}%</p>
            </div>
            <div className="hidden md:flex flex-col items-center justify-center">
               <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">ADR</p>
               <p className="text-xs font-bold text-zinc-300">{matchAdr}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
               <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">ACS</p>
               <p className="text-xs font-black text-white">{combatScore.toFixed(2)}</p>
            </div>
         </div>

         {/* Right chevron spacer */}
         <div className="w-8 flex items-center justify-center text-zinc-600 h-full hover:bg-zinc-800/50 cursor-pointer border-l border-zinc-800/50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
         </div>
      </div>
   );
}
