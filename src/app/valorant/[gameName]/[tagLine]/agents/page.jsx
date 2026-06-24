import { getValorantProfile } from '@/app/actions/valorant';

export const metadata = {
  title: 'Agents - Valorant Profile Tracker',
};

export default async function AgentsTab({ params }) {
  const { gameName, tagLine } = await params;
  const decodedName = decodeURIComponent(gameName);
  const decodedTag = decodeURIComponent(tagLine);

  const profileData = await getValorantProfile(decodedName, decodedTag);
  if (profileData.error) return null;

  const { playerStats, agentDict } = profileData;
  const { summary } = playerStats;
  const { allAgents } = summary;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="font-bold text-xl text-[var(--text-primary)] mb-4">Agent Performance</h2>
      
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[600px]">
             <div className="grid grid-cols-12 px-4 py-3 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)] text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                <div className="col-span-5">Agent</div>
                <div className="col-span-2 text-center">Matches</div>
                <div className="col-span-2 text-center">Win %</div>
                <div className="col-span-2 text-center">K/D Ratio</div>
                <div className="col-span-1 text-center">ACS</div>
             </div>
             
             <div className="divide-y divide-[var(--border-color)]">
                {allAgents.map((agentStat, idx) => {
                  const agent = agentDict[agentStat.characterId?.toLowerCase()];
                  const name = agent?.displayName || agentStat.characterId;

                  return (
                    <div key={idx} className="grid grid-cols-12 px-4 py-4 items-center hover:bg-[var(--bg-card-hover)] transition-colors">
                       <div className="col-span-5 flex items-center gap-4">
                         {agent?.displayIcon ? (
                           <img src={agent.displayIcon} alt={name} className="w-10 h-10 rounded bg-[var(--bg-card)] border border-[var(--border-color)]" />
                         ) : (
                           <div className="w-10 h-10 rounded bg-[var(--bg-card)] border border-[var(--border-color)]" />
                         )}
                         <p className="text-sm font-bold text-[var(--text-primary)] capitalize">{name}</p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className="text-sm font-bold text-[var(--text-secondary)]">{agentStat.matches}</p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className={`text-sm font-bold ${agentStat.winRate >= 50 ? 'text-green-400' : 'text-[var(--text-secondary)]'}`}>
                             {agentStat.winRate}%
                          </p>
                       </div>
                       
                       <div className="col-span-2 text-center">
                          <p className={`text-sm font-bold ${agentStat.kdRatio >= 1 ? 'text-green-400' : 'text-[var(--text-secondary)]'}`}>
                             {agentStat.kdRatio}
                          </p>
                       </div>
                       
                       <div className="col-span-1 text-center">
                          <p className="text-sm font-bold text-[var(--text-primary)]">{agentStat.acs}</p>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
