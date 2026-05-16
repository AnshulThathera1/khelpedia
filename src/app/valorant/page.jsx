'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trophy, Crosshair, TrendingUp } from 'lucide-react';

export default function ValorantTrackerSearchPage() {
  const [riotId, setRiotId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    if (!riotId) {
      setError('Please enter a Riot ID');
      return;
    }

    if (!riotId.includes('#')) {
      setError('Please include your Tagline (e.g. Player#NA1)');
      return;
    }

    const [gameName, tagLine] = riotId.split('#');
    
    if (!gameName || !tagLine) {
      setError('Invalid format. Use Player#Tag');
      return;
    }

    setIsLoading(true);
    // Navigate to profile page
    router.push(`/valorant/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30 flex flex-col relative overflow-hidden">
      
      {/* Background glowing effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <main className="flex-grow flex flex-col items-center justify-center px-4 relative z-10 pt-20">
        
        {/* Hero Section */}
        <div className="max-w-3xl w-full text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold tracking-wider mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Trophy className="w-4 h-4" />
            VALORANT STATS TRACKER
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight drop-shadow-lg">
            TRACK YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">LEGACY</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Search for any Valorant player to see their Match History, K/D ratio, Win Rate, and top Agents.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mt-10 relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-xl p-2 shadow-2xl">
              <Search className="w-6 h-6 text-gray-400 ml-4 hidden sm:block" />
              <input
                type="text"
                placeholder="Riot ID (e.g. TenZ#SEN)"
                value={riotId}
                onChange={(e) => setRiotId(e.target.value)}
                className="w-full bg-transparent text-white text-lg px-4 py-4 focus:outline-none placeholder-gray-500"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
            {error && (
              <div className="absolute -bottom-8 left-0 w-full text-red-400 text-sm font-medium animate-pulse">
                {error}
              </div>
            )}
          </form>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 pt-10 border-t border-zinc-800/50">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                <Crosshair className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Detailed Stats</h3>
              <p className="text-gray-400 text-sm">Track your K/D, combat score, and headshot percentages accurately.</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Match History</h3>
              <p className="text-gray-400 text-sm">Review your past matches, team performance, and round-by-round highlights.</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Agent Mastery</h3>
              <p className="text-gray-400 text-sm">See which agents you perform best with to climb the ranks faster.</p>
            </div>
          </div>

          {/* Riot Compliance Disclaimer */}
          <div className="mt-12 p-6 rounded-xl bg-zinc-900/20 border border-zinc-800/30 text-left max-w-2xl mx-auto">
            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Compliance & Privacy</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              KhelPediA complies with Riot Games' official API policies. By searching for a player, you acknowledge that 
              detailed match history and statistics are only available for players who have explicitly **opted-in** 
              to our service via Riot Sign On (RSO). If you wish to display your own stats, please log in and 
              verify your account.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
