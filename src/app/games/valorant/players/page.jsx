import { getPlayers } from "@/lib/queries";
import Link from "next/link";
import { Search, User, Trophy } from "lucide-react";

export const metadata = { title: "Valorant Players Portal | KhelPediA" };

export default async function PlayersPortalPage() {
  const allPlayers = await getPlayers();

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
        Players <span className="text-zinc-600 font-normal text-xl">— {allPlayers.length} Registered</span>
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Notable Valorant professional players from across all competitive regions.</p>

      {/* Players Table */}
      <div className="border border-zinc-800/60 overflow-x-auto">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/60 text-[10px] font-bold uppercase tracking-wider text-zinc-500 min-w-[600px]"
          style={{ fontFamily: '"Rajdhani", sans-serif' }}>
          <div className="col-span-1">#</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-3">Real Name</div>
          <div className="col-span-3">Team</div>
          <div className="col-span-2">Country</div>
        </div>

        {/* Rows */}
        {allPlayers.map((player, idx) => (
          <Link key={player.id} href={`/players/${player.slug || player.id}`}
            className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-zinc-800/30 hover:bg-white/[0.02] transition-colors items-center min-w-[600px] no-underline"
            style={{ textDecoration: "none" }}>
            <div className="col-span-1 text-xs text-zinc-600 font-mono">{idx + 1}</div>
            <div className="col-span-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-black/30 border border-zinc-800/50 flex-shrink-0 overflow-hidden">
                {player.image_url ? (
                  <img src={player.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-4 h-4 text-zinc-700" />
                  </div>
                )}
              </div>
              <span className="text-sm font-black uppercase text-white" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                {player.ign}
              </span>
            </div>
            <div className="col-span-3 text-xs text-zinc-400">{player.name || "—"}</div>
            <div className="col-span-3 text-xs text-zinc-400">
              {player.teams?.name || "Free Agent"}
            </div>
            <div className="col-span-2 text-xs text-zinc-500">{player.country || "—"}</div>
          </Link>
        ))}

        {allPlayers.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No players found in database.</p>
            <p className="text-xs text-zinc-700 mt-1">Add players via the Admin Command Center.</p>
          </div>
        )}
      </div>
    </div>
  );
}
