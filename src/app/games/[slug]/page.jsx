import { getGameBySlug, getTournaments, getMatchesByGame } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trophy, Calendar, Coins, Gamepad2, Users, Swords } from "lucide-react";
import GameDashboardClient from "./GameDashboardClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: "Game Not Found | KhelPediA" };
  return { 
    title: `${game.name} Esports, Live Matches & Stats | KhelPediA`, 
    description: `Track live ${game.name} tournaments, recent match results, upcoming schedules, roster transfers, and player stats.` 
  };
}

export default async function GameDetailPage({ params }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  // Parallel data fetching on the server for speed and SEO optimization
  const [tournaments, matches] = await Promise.all([
    getTournaments({ gameId: game.id }),
    getMatchesByGame(game.id, 20)
  ]);

  // Aggregate stats for the hero stats bar
  const totalTournaments = tournaments.length;
  const sTierTournaments = tournaments.filter(t => t.tier === "S").length;
  const totalPrizePool = tournaments.reduce((acc, curr) => acc + Number(curr.prize_pool || 0), 0);

  // Bespoke background themes depending on the game
  const isValorant = slug === "valorant";
  const isCS2 = slug === "cs2";
  
  let heroBgGradient = "linear-gradient(180deg, rgba(23, 35, 45, 0.4) 0%, rgba(15, 25, 35, 0.95) 100%)";
  let themeAccentClass = "border-zinc-800";
  let accentColor = "var(--accent-red)";
  
  if (isValorant) {
    heroBgGradient = "linear-gradient(180deg, rgba(255, 70, 85, 0.08) 0%, rgba(15, 25, 35, 0.98) 100%)";
    themeAccentClass = "border-red-500/20";
    accentColor = "#ff4655";
  } else if (isCS2) {
    heroBgGradient = "linear-gradient(180deg, rgba(255, 180, 0, 0.05) 0%, rgba(15, 25, 35, 0.98) 100%)";
    themeAccentClass = "border-amber-500/20";
    accentColor = "#ffb400";
  }

  return (
    <div className="min-h-screen bg-[#0f1923] text-[#ece8e1] selection:bg-red-500/30 pb-20">
      
      {/* Hero Banner Section */}
      <div 
        className="relative border-b border-zinc-800/80 overflow-hidden pt-28 pb-16"
        style={{ background: heroBgGradient }}
      >
        {/* Subtle grid scanning effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Breadcrumb */}
          <Link 
            href="/games" 
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-xs font-bold font-display uppercase tracking-widest mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Games
          </Link>

          {/* Game identity rows */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              
              {/* Game Icon */}
              <div 
                className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-zinc-950 border overflow-hidden shadow-2xl relative group"
                style={{ borderColor: accentColor }}
              >
                {game.icon_url ? (
                  <img
                    src={game.icon_url}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white uppercase leading-none">
                    {game.name} <span className="text-zinc-600 font-normal">Esports</span>
                  </h1>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold font-display text-[10px] uppercase tracking-wider">
                    {game.genre}
                  </span>
                  <span className="text-zinc-500 text-xs font-medium">
                    Premier destination for competitive coverage
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Hero statistics bar */}
            <div className="grid grid-cols-3 gap-6 bg-black/40 border border-zinc-900 px-6 py-4 min-w-[280px] md:min-w-[420px] self-start md:self-center shadow-xl">
              
              <div className="text-left border-r border-zinc-900/80 pr-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-display">
                  Tournaments
                </span>
                <span className="text-lg md:text-2xl font-black text-white font-display mt-0.5 block">
                  {totalTournaments}
                </span>
              </div>

              <div className="text-left border-r border-zinc-900/80 px-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-display">
                  S-Tier Events
                </span>
                <span className="text-lg md:text-2xl font-black text-red-500 font-display mt-0.5 block">
                  {sTierTournaments}
                </span>
              </div>

              <div className="text-left pl-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-display">
                  Total prize
                </span>
                <span className="text-lg md:text-2xl font-black text-green-400 font-display mt-0.5 block truncate">
                  {totalPrizePool > 0 ? `$${(totalPrizePool / 1000).toFixed(0)}k` : "TBD"}
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        <GameDashboardClient 
          game={game} 
          initialTournaments={tournaments} 
          initialMatches={matches} 
        />
      </main>

    </div>
  );
}
