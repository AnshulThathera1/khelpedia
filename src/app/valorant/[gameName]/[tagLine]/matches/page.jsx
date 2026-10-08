import { getValorantProfile } from '@/app/actions/valorant';
import MatchFeedClient from './MatchFeedClient';
import AdContainer from '@/app/components/ads/AdContainer';

export const metadata = {
  title: 'Matches - Valorant Profile Tracker',
};

export default async function MatchesTab({ params }) {
  const { gameName, tagLine } = await params;
  const decodedName = decodeURIComponent(gameName);
  const decodedTag = decodeURIComponent(tagLine);

  const profileData = await getValorantProfile(decodedName, decodedTag);
  if (profileData.error) return null;

  const { playerStats, agentDict, mapDict, tiersRes, account } = profileData;
  const { recentMatches, totalAvailableMatches, initialCursor, hasMoreMatches } = playerStats;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Mobile / Tablet Ad: Visible only when desktop sidebars are hidden (< 1536px) */}
      <div className="block 2xl:hidden mb-6 flex justify-center">
        <AdContainer
          type="banner_320x50"
          placement="valorant_matches_top"
        />
      </div>

      <MatchFeedClient 
        initialMatches={recentMatches} 
        puuid={account?.puuid}
        totalAvailableMatches={totalAvailableMatches}
        initialCursor={initialCursor}
        hasMoreInitial={hasMoreMatches}
        agentDict={agentDict} 
        mapDict={mapDict} 
        tiersRes={tiersRes} 
      />
    </main>
  );
}
