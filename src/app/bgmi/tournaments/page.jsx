import { getBGMITournaments } from "@/lib/esportsamaze";
import { Trophy, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "BGMI Tournaments | KhelPediA",
  description: "Comprehensive list of all major BGMI tournaments and their prize pools.",
};

export default async function BGMITournamentsPage() {
  // Fetch up to 50 tournaments for the full list
  const tournaments = await getBGMITournaments(50);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-3">
          <Trophy className="w-8 h-8 text-[#F1B11D]" /> BGMI Tournaments
        </h1>
        <p className="text-[var(--text-secondary)] mt-2 text-lg">
          Track the biggest events, their prize pools, and champions in Battlegrounds Mobile India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((t, idx) => (
          <Link href={`/bgmi/tournaments/${encodeURIComponent(t.name.replace(/ /g, '_'))}`} key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[#F1B11D]/50 transition-all rounded-xl overflow-hidden group hover:shadow-[0_8px_30px_rgba(241,177,29,0.1)] block">
            <div className="h-32 bg-[var(--bg-secondary)] flex items-center justify-center p-4 border-b border-[var(--border-color)] relative">
               <div className="absolute top-3 right-3 px-2 py-1 bg-[var(--bg-secondary)]/80 backdrop-blur-md rounded border border-zinc-700 text-xs font-bold text-[var(--text-secondary)]">
                 {t.tier || "Tier Unranked"}
               </div>
               {t.image ? (
                 <img src={`https://esportsamaze.in/Special:FilePath/${t.image.replace(' ', '_')}`} alt={t.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" />
               ) : (
                 <Trophy className="w-10 h-10 text-zinc-700" />
               )}
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-lg mb-3 line-clamp-2 min-h-[56px] text-[var(--text-primary)] group-hover:text-[#F1B11D] transition-colors">
                {t.name}
              </h3>
              
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#F1B11D]/80" /> Dates</span>
                  <span className="font-medium text-[var(--text-primary)]">{t.start_date || "TBD"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">💰 Prize Pool</span>
                  <span className="font-bold text-green-400">
                    {t.prize_pool ? `₹${parseInt(t.prize_pool, 10).toLocaleString('en-IN')}` : "TBD"}
                  </span>
                </div>

                {(t.location || t.venue) && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#F1B11D]/80" /> Location</span>
                    <span className="font-medium text-[var(--text-primary)] text-right max-w-[120px] truncate" title={t.location || t.venue}>
                      {t.location || t.venue}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mb-1">Champion</div>
                <div className="text-[var(--text-primary)] font-semibold flex items-center gap-2">
                  {t.winner ? <><Trophy className="w-4 h-4 text-yellow-500" /> {t.winner}</> : "To be decided"}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
