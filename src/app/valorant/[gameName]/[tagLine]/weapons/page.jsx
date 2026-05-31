import { getValorantProfile } from '@/app/actions/valorant';

export const metadata = {
  title: 'Weapons - Valorant Profile Tracker',
};

export default async function WeaponsTab({ params }) {
  const { gameName, tagLine } = await params;
  const decodedName = decodeURIComponent(gameName);
  const decodedTag = decodeURIComponent(tagLine);

  const profileData = await getValorantProfile(decodedName, decodedTag);
  if (profileData.error) return null;

  const { playerStats, weaponDict } = profileData;
  const { summary } = playerStats;
  const { allWeapons } = summary;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="font-bold text-xl text-white mb-4">Weapon Performance</h2>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[600px]">
             <div className="grid grid-cols-12 px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                <div className="col-span-4">Weapon</div>
                <div className="col-span-2 text-center">Kills</div>
                <div className="col-span-2 text-center">Headshots %</div>
                <div className="col-span-2 text-center">Bodyshots %</div>
                <div className="col-span-2 text-center">Legshots %</div>
             </div>
             
             <div className="divide-y divide-zinc-800">
                {allWeapons.filter(w => w.kills > 0 || w.damage > 0).map((wStat, idx) => {
                  const weapon = weaponDict[wStat.weaponId?.toLowerCase()];
                  const name = weapon?.displayName || 'Unknown Weapon';
                  const icon = weapon?.displayIcon || null;

                  return (
                    <div key={idx} className="grid grid-cols-12 px-4 py-4 items-center hover:bg-zinc-800/30 transition-colors">
                       <div className="col-span-4 flex items-center gap-4">
                         {icon ? (
                           <div className="w-20 h-10 flex items-center justify-center p-1 bg-zinc-800 border border-zinc-700 rounded">
                             <img src={icon} alt={name} className="max-w-full max-h-full object-contain" />
                           </div>
                         ) : (
                           <div className="w-20 h-10 rounded bg-zinc-800 border border-zinc-700" />
                         )}
                         <p className="text-sm font-bold text-white capitalize">{name}</p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className="text-sm font-bold text-zinc-300">{wStat.kills}</p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className={`text-sm font-bold ${wStat.headshots >= 20 ? 'text-green-400' : 'text-zinc-300'}`}>
                             {wStat.headshots}%
                          </p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className="text-sm font-bold text-zinc-300">
                             {wStat.bodyshots}%
                          </p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className="text-sm font-bold text-zinc-500">
                             {wStat.legshots}%
                          </p>
                       </div>
                    </div>
                  );
                })}
                
                {allWeapons.length === 0 && (
                   <div className="p-8 text-center text-zinc-500 font-medium">
                      Not enough weapon data available for this set of matches.
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
