import { getValorantLeaderboard, getCurrentActId } from '@/app/actions/valorant';
import Link from 'next/link';
import { Trophy, Medal, ChevronLeft, Target } from 'lucide-react';

export const revalidate = 3600; // Cache leaderboard for 1 hour

export const metadata = {
  title: 'Valorant Regional Leaderboard - KhelPediA',
  description: 'View the top 100 Radiant and Immortal players in Valorant for the current act.',
};

export default async function ValorantLeaderboardPage() {
  const actId = await getCurrentActId();
  
  if (!actId) {
    return <ErrorState message="Could not determine the active competitive act." />;
  }

  // AP Region is hardcoded for now, but can be dynamic
  const leaderboardRes = await getValorantLeaderboard(actId, 'ap');

  if (leaderboardRes.error) {
    return <ErrorState message={leaderboardRes.error} />;
  }

  const players = leaderboardRes.data || [];

  return (
    <div className="min-h-screen bg-[#0f1923] text-white selection:bg-red-500/30">
      
      {/* Header NavBar */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/valorant" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-medium">
            <ChevronLeft className="w-5 h-5" />
            Back to Search
          </Link>
          <div className="font-bold text-xl tracking-wider text-red-500">VALORANT LEADERBOARD</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 text-red-500 rounded-full mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase drop-shadow-md">
            Top 100 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Radiant</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium">Asia Pacific (AP) Region - Current Act</p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-950/50 border-b border-zinc-800 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
            <div className="col-span-6 md:col-span-5">Player (Riot ID)</div>
            <div className="col-span-4 md:col-span-3 text-right">Rating (RR)</div>
            <div className="col-span-3 text-right hidden md:block">Wins</div>
          </div>
          
          <div className="divide-y divide-zinc-800">
            {players.map((player, index) => (
              <PlayerRow key={player.puuid || index} player={player} rank={index + 1} />
            ))}
          </div>

          {players.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              No leaderboard data available at this time.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PlayerRow({ player, rank }) {
  // If player is anonymous, they won't have gameName/tagLine
  const isAnonymous = !player.gameName;
  const displayName = isAnonymous ? "Secret Agent" : player.gameName;
  const tagLine = isAnonymous ? "" : `#${player.tagLine}`;
  
  // Styling for top 3
  const isTop3 = rank <= 3;
  const rankColors = {
    1: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    2: 'text-zinc-300 bg-zinc-300/10 border-zinc-300/20',
    3: 'text-amber-600 bg-amber-600/10 border-amber-600/20',
  };
  
  const defaultColor = 'text-gray-400';
  const rankColor = rankColors[rank] || defaultColor;

  return (
    <div className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-zinc-800/50 transition-colors group ${isTop3 ? 'bg-zinc-900/30' : ''}`}>
      
      <div className="col-span-2 md:col-span-1 flex justify-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${rankColor}`}>
          {rank}
        </div>
      </div>

      <div className="col-span-6 md:col-span-5 flex items-center gap-3 truncate">
        {!isAnonymous && rank <= 10 ? <Medal className="w-4 h-4 text-red-500 hidden sm:block flex-shrink-0" /> : <div className="w-4 hidden sm:block" />}
        <div className="truncate">
          {isAnonymous ? (
            <span className="text-gray-500 font-bold italic">{displayName}</span>
          ) : (
            <Link href={`/valorant/${encodeURIComponent(player.gameName)}/${encodeURIComponent(player.tagLine)}`} className="hover:underline focus:outline-none">
              <span className="text-white font-bold text-lg">{displayName}</span>
              <span className="text-gray-500 font-medium text-sm ml-1">{tagLine}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="col-span-4 md:col-span-3 text-right">
        <span className="text-xl font-black text-white">{player.rankedRating}</span>
        <span className="text-xs text-gray-500 font-bold ml-1 uppercase">RR</span>
      </div>

      <div className="col-span-3 text-right hidden md:flex flex-col items-end justify-center">
        <div className="flex items-center gap-1.5 text-green-400 bg-green-400/10 px-2 py-1 rounded">
          <Target className="w-3 h-3" />
          <span className="font-bold text-sm">{player.numberOfWins}</span>
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
        <h2 className="text-xl font-bold text-red-100">Leaderboard Error</h2>
        <p className="text-red-400 font-medium">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Make sure RIOT_API_KEY is properly set in the environment variables and the act ID is valid.</p>
      </div>
    </div>
  );
}
