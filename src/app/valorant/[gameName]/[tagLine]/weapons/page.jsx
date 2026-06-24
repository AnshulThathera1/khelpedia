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
      <h2 className="font-bold text-xl text-[var(--text-primary)] mb-4">Weapon Performance</h2>
      
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[600px]">
             <div className="grid grid-cols-12 px-4 py-3 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)] text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                <div className="col-span-4">Weapon</div>
                <div className="col-span-2 text-center">Kills</div>
                <div className="col-span-2 text-center">Headshots %</div>
                <div className="col-span-2 text-center">Bodyshots %</div>
                <div className="col-span-2 text-center">Legshots %</div>
             </div>
             
             <div className="divide-y divide-[var(--border-color)]">
                {allWeapons.filter(w => w.kills > 0 || w.damage > 0).map((wStat, idx) => {
                  const weapon = weaponDict[wStat.weaponId?.toLowerCase()];
                  const name = weapon?.displayName || 'Unknown Weapon';
                  const icon = weapon?.displayIcon || null;

                  return (
                    <div key={idx} className="grid grid-cols-12 px-4 py-4 items-center hover:bg-[var(--bg-card-hover)] transition-colors">
                       <div className="col-span-4 flex items-center gap-4">
                         {icon ? (
                           <div className="w-20 h-10 flex items-center justify-center p-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded">
                             <img src={icon} alt={name} className="max-w-full max-h-full object-contain" />
                           </div>
                         ) : (
                           <div className="w-20 h-10 rounded bg-[var(--bg-card)] border border-[var(--border-color)]" />
                         )}
                         <p className="text-sm font-bold text-[var(--text-primary)] capitalize">{name}</p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className="text-sm font-bold text-[var(--text-secondary)]">{wStat.kills}</p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className={`text-sm font-bold ${wStat.headshots >= 20 ? 'text-green-400' : 'text-[var(--text-secondary)]'}`}>
                             {wStat.headshots}%
                          </p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className="text-sm font-bold text-[var(--text-secondary)]">
                             {wStat.bodyshots}%
                          </p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className="text-sm font-bold text-[var(--text-muted)]">
                             {wStat.legshots}%
                          </p>
                       </div>
                    </div>
                  );
                })}
                
                {allWeapons.length === 0 && (
                   <div className="p-8 text-center text-[var(--text-muted)] font-medium">
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
