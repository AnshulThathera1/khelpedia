import { getValorantProfile } from '@/app/actions/valorant';
import MatchFeedClient from './MatchFeedClient';

export const metadata = {
  title: 'Matches - Valorant Profile Tracker',
};

export default async function MatchesTab({ params }) {
  const { gameName, tagLine } = await params;
  const decodedName = decodeURIComponent(gameName);
  const decodedTag = decodeURIComponent(tagLine);

  const profileData = await getValorantProfile(decodedName, decodedTag);
  if (profileData.error) return null;

  const { playerStats, agentDict, mapDict, tiersRes } = profileData;
  const { recentMatches } = playerStats;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="font-bold text-xl text-white mb-4">Detailed Match History</h2>
      <MatchFeedClient 
        recentMatches={recentMatches} 
        agentDict={agentDict} 
        mapDict={mapDict} 
        tiersRes={tiersRes} 
      />
    </main>
  );
}
