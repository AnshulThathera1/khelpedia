import { getTeams, getPlayers, getTournaments, getGameBySlug } from "@/lib/queries";
import { AGENTS, MAPS } from "@/lib/valorantData";
import { Users, Trophy, Swords, Map, Shield, BarChart3, DollarSign } from "lucide-react";

export const metadata = { title: "Valorant Statistics Portal | KhelPediA" };

export default async function StatisticsPortalPage() {
  const game = await getGameBySlug("valorant");
  const [teams, players, tournaments] = await Promise.all([
    getTeams(),
    getPlayers(),
    game ? getTournaments({ gameId: game.id }) : [],
  ]);

  const totalPrizePool = tournaments.reduce((sum, t) => sum + Number(t.prize_pool || 0), 0);
  const activeMaps = MAPS.filter(m => m.active && m.type === "Standard").length;

  const statCards = [
    { label: "Teams", value: teams.length, icon: Users, color: "#ff4655" },
    { label: "Players", value: players.length, icon: Swords, color: "#60a5fa" },
    { label: "Tournaments", value: tournaments.length, icon: Trophy, color: "#facc15" },
    { label: "Total Prize Pool", value: `$${totalPrizePool.toLocaleString()}`, icon: DollarSign, color: "#4ade80" },
    { label: "Agents", value: AGENTS.length, icon: Shield, color: "#c084fc" },
    { label: "Active Maps", value: activeMaps, icon: Map, color: "#fb923c" },
  ];

  // Role distribution
  const roleDist = {};
  AGENTS.forEach(a => { roleDist[a.role] = (roleDist[a.role] || 0) + 1; });

  // Tournament by status
  const statusDist = {};
  tournaments.forEach(t => { statusDist[t.status || "unknown"] = (statusDist[t.status || "unknown"] || 0) + 1; });

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
        Statistics <span className="text-zinc-600 font-normal text-xl">— Overview</span>
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Aggregated statistics for the Valorant competitive ecosystem.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="border border-zinc-800/60 bg-zinc-900/30 p-4 text-center hover:border-zinc-700 transition-all">
            <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
            <div className="text-2xl font-black text-white" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
              {value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Agent Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="border border-zinc-800/60 bg-zinc-900/30 p-6">
          <h2 className="text-base font-black uppercase tracking-wide text-white mb-4" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            <span className="text-red-500">▎</span> Agent Role Distribution
          </h2>
          <div className="space-y-3">
            {Object.entries(roleDist).map(([role, count]) => {
              const pct = Math.round((count / AGENTS.length) * 100);
              const colors = {
                Controller: "#60a5fa", Duelist: "#f87171",
                Initiator: "#facc15", Sentinel: "#4ade80"
              };
              return (
                <div key={role}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-zinc-300 uppercase" style={{ fontFamily: '"Rajdhani", sans-serif' }}>{role}</span>
                    <span className="text-zinc-500">{count} agents ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-800/50 overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${pct}%`, background: colors[role] || "#ff4655" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tournament Status */}
        <div className="border border-zinc-800/60 bg-zinc-900/30 p-6">
          <h2 className="text-base font-black uppercase tracking-wide text-white mb-4" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            <span className="text-red-500">▎</span> Tournament Status Breakdown
          </h2>
          {Object.entries(statusDist).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(statusDist).map(([status, count]) => {
                const pct = Math.round((count / tournaments.length) * 100);
                const colors = { live: "#f87171", upcoming: "#60a5fa", completed: "#9ca3af" };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-zinc-300 uppercase" style={{ fontFamily: '"Rajdhani", sans-serif' }}>{status}</span>
                      <span className="text-zinc-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-zinc-800/50 overflow-hidden">
                      <div className="h-full" style={{ width: `${pct}%`, background: colors[status] || "#9ca3af" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-zinc-600 text-sm">No tournament data available.</p>
          )}
        </div>
      </div>

      {/* Top Players Table */}
      <div className="border border-zinc-800/60 bg-zinc-900/30 p-6 mb-10">
        <h2 className="text-base font-black uppercase tracking-wide text-white mb-4" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
          <span className="text-red-500">▎</span> Registered Players
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/50" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                <th className="text-left py-2 pr-4">#</th>
                <th className="text-left py-2 pr-4">IGN</th>
                <th className="text-left py-2 pr-4">Name</th>
                <th className="text-left py-2 pr-4">Team</th>
                <th className="text-left py-2">Country</th>
              </tr>
            </thead>
            <tbody>
              {players.slice(0, 15).map((p, i) => (
                <tr key={p.id} className="border-b border-zinc-800/30 hover:bg-white/[0.02]">
                  <td className="py-2 pr-4 text-zinc-600 font-mono text-xs">{i + 1}</td>
                  <td className="py-2 pr-4 font-black text-white uppercase" style={{ fontFamily: '"Rajdhani", sans-serif' }}>{p.ign}</td>
                  <td className="py-2 pr-4 text-zinc-400 text-xs">{p.name || "—"}</td>
                  <td className="py-2 pr-4 text-zinc-400 text-xs">{p.teams?.name || "—"}</td>
                  <td className="py-2 text-zinc-500 text-xs">{p.country || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {players.length === 0 && (
            <p className="text-center py-8 text-zinc-600 text-sm">No players in database yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
