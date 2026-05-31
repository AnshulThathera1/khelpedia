import { getValorantProfile } from '@/app/actions/valorant';

export const metadata = {
  title: 'Maps - Valorant Profile Tracker',
};

export default async function MapsTab({ params }) {
  const { gameName, tagLine } = await params;
  const decodedName = decodeURIComponent(gameName);
  const decodedTag = decodeURIComponent(tagLine);

  const profileData = await getValorantProfile(decodedName, decodedTag);
  if (profileData.error) return null;

  const { playerStats, mapDict } = profileData;
  const { summary } = playerStats;
  const { allMaps } = summary;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="font-bold text-xl text-white mb-4">Map Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {allMaps.map((mapStat, idx) => {
           const map = mapDict[mapStat.mapId];
           const mapName = map?.displayName || mapStat.mapId;
           const bgImage = map?.listViewIcon || map?.splash;

           return (
             <div key={idx} className="relative rounded overflow-hidden border border-zinc-800 bg-zinc-900 group shadow-sm h-32 flex items-end">
               {bgImage && (
                 <div 
                   className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-500"
                   style={{ backgroundImage: `url(${bgImage})` }}
                 />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
               
               <div className="relative z-10 p-4 w-full flex items-end justify-between">
                  <div>
                    <h3 className="font-black text-2xl text-white tracking-widest uppercase">{mapName}</h3>
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">{mapStat.matches} Matches Played</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Win Rate</p>
                    <p className={`text-2xl font-black ${mapStat.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                      {mapStat.winRate}%
                    </p>
                    <p className="text-xs font-semibold text-zinc-400">{mapStat.wins}W - {mapStat.losses}L</p>
                  </div>
               </div>
             </div>
           );
         })}

         {allMaps.length === 0 && (
           <div className="col-span-2 p-8 text-center text-zinc-500 font-medium bg-zinc-900 rounded border border-zinc-800">
              Not enough map data available for this set of matches.
           </div>
         )}
      </div>
    </main>
  );
}
