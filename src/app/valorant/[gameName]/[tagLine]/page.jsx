import { getValorantAccount, getMatchHistoryIds, getMatchDetails, aggregatePlayerStats, getValorantAgents, getValorantMaps } from '@/app/actions/valorant';
import Link from 'next/link';
import { ChevronLeft, AlertCircle } from 'lucide-react';

export const revalidate = 60; // Cache this page or revalidate every 60s

export async function generateMetadata({ params }) {
  const { gameName, tagLine } = await params;
  const name = decodeURIComponent(gameName);
  const tag = decodeURIComponent(tagLine);
  
  return {
    title: `${name}#${tag} - Valorant Stats & Profile Tracker`,
    description: `View ${name}'s Valorant stats, match history, K/D ratio, win rate, and agent performance.`,
  };
}

export default async function ValorantProfilePage({ params }) {
  // Await params per Next.js 15+ convention if applicable, but usually destructurable directly in 14.
  // Next 15 requires awaiting params
  const { gameName, tagLine } = await params;

  const decodedName = decodeURIComponent(gameName);
  const decodedTag = decodeURIComponent(tagLine);

  // 1. Get Account
  const accountRes = await getValorantAccount(decodedName, decodedTag);
  
  if (accountRes.error) {
    return <ErrorState message={accountRes.error} />;
  }

  const { puuid, game_name, tag_line } = accountRes.data;

  // 2. Get Match History IDs
  const historyRes = await getMatchHistoryIds(puuid);
  
  if (historyRes.error) {
    return <ErrorState message={historyRes.error} />;
  }

  const matchIds = historyRes.data || [];

  // 3. Get Match Details (Parallel)
  const matchesData = await Promise.all(
    matchIds.map(async (id) => {
      const matchRes = await getMatchDetails(id, puuid);
      if (matchRes.error || !matchRes.data) return null;
      return matchRes.data;
    })
  );

  const cleanMatches = matchesData.filter(Boolean);

  // 4. Aggregate Stats
  const playerStats = await aggregatePlayerStats(cleanMatches, puuid);

  if (!playerStats) {
    return <ErrorState message="No robust match data found for this player." />;
  }

  // 5. Fetch Assets
  const [agentsRes, mapsRes] = await Promise.all([
    getValorantAgents(),
    getValorantMaps()
  ]);

  const agentDict = agentsRes.reduce((acc, a) => ({ ...acc, [a.uuid.toLowerCase()]: a }), {});
  const mapDict = mapsRes.reduce((acc, m) => ({ ...acc, [m.mapUrl]: m }), {});

  const { summary, recentMatches } = playerStats;
  const topAgent = summary.mostPlayedAgent ? (agentDict[summary.mostPlayedAgent.toLowerCase()]?.displayName || summary.mostPlayedAgent) : null;

  return (
    <div className="min-h-screen bg-[#0f1923] text-white selection:bg-red-500/30">
      
      {/* Header NavBar */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/valorant" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-medium">
            <ChevronLeft className="w-5 h-5" />
            Back to Search
          </Link>
          <div className="font-bold text-xl tracking-wider text-red-500">VALORANT TRACKER</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Player Identity & Summary Stats */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Identity Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
            <h1 className="text-3xl font-black truncate relative z-10">{game_name}</h1>
            <p className="text-gray-400 text-lg font-medium relative z-10">#{tag_line}</p>
          </div>

          {/* Overall Stats Card */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-6 space-y-6">
            <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4">Last {summary.totalMatches} Matches</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-gray-400 text-xs uppercase font-semibold">Win Rate</p>
                <p className={`text-2xl font-black ${summary.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                  {summary.winRate}%
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-gray-400 text-xs uppercase font-semibold">W / L</p>
                <p className="text-2xl font-black text-white">
                  {summary.wins} <span className="text-gray-600">/</span> {summary.losses}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-gray-400 text-xs uppercase font-semibold">K/D Ratio</p>
                <p className={`text-2xl font-black ${summary.kdRatio >= 1.0 ? 'text-green-500' : 'text-zinc-300'}`}>
                  {summary.kdRatio}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-gray-400 text-xs uppercase font-semibold">K / D / A</p>
                <p className="text-lg font-bold text-gray-300">
                  {summary.totalKills} / {summary.totalDeaths} / {summary.totalAssists}
                </p>
              </div>
            </div>

            {summary.mostPlayedAgent && (
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-gray-400 text-xs uppercase font-semibold mb-2">Most Played Agent</p>
                <div className="flex items-center gap-3">
                  {agentDict[summary.mostPlayedAgent?.toLowerCase()]?.displayIcon && (
                    <img src={agentDict[summary.mostPlayedAgent.toLowerCase()].displayIcon} alt={topAgent} className="w-10 h-10 rounded-full bg-zinc-800" />
                  )}
                  <p className="text-xl font-bold text-white capitalize">{topAgent}</p>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Right Column: Match History feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="w-8 h-1 bg-red-500 rounded-full block" />
            Recent Matches
          </h2>

          {recentMatches.map((match, idx) => (
            <MatchCard key={`${match.matchId}-${idx}`} match={match} agentDict={agentDict} mapDict={mapDict} />
          ))}

          {recentMatches.length === 0 && (
            <div className="text-center p-10 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <p className="text-gray-400">No recent matches found.</p>
            </div>
          )}
        </div>
      </main>

      {/* Compliance Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-zinc-800/50">
        <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-xl">
          <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">Compliance & Privacy Notice</h4>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-4xl">
            KhelPediA operates in accordance with Riot Games' official API policies. Statistics and match history are 
            displayed only for players who have explicitly **opted-in** to our platform via Riot Sign On (RSO). 
            If this is your profile and you wish to hide or manage your data, please log in to your dashboard. 
            Detailed data for non-opted-in players is restricted to comply with privacy regulations.
          </p>
        </div>
      </footer>

    </div>
  );
}

function MatchCard({ match, agentDict, mapDict }) {
  const { hasWon, stats, combatScore, characterId, mapId } = match;
  
  const outcomeColor = hasWon ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30';
  const outcomeBar = hasWon ? 'bg-green-500' : 'bg-red-500';
  const outcomeText = hasWon ? 'text-green-500' : 'text-red-500';
  const outcomeLabel = hasWon ? 'VICTORY' : 'DEFEAT';

  // Find Agent and Map
  const agent = agentDict[characterId?.toLowerCase()];
  const mapName = mapDict[mapId]?.displayName || mapId;

  // KD calculation specific to match
  const kd = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);

  return (
    <div className={`relative flex items-center p-4 rounded-xl border ${outcomeColor} overflow-hidden group hover:bg-zinc-800/80 transition-colors`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${outcomeBar}`} />
      
      {/* Agent Image context */}
      <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 mr-4 ml-2 overflow-hidden border border-zinc-700">
         {agent ? (
            <img src={agent.displayIcon} alt={agent.displayName} className="w-full h-full object-cover scale-110" />
         ) : (
            <div className="font-bold text-zinc-500 text-xs rotate-[-45deg] scale-150 opacity-20 truncate w-full text-center">
               {characterId}
            </div>
         )}
      </div>

      <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        
        {/* Outcome & Map */}
        <div>
          <p className={`font-black text-lg ${outcomeText}`}>{outcomeLabel}</p>
          <p className="text-xs text-gray-400 font-medium truncate">{mapName}</p>
        </div>

        {/* KDA */}
        <div className="text-center">
          <p className="text-lg font-bold text-white tracking-wider">
            {stats.kills} <span className="text-zinc-600">/</span> {stats.deaths} <span className="text-zinc-600">/</span> {stats.assists}
          </p>
          <p className="text-xs text-gray-400 font-medium uppercase mt-1">KDA</p>
        </div>

        {/* KD Ratio */}
        <div className="text-center hidden md:block">
          <p className={`text-lg font-bold ${kd >= 1 ? 'text-green-400' : 'text-zinc-400'}`}>{kd}</p>
          <p className="text-xs text-gray-400 font-medium uppercase mt-1">K/D</p>
        </div>

        {/* Combat Score */}
        <div className="text-center">
          <p className="text-lg font-bold text-white">{Math.round(combatScore)}</p>
          <p className="text-xs text-gray-400 font-medium uppercase mt-1">ACS</p>
        </div>

      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="min-h-screen bg-[#0f1923] text-white flex flex-col items-center justify-center p-4">
      <Link href="/valorant" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2">
        <ChevronLeft className="w-5 h-5" /> Search
      </Link>
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl flex flex-col items-center max-w-lg text-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-red-100">Profile Error</h2>
        <p className="text-red-400 font-medium">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Please ensure the Riot API key is valid and the Riot ID is formatting correctly (Name#Tag).</p>
      </div>
    </div>
  );
}
