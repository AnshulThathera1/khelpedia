import { getTeams } from "@/lib/queries";
import Link from "next/link";

export const metadata = { title: "Valorant Teams Portal | KhelPediA" };

export default async function TeamsPortalPage() {
  const allTeams = await getTeams();

  const regionGroups = {};
  allTeams.forEach(t => {
    const r = t.region || "Other";
    if (!regionGroups[r]) regionGroups[r] = [];
    regionGroups[r].push(t);
  });

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
        Teams <span className="text-zinc-600 font-normal text-xl">— {allTeams.length} Organizations</span>
      </h1>
      <p className="text-zinc-500 text-sm mb-8">All notable active Valorant esports teams grouped by region.</p>

      {/* Top Earnings */}
      <div className="mb-10">
        <h2 className="text-lg font-black uppercase tracking-wide text-white mb-4" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
          <span className="text-red-500">▎</span> All Teams
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allTeams.map(team => (
            <Link key={team.id} href={`/teams/${team.id}`}
              className="group border border-zinc-800/60 bg-zinc-900/30 p-4 hover:border-red-500/30 hover:bg-red-500/5 transition-all block no-underline">
              <div className="w-16 h-16 mx-auto mb-3 bg-black/30 border border-zinc-800/50 p-2 group-hover:border-red-500/30 transition-colors">
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-zinc-800/50 flex items-center justify-center text-zinc-600 text-xs font-bold">
                    {team.name?.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-black uppercase text-center text-white truncate" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                {team.name}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">{team.region}</span>
                {team.country && <span className="text-[10px] text-zinc-600">• {team.country}</span>}
              </div>
              {team.founded_year && (
                <p className="text-center text-[10px] text-zinc-600 mt-1">Est. {team.founded_year}</p>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* By Region */}
      {Object.entries(regionGroups).map(([region, teams]) => (
        <div key={region} className="mb-8">
          <h2 className="text-base font-black uppercase tracking-wide text-zinc-400 mb-3 border-b border-zinc-800/50 pb-2"
            style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            {region} <span className="text-zinc-600 font-normal text-sm">({teams.length})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {teams.map(t => (
              <Link key={t.id} href={`/teams/${t.id}`}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-900/40 border border-zinc-800/40 hover:border-red-500/30 transition-all no-underline">
                {t.logo_url && <img src={t.logo_url} alt="" className="w-5 h-5 object-contain" />}
                <span className="text-xs font-bold text-zinc-300 uppercase" style={{ fontFamily: '"Rajdhani", sans-serif' }}>{t.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
