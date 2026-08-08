import { getLolProfile } from '@/app/actions/lol';
import { getProfileIconUrl, getChampionIconUrl } from '@/app/lol/utils';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Trophy, Swords, Clock, AlertTriangle, PlayCircle } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { gameName, tagLine, region } = resolvedParams;
  return {
    title: `${decodeURIComponent(gameName)}#${decodeURIComponent(tagLine)} LoL Profile (${region.toUpperCase()}) | KhelPediA`,
  };
}

export default async function LolProfilePage({ params }) {
  const resolvedParams = await params;
  const { gameName, tagLine, region } = resolvedParams;
  const decodedName = decodeURIComponent(gameName);
  const decodedTag = decodeURIComponent(tagLine);

  const profile = await getLolProfile(decodedName, decodedTag, region);

  if (profile.error) {
    return (
      <div className="container py-20 flex flex-col items-center text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold uppercase mb-2">Profile Not Found</h1>
        <p className="text-gray-400 max-w-md mb-8">{profile.error}</p>
        <Link href="/lol" className="px-6 py-2 bg-[#C89B3C] text-black font-bold uppercase rounded hover:bg-[#d9ad4e] transition-colors">
          Go Back
        </Link>
      </div>
    );
  }

  const { account, summoner, ranks, matches, topMasteries, activeGame, championsData } = profile;

  // Find Ranked Solo rank
  const soloRank = ranks.find(r => r.queueType === 'RANKED_SOLO_5x5');
  const flexRank = ranks.find(r => r.queueType === 'RANKED_FLEX_SR');

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '400px',
        background: 'linear-gradient(to bottom, rgba(200,155,60,0.1), transparent)',
        pointerEvents: 'none', zIndex: 0
      }} />

      <div className="container relative z-10 pt-10">
        <Link href="/lol" className="inline-flex items-center gap-2 text-[#C89B3C] hover:text-white transition-colors mb-8 font-bold uppercase tracking-wider text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-[var(--bg-secondary)] p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-xl mb-8 relative overflow-hidden">
          {/* Accent strip */}
          <div className="absolute top-0 left-0 w-2 h-full bg-[#C89B3C]" />
          
          <div className="relative">
            <Image
              src={getProfileIconUrl(summoner.profileIconId)}
              alt="Profile Icon"
              width={120} height={120}
              className="rounded-full border-4 border-[#C89B3C] shadow-[0_0_20px_rgba(200,155,60,0.3)]"
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#111] border border-[#C89B3C] text-[#C89B3C] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              Level {summoner.summonerLevel}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2 flex items-center gap-3">
              {account.gameName}
              <span className="text-gray-500 font-medium text-2xl">#{account.tagLine}</span>
              {activeGame && (
                <span className="flex items-center gap-1 text-xs font-bold uppercase bg-red-500/20 text-red-500 border border-red-500/50 px-2 py-1 rounded">
                   <PlayCircle className="w-3 h-3 animate-pulse" /> Live
                </span>
              )}
            </h1>
            <div className="text-gray-400 font-medium flex gap-4">
              <span className="uppercase tracking-widest text-sm bg-[var(--bg-tertiary)] px-3 py-1 rounded">{region}</span>
            </div>
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Rank & Mastery) */}
          <div className="flex flex-col gap-8">
            {/* Rank Box */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-6">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                <Trophy className="w-5 h-5 text-[#C89B3C]" /> Ranked Solo
              </h2>
              {soloRank ? (
                <div className="flex items-center gap-6">
                  {/* Rank Emblem placeholder - ideally load from local assets */}
                  <div className="w-24 h-24 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center border-2 border-[#C89B3C]/30 text-[#C89B3C] font-bold text-xl uppercase">
                    {soloRank.tier.charAt(0)}
                  </div>
                  <div>
                    <div className="text-2xl font-black uppercase text-[#C89B3C]">{soloRank.tier} {soloRank.rank}</div>
                    <div className="text-gray-300 font-bold mb-1">{soloRank.leaguePoints} LP</div>
                    <div className="text-sm text-gray-500">
                      {soloRank.wins}W {soloRank.losses}L • <span className={soloRank.wins / (soloRank.wins + soloRank.losses) >= 0.5 ? 'text-green-500' : 'text-red-500'}>
                        {((soloRank.wins / (soloRank.wins + soloRank.losses)) * 100).toFixed(1)}% Win Rate
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-4">Unranked in Solo/Duo</div>
              )}
            </div>

            {/* Mastery Box */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-6">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                <Swords className="w-5 h-5 text-[#C89B3C]" /> Top Champions
              </h2>
              {topMasteries.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {topMasteries.map((mastery, idx) => {
                    const iconUrl = getChampionIconUrl(mastery.championId, championsData);
                    const champName = Object.values(championsData).find(c => c.key == mastery.championId)?.name || 'Unknown';
                    
                    return (
                      <div key={mastery.championId} className="flex items-center gap-4 bg-[var(--bg-tertiary)] p-3 rounded-xl border border-[var(--border-color)]">
                        <div className="relative">
                          {iconUrl ? (
                            <Image src={iconUrl} alt={champName} width={50} height={50} className="rounded-lg" />
                          ) : (
                             <div className="w-[50px] h-[50px] bg-gray-800 rounded-lg"></div>
                          )}
                          <div className="absolute -bottom-2 -right-2 bg-[#111] text-[#C89B3C] border border-[#C89B3C] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            M{mastery.championLevel}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold uppercase text-sm">{champName}</div>
                          <div className="text-xs text-gray-400">{mastery.championPoints.toLocaleString()} PTS</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                 <div className="text-gray-500 italic text-center py-4">No mastery data available</div>
              )}
            </div>
          </div>

          {/* Right Column (Matches) */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-6 h-full">
               <h2 className="text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
                <Clock className="w-5 h-5 text-[#C89B3C]" /> Recent Matches
              </h2>
              
              <div className="flex flex-col gap-4">
                {matches.length > 0 ? matches.map((match, i) => {
                  // Find the participant that corresponds to our searched puuid
                  const participant = match.info.participants.find(p => p.puuid === account.puuid);
                  if (!participant) return null;
                  
                  const won = participant.win;
                  const kda = participant.deaths === 0 
                    ? 'Perfect' 
                    : ((participant.kills + participant.assists) / participant.deaths).toFixed(2);
                    
                  const champIcon = getChampionIconUrl(participant.championId, championsData);
                  
                  // Match Duration
                  const minutes = Math.floor(match.info.gameDuration / 60);
                  const seconds = match.info.gameDuration % 60;
                  const timeAgo = Math.floor((Date.now() - match.info.gameEndTimestamp) / (1000 * 60 * 60 * 24)); // Roughly days ago
                  
                  return (
                    <div key={match.metadata.matchId} className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl border-l-4 ${won ? 'bg-blue-500/10 border-blue-500' : 'bg-red-500/10 border-red-500'} border-y border-r border-[var(--border-color)] transition-transform hover:scale-[1.01]`}>
                       <div className="flex-shrink-0 w-full md:w-24 text-center md:text-left">
                         <div className={`font-bold text-sm uppercase ${won ? 'text-blue-400' : 'text-red-400'}`}>
                           {won ? 'Victory' : 'Defeat'}
                         </div>
                         <div className="text-xs text-gray-500 mt-1">{match.info.gameMode}</div>
                         <div className="text-xs text-gray-500">{timeAgo === 0 ? 'Today' : `${timeAgo}d ago`}</div>
                       </div>
                       
                       <div className="flex items-center gap-4 flex-1">
                          {champIcon ? (
                             <Image src={champIcon} alt="Champion" width={60} height={60} className="rounded-full border-2 border-gray-700" />
                          ) : (
                             <div className="w-[60px] h-[60px] bg-gray-800 rounded-full"></div>
                          )}
                          <div>
                            <div className="font-bold text-lg">{participant.kills} / <span className="text-red-400">{participant.deaths}</span> / {participant.assists}</div>
                            <div className="text-xs text-gray-400 font-mono">{kda} KDA</div>
                          </div>
                       </div>

                       <div className="flex-shrink-0 flex gap-2">
                           {/* Items could go here, omitting for brevity in initial implementation */}
                           <div className="text-sm font-bold text-gray-300">CS {participant.totalMinionsKilled + participant.neutralMinionsKilled}</div>
                       </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-10 text-gray-500">
                    No recent matches found.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
