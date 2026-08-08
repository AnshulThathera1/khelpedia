'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ChevronLeft, ChevronRight, Activity, Medal, Star } from 'lucide-react';
import { getChallengerLeague } from '@/app/actions/lol';
import Image from 'next/image';

const REGIONS = [
  { id: 'na1', name: 'North America' },
  { id: 'euw1', name: 'Europe West' },
  { id: 'kr', name: 'Korea' },
];

export default function LolLeaderboards() {
  const [region, setRegion] = useState('na1');
  const [queue, setQueue] = useState('RANKED_SOLO_5x5');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      setError('');
      try {
        const res = await getChallengerLeague(queue, region);
        if (res.error) {
          setError(res.error);
          setLeaderboard([]);
        } else {
          // Sort by League Points descending
          const sortedEntries = (res.data?.entries || []).sort((a, b) => b.leaguePoints - a.leaguePoints);
          setLeaderboard(sortedEntries);
        }
      } catch (e) {
        setError('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, [region, queue]);

  return (
    <div className="min-h-screen py-10" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="container max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[#C89B3C]" /> Challenger Leaderboard
            </h1>
            <p className="text-gray-400 mt-2">Top players in League of Legends.</p>
          </div>

          <div className="flex gap-4">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-[var(--bg-secondary)] text-white border border-[var(--border-color)] px-4 py-2 rounded-lg outline-none cursor-pointer uppercase font-bold text-sm"
            >
              {REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.id.toUpperCase()})</option>
              ))}
            </select>
            <select
              value={queue}
              onChange={(e) => setQueue(e.target.value)}
              className="bg-[var(--bg-secondary)] text-white border border-[var(--border-color)] px-4 py-2 rounded-lg outline-none cursor-pointer uppercase font-bold text-sm"
            >
              <option value="RANKED_SOLO_5x5">Ranked Solo</option>
              <option value="RANKED_FLEX_SR">Ranked Flex</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg mb-8 text-center font-bold">
            {error}
          </div>
        )}

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] font-bold text-sm uppercase text-gray-400 tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5 md:col-span-6">Summoner Name</div>
            <div className="col-span-3 md:col-span-2 text-center">LP</div>
            <div className="col-span-3 text-right">Win Rate</div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
               <Activity className="w-10 h-10 animate-spin text-[#C89B3C]" />
            </div>
          ) : (
            <div className="flex flex-col">
              {leaderboard.slice(0, 100).map((entry, idx) => {
                const totalGames = entry.wins + entry.losses;
                const winRate = totalGames > 0 ? ((entry.wins / totalGames) * 100).toFixed(1) : 0;
                
                return (
                  <div key={entry.summonerId} className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors items-center">
                    <div className="col-span-1 text-center font-black text-xl text-gray-500 flex justify-center">
                      {idx === 0 ? <Medal className="w-6 h-6 text-yellow-400" /> : 
                       idx === 1 ? <Medal className="w-6 h-6 text-gray-300" /> :
                       idx === 2 ? <Medal className="w-6 h-6 text-amber-600" /> : 
                       idx + 1}
                    </div>
                    <div className="col-span-5 md:col-span-6 font-bold text-lg flex items-center gap-2">
                        {/* Note: The Challenger API only returns summonerName, not Riot ID (gameName/tagLine). 
                            To make this clickable, we'd need to resolve summonerId to PUUID, then PUUID to Riot ID. 
                            For now, we display the summonerName (which might be an empty string in recent Riot updates if they rely fully on Riot IDs now).
                            If summonerName is empty or deprecated, we might need to batch fetch accounts, which is heavily rate-limited. */}
                        {entry.summonerName || "Unknown Player"}
                    </div>
                    <div className="col-span-3 md:col-span-2 text-center font-bold text-[#C89B3C] text-lg">
                      {entry.leaguePoints} <span className="text-xs text-gray-500 ml-1">LP</span>
                    </div>
                    <div className="col-span-3 text-right">
                      <div className="font-bold">{winRate}%</div>
                      <div className="text-xs text-gray-500">{entry.wins}W {entry.losses}L</div>
                    </div>
                  </div>
                )
              })}
              {leaderboard.length === 0 && !error && (
                <div className="text-center py-20 text-gray-500 italic">No data found for this queue/region.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
