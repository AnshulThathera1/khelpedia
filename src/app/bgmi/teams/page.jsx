import { getBGMITeams } from "@/lib/esportsamaze";
import { Users, ShieldCheck, MapPin } from "lucide-react";

export const metadata = {
  title: "Top BGMI Teams | KhelPediA",
  description: "Browse the top Battlegrounds Mobile India esports teams and organizations.",
};

export default async function BGMITeamsPage() {
  const teams = await getBGMITeams(40);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wide text-[var(--text-primary)] flex items-center justify-center md:justify-start gap-4">
          <Users className="w-10 h-10 text-[#F1B11D]" /> BGMI Teams
        </h1>
        <p className="text-[var(--text-secondary)] mt-3 text-lg max-w-2xl mx-auto md:mx-0">
          The finest organizations competing in Battlegrounds Mobile India. Discover team profiles, regions, and active rosters.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {teams.map((team, idx) => (
          <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#F1B11D]/60 hover:bg-[var(--bg-card)] transition-all rounded-xl p-6 text-center group hover:-translate-y-1 hover:shadow-lg">
            <div className="w-24 h-24 mx-auto mb-4 p-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)] shadow-inner flex items-center justify-center">
              {team.image ? (
                <img 
                  src={`https://esportsamaze.in/Special:FilePath/${team.image.replace(' ', '_')}`} 
                  alt={team.name} 
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                />
              ) : (
                <ShieldCheck className="w-10 h-10 text-zinc-700" />
              )}
            </div>
            
            <h3 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[#F1B11D] transition-colors truncate">
              {team.name}
            </h3>
            
            <div className="mt-2 flex flex-col items-center gap-1 text-xs text-[var(--text-muted)]">
              {team.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {team.country}
                </span>
              )}
              {team.status && (
                <span className={`px-2 py-0.5 rounded-full font-bold ${team.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {team.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {teams.length === 0 && (
        <div className="py-20 text-center text-[var(--text-muted)] border border-[var(--border-color)] border-dashed rounded-xl">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No teams available at the moment.</p>
        </div>
      )}
    </div>
  );
}
