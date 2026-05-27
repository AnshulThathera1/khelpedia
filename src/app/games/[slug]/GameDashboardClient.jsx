"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, Calendar, Search, ArrowRight, Shuffle, 
  Clock, Gamepad2, ExternalLink, UserPlus, UserMinus, 
  Map, Award, Flame, Users, Swords, AlertCircle
} from "lucide-react";
import TournamentCard from "../../components/TournamentCard";

// Mock transfers to populate the feed with extremely recognizable and realistic data
const MOCK_VALORANT_TRANSFERS = [
  {
    date: "2026-05-12",
    player: { name: "Tyson Ngo", ign: "TenZ", slug: "tenz" },
    oldTeam: { name: "Sentinels", logo: "https://owcdn.net/img/5f2c8af9ba4bd.png" },
    newTeam: { name: "Retired / Content Creator", logo: null },
    role: "Flex",
    direction: "out"
  },
  {
    date: "2026-05-04",
    player: { name: "Erick Santos", ign: "aspas", slug: "aspas" },
    oldTeam: { name: "LOUD", logo: "https://owcdn.net/img/62f3d2a8c04b3.png" },
    newTeam: { name: "Leviatán", logo: "https://owcdn.net/img/640a47f8c2c50.png" },
    role: "Duelist",
    direction: "in"
  },
  {
    date: "2026-04-28",
    player: { name: "Nikita Grishin", ign: "d3ffo", slug: "d3ffo" },
    oldTeam: { name: "Fnatic", logo: "https://owcdn.net/img/5f2c8af9c43f7.png" },
    newTeam: { name: "Team Liquid", logo: "https://owcdn.net/img/5f2c8afa3e8db.png" },
    role: "Duelist",
    direction: "in"
  },
  {
    date: "2026-04-15",
    player: { name: "Ganesh Gangadhar", ign: "SkRossi", slug: "skrossi" },
    oldTeam: { name: "Global Esports", logo: "https://owcdn.net/img/62fd1b8d3e56c.png" },
    newTeam: { name: "Free Agent", logo: null },
    role: "Duelist",
    direction: "out"
  },
  {
    date: "2026-03-20",
    player: { name: "Jaccob Slavik", ign: "yay", slug: "yay" },
    oldTeam: { name: "Cloud9", logo: "https://owcdn.net/img/5f2c8af956ce3.png" },
    newTeam: { name: "BLEED Esports", logo: "https://owcdn.net/img/62f3d2a8e9bef.png" },
    role: "Chamber / Duelist",
    direction: "in"
  }
];

// Rich, high-fidelity mock scheduled matches to keep the Match Center always packed with premium details
const MOCK_UPCOMING_MATCHES = [
  {
    id: "upcoming-1",
    tournament: { name: "VCT Champions 2026", slug: "vct-champions-2026", tier: "S" },
    team1: { name: "Sentinels", logo_url: "https://owcdn.net/img/5f2c8af9ba4bd.png" },
    team2: { name: "LOUD", logo_url: "https://owcdn.net/img/62f3d2a8c04b3.png" },
    played_at: new Date(Date.now() + 24 * 60 * 60 * 1000 * 1.5).toISOString(), // ~1.5 days from now
    round: "Upper Bracket Semifinals",
    format: "BO3"
  },
  {
    id: "upcoming-2",
    tournament: { name: "VCT Champions 2026", slug: "vct-champions-2026", tier: "S" },
    team1: { name: "Fnatic", logo_url: "https://owcdn.net/img/5f2c8af9c43f7.png" },
    team2: { name: "Paper Rex", logo_url: "https://owcdn.net/img/62f3d2a91ef57.png" },
    played_at: new Date(Date.now() + 24 * 60 * 60 * 1000 * 2.8).toISOString(), // ~2.8 days from now
    round: "Upper Bracket Semifinals",
    format: "BO3"
  },
  {
    id: "upcoming-3",
    tournament: { name: "VCT APAC League 2026", slug: "vct-apac-2026", tier: "A" },
    team1: { name: "DRX", logo_url: "https://owcdn.net/img/62f3d2a9012e0.png" },
    team2: { name: "Global Esports", logo_url: "https://owcdn.net/img/62fd1b8d3e56c.png" },
    played_at: new Date(Date.now() + 24 * 60 * 60 * 1000 * 4.2).toISOString(), // ~4.2 days from now
    round: "Group Stage",
    format: "BO3"
  }
];

export default function GameDashboardClient({ game, initialTournaments, initialMatches }) {
  const router = useRouter();
  const [riotId, setRiotId] = useState("");
  const [searchError, setSearchError] = useState("");
  const [matchTab, setMatchTab] = useState("results"); // 'results' or 'upcoming'
  const [tierFilter, setTierFilter] = useState("ALL"); // 'ALL', 'S', 'A', 'B', 'C'

  // Standardize matches from database and merge with mock results/schedules
  const dbCompletedMatches = initialMatches.map(m => ({
    id: m.id,
    tournament: m.tournament || { name: "Valorant Tournament", slug: "valorant-tournament", tier: "A" },
    team1: m.team1 || { name: "TBD" },
    team2: m.team2 || { name: "TBD" },
    score1: m.score1 ?? 0,
    score2: m.score2 ?? 0,
    winner_id: m.winner_id,
    played_at: m.played_at,
    round: m.round || "Playoffs",
    format: m.map ? "Map: " + m.map : "BO3"
  }));

  const matchesToShow = matchTab === "results" 
    ? dbCompletedMatches 
    : MOCK_UPCOMING_MATCHES;

  // Handler for player stats lookup redirect
  const handlePlayerSearch = (e) => {
    e.preventDefault();
    setSearchError("");

    if (!riotId) {
      setSearchError("Riot ID required");
      return;
    }

    if (!riotId.includes("#")) {
      setSearchError("Include tagline (e.g. Player#NA1)");
      return;
    }

    const [gameName, tagLine] = riotId.split("#");
    if (!gameName.trim() || !tagLine.trim()) {
      setSearchError("Use Player#Tag format");
      return;
    }

    router.push(`/valorant/${encodeURIComponent(gameName.trim())}/${encodeURIComponent(tagLine.trim())}`);
  };

  // Group tournaments for left column (Live, Upcoming, Completed)
  const filteredTournaments = tierFilter === "ALL" 
    ? initialTournaments 
    : initialTournaments.filter(t => t.tier === tierFilter);

  const liveTournaments = filteredTournaments.filter(t => t.status === "live");
  const upcomingTournaments = filteredTournaments.filter(t => t.status === "upcoming");
  const completedTournaments = filteredTournaments.filter(t => t.status === "completed");

  const getTierColor = (tier) => {
    switch (tier) {
      case "S": return { bg: "rgba(255, 180, 0, 0.15)", text: "#ffb400", border: "rgba(255, 180, 0, 0.3)" };
      case "A": return { bg: "rgba(0, 189, 165, 0.15)", text: "#00bda5", border: "rgba(0, 189, 165, 0.3)" };
      case "B": return { bg: "rgba(123, 70, 255, 0.15)", text: "#7b46ff", border: "rgba(123, 70, 255, 0.3)" };
      default: return { bg: "rgba(236, 232, 225, 0.1)", text: "#aab0b3", border: "rgba(236, 232, 225, 0.15)" };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatCountdown = (dateStr) => {
    const diff = new Date(dateStr) - Date.now();
    if (diff < 0) return "Started";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `in ${days}d`;
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `in ${hours}h`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* ================= LEFT COLUMN: Tournaments, Search, Transfers (65% width) ================= */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Riot Player Stats Search Card (Only for Valorant) */}
        {game.slug === "valorant" && (
          <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 rounded-none shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-[50px] pointer-events-none rounded-full" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display uppercase tracking-wider text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  VALORANT PLAYER STATS TRACKER
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Lookup any player profile (e.g. TenZ#SEN) to track detailed stats, KD ratio, and match records.
                </p>
              </div>
              
              <form onSubmit={handlePlayerSearch} className="flex-shrink-0 w-full sm:w-80 relative">
                <div className="relative flex items-center bg-black border border-zinc-800 focus-within:border-red-500 transition-colors p-1">
                  <input
                    type="text"
                    placeholder="PlayerName#TAG"
                    value={riotId}
                    onChange={(e) => setRiotId(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-zinc-600 text-sm px-3 py-2.5 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider transition-colors flex items-center gap-1 active:scale-95"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Track
                  </button>
                </div>
                {searchError && (
                  <span className="absolute left-1 -bottom-5 text-red-400 text-xs font-semibold animate-pulse">
                    {searchError}
                  </span>
                )}
              </form>
            </div>
          </div>
        )}

        {/* ========= VALORANT PORTAL NAVIGATION GRID ========= */}
        {game.slug === "valorant" && (
          <div>
            <h2 className="text-base font-bold font-display uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Map className="w-4 h-4 text-red-500" />
              EXPLORE PORTALS
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {[
                { label: "Teams", href: "/games/valorant/teams", icon: "👥", color: "rgba(255,70,85,0.12)" },
                { label: "Transfers", href: "/games/valorant/transfers", icon: "🔄", color: "rgba(59,130,246,0.12)" },
                { label: "Tournaments", href: "/games/valorant/tournaments", icon: "🏆", color: "rgba(255,180,0,0.12)" },
                { label: "Agents", href: "/games/valorant/agents", icon: "🎭", color: "rgba(168,85,247,0.12)" },
                { label: "Players", href: "/games/valorant/players", icon: "⚔️", color: "rgba(0,189,165,0.12)" },
                { label: "Statistics", href: "/games/valorant/statistics", icon: "📊", color: "rgba(249,115,22,0.12)" },
                { label: "Maps", href: "/games/valorant/maps", icon: "🗺️", color: "rgba(34,197,94,0.12)" },
              ].map(p => (
                <Link key={p.label} href={p.href}
                  className="group flex flex-col items-center justify-center gap-2 p-4 border border-zinc-800/60 hover:border-red-500/40 transition-all text-center"
                  style={{ background: p.color, textDecoration: "none" }}>
                  <span className="text-2xl group-hover:scale-125 transition-transform">{p.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors"
                    style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                    {p.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Tournaments Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-800">
            <h2 className="text-2xl font-black font-display tracking-wider text-white uppercase flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-red-500" />
              Featured Tournaments
            </h2>
            
            {/* Interactive Tier Filter Chips */}
            <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 border border-zinc-800/80">
              {["ALL", "S", "A", "B", "C"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTierFilter(tier)}
                  className={`px-3 py-1 text-xs font-bold font-display uppercase tracking-wider transition-all ${
                    tierFilter === tier 
                      ? "bg-red-500 text-white" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tier === "ALL" ? "All Tiers" : `${tier}-Tier`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Live Events */}
            {liveTournaments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-red-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  🔴 Live Competitions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveTournaments.map(t => (
                    <div key={t.id} className="relative group border border-red-500/20 hover:border-red-500/60 transition-all bg-[#0f1923]">
                      <TournamentCard tournament={t} />
                      <div className="absolute top-3 right-3 bg-red-500/10 border border-red-500/30 text-red-500 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                        Live
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingTournaments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  📅 Scheduled Tournaments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingTournaments.map(t => (
                    <div key={t.id} className="relative group border border-zinc-800 hover:border-cyan-500/30 transition-all bg-[#0f1923]">
                      <TournamentCard tournament={t} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedTournaments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-zinc-500 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  ✅ Recent Champions & Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedTournaments.slice(0, 4).map(t => (
                    <div key={t.id} className="relative group border border-zinc-800 hover:border-zinc-700 transition-all bg-[#0f1923]">
                      <TournamentCard tournament={t} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredTournaments.length === 0 && (
              <div className="text-center py-12 bg-zinc-950/20 border border-zinc-800/50 border-dashed">
                <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500 uppercase tracking-widest font-semibold">No tournaments found for {tierFilter}-Tier</p>
                <button onClick={() => setTierFilter("ALL")} className="mt-2 text-xs font-bold text-red-400 hover:underline">Reset filters</button>
              </div>
            )}
          </div>
        </section>

        {/* Transfers Timeline Widget */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-display uppercase tracking-wider text-white flex items-center gap-2.5 pb-3 border-b border-zinc-800">
            <Shuffle className="w-5 h-5 text-red-500" />
            Roster Transfers & News
          </h2>
          
          <div className="bg-zinc-950/30 border border-zinc-900 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-black/50 border-b border-zinc-800 text-[10px] text-zinc-500 tracking-widest uppercase font-bold font-display">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4 text-right">Departing</th>
                  <th className="py-3 px-2 text-center">Direction</th>
                  <th className="py-3 px-4">Joining</th>
                  <th className="py-3 px-4">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50 text-xs">
                {MOCK_VALORANT_TRANSFERS.map((transfer, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="py-3.5 px-4 text-zinc-500 font-medium whitespace-nowrap">
                      {formatDate(transfer.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      <Link href={`/valorant/${encodeURIComponent(transfer.player.ign)}/000`} className="hover:text-red-500 transition-colors">
                        {transfer.player.ign}
                      </Link>
                      <span className="text-[10px] text-zinc-500 font-normal block">{transfer.player.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {transfer.oldTeam.logo ? (
                        <div className="inline-flex items-center gap-2">
                          <span className="text-zinc-300 font-semibold">{transfer.oldTeam.name}</span>
                          <img src={transfer.oldTeam.logo} alt={transfer.oldTeam.name} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display='none'} />
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">{transfer.oldTeam.name}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center">
                        {transfer.direction === "in" ? (
                          <div className="p-1 rounded-sm bg-green-500/10 border border-green-500/20 text-green-500">
                            <UserPlus className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-sm bg-red-500/10 border border-red-500/20 text-red-500">
                            <UserMinus className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {transfer.newTeam.logo ? (
                        <div className="flex items-center gap-2">
                          <img src={transfer.newTeam.logo} alt={transfer.newTeam.name} className="w-4 h-4 object-contain" onError={(e) => e.target.style.display='none'} />
                          <span className="text-zinc-300 font-semibold">{transfer.newTeam.name}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">{transfer.newTeam.name}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 font-bold text-[9px] uppercase tracking-wide">
                        {transfer.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* ================= RIGHT COLUMN: Matches Center & Sidebar (35% width) ================= */}
      <div className="space-y-8">
        
        {/* Match Center (Dynamic results vs upcoming) */}
        <section className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-none shadow-xl relative">
          <div className="absolute top-0 left-0 w-1 h-8 bg-red-500" />
          
          <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
            <h3 className="font-bold font-display uppercase tracking-wider text-white text-sm flex items-center gap-2">
              <Swords className="w-4 h-4 text-red-500" />
              Match Center
            </h3>
            
            {/* Results vs Upcoming Tabs */}
            <div className="flex bg-black border border-zinc-800 p-0.5">
              <button
                onClick={() => setMatchTab("results")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  matchTab === "results" 
                    ? "bg-red-500 text-white" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Results
              </button>
              <button
                onClick={() => setMatchTab("upcoming")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  matchTab === "upcoming" 
                    ? "bg-red-500 text-white" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Upcoming
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            {matchesToShow.map((match) => {
              const tierInfo = getTierColor(match.tournament.tier);
              const isWinnerT1 = match.winner_id && match.team1.id === match.winner_id;
              const isWinnerT2 = match.winner_id && match.team2.id === match.winner_id;
              
              return (
                <div 
                  key={match.id} 
                  className="bg-black/40 border border-zinc-900/60 p-3 hover:border-zinc-800 transition-all group"
                >
                  {/* Match Header */}
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-950">
                    <span className="truncate max-w-[150px] group-hover:text-zinc-300 transition-colors">
                      {match.tournament.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-600 font-normal">{match.round}</span>
                      <span 
                        className="px-1.5 py-0.2 font-display text-[9px]"
                        style={{ backgroundColor: tierInfo.bg, color: tierInfo.text, border: `1px solid ${tierInfo.border}` }}
                      >
                        {match.tournament.tier}-Tier
                      </span>
                    </div>
                  </div>
                  
                  {/* Teams / Score blocks */}
                  <div className="py-3 flex items-center justify-between gap-4">
                    {/* Team 1 */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {match.team1.logo_url ? (
                        <img src={match.team1.logo_url} alt="" className="w-5 h-5 object-contain" onError={(e) => e.target.style.display='none'} />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold">T</div>
                      )}
                      <span className={`font-semibold text-xs truncate ${isWinnerT1 ? "text-red-400 font-black" : "text-zinc-300"}`}>
                        {match.team1.name}
                      </span>
                    </div>

                    {/* Score / VS separator */}
                    <div className="flex-shrink-0 text-center whitespace-nowrap bg-black border border-zinc-900 px-3 py-1 font-display min-w-[70px]">
                      {matchTab === "results" ? (
                        <div className="text-xs font-black tracking-widest text-white">
                          <span className={isWinnerT1 ? "text-red-500" : ""}>{match.score1}</span>
                          <span className="text-zinc-600 mx-1">-</span>
                          <span className={isWinnerT2 ? "text-red-500" : ""}>{match.score2}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
                          <Clock className="w-2.5 h-2.5 text-zinc-500" />
                          {formatCountdown(match.played_at)}
                        </span>
                      )}
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
                      <span className={`font-semibold text-xs truncate ${isWinnerT2 ? "text-red-400 font-black" : "text-zinc-300"}`}>
                        {match.team2.name}
                      </span>
                      {match.team2.logo_url ? (
                        <img src={match.team2.logo_url} alt="" className="w-5 h-5 object-contain" onError={(e) => e.target.style.display='none'} />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-bold">T</div>
                      )}
                    </div>
                  </div>

                  {/* Match Footer */}
                  <div className="flex items-center justify-between text-[9px] text-zinc-600 font-semibold uppercase tracking-wider pt-2 border-t border-zinc-950">
                    <span className="italic">{match.format}</span>
                    <span>{formatDate(match.played_at)}</span>
                  </div>
                </div>
              );
            })}

            {matchesToShow.length === 0 && (
              <div className="text-center py-8 text-zinc-600 text-xs italic">
                No recent matches loaded.
              </div>
            )}
          </div>
        </section>

        {/* Sidebar Tournaments Tiers list */}
        <section className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-none shadow-xl">
          <h3 className="font-bold font-display uppercase tracking-wider text-white text-sm pb-4 border-b border-zinc-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-red-500" />
            Tournament Tiering List
          </h3>

          <div className="mt-4 space-y-2.5">
            {initialTournaments.slice(0, 10).map((t) => {
              const tierInfo = getTierColor(t.tier);
              return (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between gap-3 p-2 border border-zinc-950 hover:border-zinc-900 bg-black/20 group transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Tier badge indicator */}
                    <div 
                      className="w-7 h-7 flex-shrink-0 flex items-center justify-center font-display font-black text-xs border"
                      style={{ backgroundColor: tierInfo.bg, color: tierInfo.text, borderColor: tierInfo.border }}
                    >
                      {t.tier}
                    </div>

                    <div className="min-w-0">
                      <Link href={`/tournaments?status=${t.status}`} className="font-bold text-xs text-zinc-300 hover:text-white truncate block">
                        {t.name}
                      </Link>
                      <span className="text-[9px] text-zinc-500 font-semibold block uppercase tracking-wider">
                        {t.region} • {t.format}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-zinc-400 font-bold block">
                      {t.prize_pool > 0 ? `$${parseInt(t.prize_pool).toLocaleString()}` : "TBD"}
                    </span>
                    <span className="text-[9px] text-zinc-600 block">
                      {formatDate(t.start_date)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

    </div>
  );
}
