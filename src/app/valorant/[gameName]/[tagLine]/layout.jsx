import { getValorantProfile } from '@/app/actions/valorant';
import Link from 'next/link';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import TabNavigation from './TabNavigation';

export default async function ValorantProfileLayout({ children, params }) {
  const { gameName, tagLine } = await params;
  const decodedName = decodeURIComponent(gameName);
  const decodedTag = decodeURIComponent(tagLine);

  const profileData = await getValorantProfile(decodedName, decodedTag);

  if (profileData.error) {
    return <ErrorState message={profileData.error} />;
  }

  const { account, playerStats, agentDict, tiersRes, playerCardDict } = profileData;
  const { game_name, tag_line } = account;
  const { summary } = playerStats;
  
  const rankObj = summary.currentRankTier ? tiersRes.find(t => t.tier === summary.currentRankTier) : null;
  
  // Use Player Card if available, fallback to Top Agent
  const cardId = summary.currentPlayerCard?.toLowerCase();
  const playerCard = cardId ? playerCardDict[cardId] : null;
  const bannerImg = playerCard?.wideArt;
  const avatarImg = playerCard?.smallArt || playerCard?.displayIcon;

  // Fallbacks
  const mostPlayedAgent = summary.topAgents?.[0]?.characterId;
  const topAgentIcon = mostPlayedAgent && agentDict[mostPlayedAgent.toLowerCase()]?.displayIcon;
  
  const finalBanner = bannerImg || topAgentIcon;
  const finalAvatar = avatarImg || topAgentIcon;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-red-500/30 font-sans">
      
      {/* Header NavBar */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-glass)] backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/valorant" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 font-semibold text-sm">
            <ChevronLeft className="w-4 h-4" />
            Tracker Search
          </Link>
          <div className="font-black text-lg tracking-widest text-red-500 uppercase">KhelPediA</div>
        </div>
      </header>

      {/* Top Hero Banner */}
      <div className="w-full bg-[var(--bg-secondary)] border-b border-[var(--border-color)] relative overflow-hidden h-32 md:h-48 lg:h-64 flex items-end">
        {finalBanner && (
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${finalBanner})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-transparent" />
        
        <div className="max-w-6xl mx-auto px-4 w-full relative z-10 pb-4 md:pb-6 flex items-end justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-[var(--bg-card)] border-2 md:border-4 border-[var(--border-color)] rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
              {finalAvatar ? (
                <img src={finalAvatar} className="w-full h-full object-cover scale-110" alt="Avatar" />
              ) : (
                <span className="text-2xl md:text-4xl font-black text-[var(--text-muted)]">?</span>
              )}
            </div>
            <div className="space-y-0 md:space-y-1">
              <h1 className="text-xl md:text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight flex items-baseline gap-1 md:gap-2">
                {game_name}
                <span className="text-sm md:text-xl lg:text-3xl font-bold text-[var(--text-muted)]">#{tag_line}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest mt-1 md:mt-2">
                {rankObj && (
                  <div className="flex items-center gap-1.5 md:gap-2 bg-[var(--bg-card)] px-2 py-1 md:px-3 md:py-1 rounded border border-[var(--border-color)]">
                     <img src={rankObj.smallIcon} alt={rankObj.tierName} className="w-4 h-4 md:w-5 md:h-5" />
                     <span className="text-[var(--text-primary)]">{rankObj.tierName}</span>
                  </div>
                )}
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 md:px-3 md:py-1 rounded">Update Profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
         <div className="max-w-6xl mx-auto px-4">
            <TabNavigation gameName={decodedName} tagLine={decodedTag} />
         </div>
      </div>

      {/* Main Content Rendered Here */}
      {children}
      
      {/* Compliance Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded">
          <h4 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Compliance & Privacy Notice</h4>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed max-w-4xl">
            KhelPediA operates in accordance with Riot Games' official API policies. Statistics and match history are 
            displayed only for players who have explicitly opted-in to our platform via Riot Sign On (RSO). 
            If this is your profile and you wish to hide or manage your data, please log in to your dashboard. 
            Detailed data for non-opted-in players is restricted to comply with privacy regulations.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4">
      <Link href="/valorant" className="absolute top-8 left-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2">
        <ChevronLeft className="w-5 h-5" /> Search
      </Link>
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl flex flex-col items-center max-w-lg text-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-red-100">Profile Error</h2>
        <p className="text-red-400 font-medium">{message}</p>
        <p className="text-sm text-[var(--text-muted)] mt-2">Please ensure the Riot API key is valid and the Riot ID is formatting correctly (Name#Tag).</p>
      </div>
    </div>
  );
}
