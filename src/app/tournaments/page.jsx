import { getTournaments } from "@/lib/queries";
import TournamentCard from "../components/TournamentCard";
import Link from "next/link";

export const metadata = {
    title: "Tournaments | KhelPediA",
    description: "Live, upcoming, and completed esports tournaments.",
};

export default async function TournamentsPage({ searchParams }) {
    const statusFilter = searchParams?.status;
    const tournaments = await getTournaments(statusFilter ? { status: statusFilter } : {});

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 className="page-title">Tournaments</h1>
                    <p className="page-description">
                        Track competitions across the globe.
                    </p>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link href="/tournaments" className={`filter-chip ${!statusFilter ? 'active' : ''}`}>
                        All
                    </Link>
                    <Link href="/tournaments?status=live" className={`filter-chip ${statusFilter === 'live' ? 'active' : ''}`}>
                        🔴 Live
                    </Link>
                    <Link href="/tournaments?status=upcoming" className={`filter-chip ${statusFilter === 'upcoming' ? 'active' : ''}`}>
                        📅 Upcoming
                    </Link>
                    <Link href="/tournaments?status=completed" className={`filter-chip ${statusFilter === 'completed' ? 'active' : ''}`}>
                        ✅ Completed
                    </Link>
                </div>
            </div>

            <div className="grid-auto">
                {tournaments.length > 0 ? (
                    tournaments.map((t) => (
                        <TournamentCard key={t.id} tournament={t} />
                    ))
                ) : (
                    <div className="glass-card" style={{ gridColumn: "1 / -1", padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
                        <p>No tournaments found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
