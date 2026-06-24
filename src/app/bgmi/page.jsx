import { getBGMITournaments, getBGMITeams, getBGMIPlayers } from "@/lib/esportsamaze";
import Link from "next/link";
import { ChevronRight, Trophy, Users, Crosshair } from "lucide-react";

export const metadata = {
  title: "BGMI Esports | KhelPediA",
  description: "Track live BGMI tournaments, recent match results, upcoming schedules, roster transfers, and player stats.",
};

export default async function BGMIPage() {
  const [tournaments, teams, players] = await Promise.all([
    getBGMITournaments(10),
    getBGMITeams(8),
    getBGMIPlayers(8)
  ]);

  const totalTournaments = tournaments.length;
  const sTierCount = tournaments.filter(t => t.tier === "S-Tier").length;
  // Handle parsing prize_pool which might be a string like "20000000"
  const totalPrizePool = tournaments.reduce((acc, curr) => {
    const val = parseInt(curr.prize_pool?.replace(/,/g, '') || "0", 10);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <>
      {/* Hero Banner Section */}
      <div 
        className="relative border-b border-[#F1B11D]/20 overflow-hidden pt-20 pb-16"
        style={{ background: "linear-gradient(180deg, rgba(241, 177, 29, 0.08) 0%, var(--bg-primary) 100%)" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(241,177,29,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,177,29,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-50" />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-[#F1B11D]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              {/* Game Icon */}
              <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-[var(--bg-secondary)] border overflow-hidden shadow-[0_0_30px_rgba(241,177,29,0.2)] relative group border-[#F1B11D]/50 p-2">
                <img
                  src="/bgmi-logo.png"
                  alt="BGMI"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 opacity-90"
                />
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[var(--text-primary)] uppercase leading-none drop-shadow-lg">
                  BGMI <span className="text-[#F1B11D]">Esports</span>
                </h1>
                <div className="flex items-center gap-3 mt-4">
                  <span className="px-3 py-1 bg-[#F1B11D]/10 border border-[#F1B11D]/30 text-[#F1B11D] font-bold text-xs uppercase tracking-widest backdrop-blur-sm">
                    Battle Royale
                  </span>
                  <span className="text-[var(--text-secondary)] text-sm font-medium">
                    Competitive Coverage
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Hero statistics bar */}
            <div className="grid grid-cols-3 gap-6 bg-[var(--bg-card)] border border-[#F1B11D]/20 px-6 py-5 min-w-[280px] md:min-w-[420px] self-start md:self-center shadow-2xl backdrop-blur-md rounded-xl">
              <div className="text-left border-r border-[#F1B11D]/10 pr-4">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest block">
                  Tournaments
                </span>
                <span className="text-xl md:text-3xl font-black text-[var(--text-primary)] mt-1 block">
                  {totalTournaments}+
                </span>
              </div>
              <div className="text-left border-r border-[#F1B11D]/10 px-2">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest block">
                  S-Tier Events
                </span>
                <span className="text-xl md:text-3xl font-black text-[#F1B11D] mt-1 block">
                  {sTierCount}
                </span>
              </div>
              <div className="text-left pl-2">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest block">
                  Total Prize
                </span>
                <span className="text-xl md:text-3xl font-black text-green-400 mt-1 block truncate">
                  ₹{(totalPrizePool / 10000000).toFixed(1)}Cr
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Tournaments */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-[var(--border-color)] pb-2">
              <h2 className="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#F1B11D]" /> Recent & Upcoming Tournaments
              </h2>
              <Link href="/bgmi/tournaments" className="text-sm text-[#F1B11D] hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid gap-4">
              {tournaments.length > 0 ? tournaments.slice(0, 5).map((t, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#F1B11D]/50 transition-colors rounded-lg group">
                  <div className="w-16 h-16 bg-[var(--bg-secondary)] flex-shrink-0 flex items-center justify-center p-2 rounded-md border border-[var(--border-color)]">
                    {t.image ? (
                      <img src={`https://esportsamaze.in/Special:FilePath/${t.image.replace(' ', '_')}`} alt={t.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Trophy className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg group-hover:text-[#F1B11D] transition-colors">{t.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mt-1">
                      <span className="px-2 py-0.5 bg-[var(--border-color)] rounded text-xs font-semibold">{t.tier || "Unknown Tier"}</span>
                      <span>{t.start_date} - {t.end_date}</span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-green-400 font-bold">₹{parseInt(t.prize_pool || "0", 10).toLocaleString('en-IN')}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">{t.winner ? `🏆 ${t.winner}` : 'Upcoming/Live'}</div>
                  </div>
                </div>
              )) : (
                <div className="text-[var(--text-muted)] py-10 text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg">No tournaments found</div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Teams and Players sidebar */}
        <div className="space-y-12">
          {/* Top Teams */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-[var(--border-color)] pb-2">
              <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                <Users className="w-5 h-5 text-[#F1B11D]" /> Top Teams
              </h2>
              <Link href="/bgmi/teams" className="text-sm text-[#F1B11D] hover:underline flex items-center">
                All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {teams.length > 0 ? teams.map((team, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-lg flex flex-col items-center justify-center text-center hover:border-[#F1B11D]/50 transition-colors group">
                  <div className="w-12 h-12 mb-3">
                    {team.image ? (
                       <img src={`https://esportsamaze.in/Special:FilePath/${team.image.replace(' ', '_')}`} alt={team.name} className="w-full h-full object-contain" />
                    ) : (
                       <Users className="w-full h-full p-2 text-zinc-700" />
                    )}
                  </div>
                  <span className="text-sm font-bold group-hover:text-[#F1B11D] transition-colors">{team.name}</span>
                </div>
              )) : (
                <div className="col-span-2 text-[var(--text-muted)] py-6 text-center text-sm border border-[var(--border-color)] rounded-lg">No teams found</div>
              )}
            </div>
          </section>

          {/* Featured Players */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b border-[var(--border-color)] pb-2">
              <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-[#F1B11D]" /> Featured Players
              </h2>
              <Link href="/bgmi/players" className="text-sm text-[#F1B11D] hover:underline flex items-center">
                All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {players.length > 0 ? players.map((player, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border-color)] p-2 rounded-lg hover:border-[#F1B11D]/50 transition-colors group">
                   <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded overflow-hidden flex-shrink-0">
                      {player.image ? (
                        <img src={`https://esportsamaze.in/Special:FilePath/${player.image.replace(' ', '_')}`} alt={player.id} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[var(--border-color)]" />
                      )}
                   </div>
                   <div className="flex-grow">
                      <div className="font-bold text-sm group-hover:text-[#F1B11D] transition-colors">{player.id}</div>
                      <div className="text-xs text-[var(--text-muted)]">{player.current_team || "Free Agent"}</div>
                   </div>
                   {player.role && (
                     <div className="text-xs px-2 py-1 bg-[var(--border-color)] rounded text-[var(--text-secondary)] font-medium">
                       {player.role}
                     </div>
                   )}
                </div>
              )) : (
                <div className="text-[var(--text-muted)] py-6 text-center text-sm border border-[var(--border-color)] rounded-lg">No players found</div>
              )}
            </div>
          </section>
        </div>

      </main>
    </>
  );
}
