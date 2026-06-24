import { getBGMIPlayers } from "@/lib/esportsamaze";
import { Target, Shield, Crosshair } from "lucide-react";

export const metadata = {
  title: "BGMI Players & Leaderboard | KhelPediA",
  description: "Explore profiles and statistics of the top Battlegrounds Mobile India players.",
};

export default async function BGMIPlayersPage() {
  const players = await getBGMIPlayers(60);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wide text-[var(--text-primary)] flex items-center justify-center md:justify-start gap-4">
          <Target className="w-10 h-10 text-[#F1B11D]" /> BGMI Players
        </h1>
        <p className="text-[var(--text-secondary)] mt-3 text-lg max-w-2xl mx-auto md:mx-0">
          The most mechanically gifted and tactically brilliant players in the BGMI competitive scene.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {players.map((player, idx) => (
          <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#F1B11D]/50 transition-all rounded-xl p-4 flex items-center gap-4 group">
            
            <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-lg border border-zinc-700 overflow-hidden flex-shrink-0 relative">
              {player.image ? (
                <img 
                  src={`https://esportsamaze.in/Special:FilePath/${player.image.replace(' ', '_')}`} 
                  alt={player.id} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <Crosshair className="w-6 h-6" />
                </div>
              )}
              {/* Optional rank number overlay */}
              <div className="absolute top-0 left-0 bg-[#F1B11D] text-black text-[10px] font-black px-1.5 py-0.5 rounded-br-lg">
                #{idx + 1}
              </div>
            </div>

            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[#F1B11D] transition-colors truncate">
                {player.id}
              </h3>
              
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">
                  {player.current_team || "Free Agent"}
                </span>
              </div>
              
              {player.role && (
                <div className="mt-2 flex">
                  <span className="px-2 py-0.5 bg-[var(--border-color)] rounded-md text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {player.role}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {players.length === 0 && (
        <div className="py-20 text-center text-[var(--text-muted)] border border-[var(--border-color)] border-dashed rounded-xl">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No player data available at the moment.</p>
        </div>
      )}
    </div>
  );
}
