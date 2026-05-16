import { getTournaments } from "@/lib/queries";
import TournamentCard from "../components/TournamentCard";
import Pagination from "../components/Pagination";
import Link from "next/link";

export const metadata = {
    title: "Tournaments | KhelPediA",
    description: "Live, upcoming, and completed esports tournaments.",
};

export default async function TournamentsPage({ searchParams: searchParamsPromise }) {
    const searchParams = await searchParamsPromise;
    const status = searchParams.status || null;
    const tier = searchParams.tier || null;
    const page = parseInt(searchParams.page) || 1;
    const limit = 24;

    const { tournaments, count } = await getTournaments({
        status,
        tier,
        page,
        limit,
        paginate: true
    });

    const totalPages = Math.ceil(count / limit);

    // Helpers to build filter URLs
    const getFilterUrl = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete("page"); // Reset pagination on filter change
        return `/tournaments?${params.toString()}`;
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", marginBottom: "4rem" }}>
                <div style={{ textAlign: "center" }}>
                    <h1 className="page-title" style={{ fontSize: "3.5rem", fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Tournaments</h1>
                    <p className="page-description" style={{ fontSize: "1rem", color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Tracking <span style={{ color: "var(--accent-red)", fontWeight: 800 }}>{count}</span> active competitions worldwide.
                    </p>
                </div>

                <div style={{ display: "flex", flexFlow: "row wrap", gap: "2rem", justifyContent: "center", background: "rgba(255,255,255,0.02)", padding: "1.5rem 2rem", border: "1px solid var(--border-color)" }}>
                    {/* Status Filters */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginRight: "0.5rem" }}>STATUS:</span>
                        <Link href={getFilterUrl("status", null)} className={`filter-chip ${!status ? 'active' : ''}`}>All</Link>
                        <Link href={getFilterUrl("status", "live")} className={`filter-chip ${status === 'live' ? 'active' : ''}`}>🔴 Live</Link>
                        <Link href={getFilterUrl("status", "upcoming")} className={`filter-chip ${status === 'upcoming' ? 'active' : ''}`}>📅 Upcoming</Link>
                        <Link href={getFilterUrl("status", "completed")} className={`filter-chip ${status === 'completed' ? 'active' : ''}`}>✅ Completed</Link>
                    </div>

                    {/* Tier Filters */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", marginRight: "0.5rem" }}>TIER:</span>
                        <Link href={getFilterUrl("tier", null)} className={`filter-chip ${!tier ? 'active' : ''}`}>All</Link>
                        <Link href={getFilterUrl("tier", "S")} className={`filter-chip ${tier === 'S' ? 'active' : ''}`}>S-Tier</Link>
                        <Link href={getFilterUrl("tier", "A")} className={`filter-chip ${tier === 'A' ? 'active' : ''}`}>A-Tier</Link>
                        <Link href={getFilterUrl("tier", "B")} className={`filter-chip ${tier === 'B' ? 'active' : ''}`}>B-Tier</Link>
                        <Link href={getFilterUrl("tier", "C")} className={`filter-chip ${tier === 'C' ? 'active' : ''}`}>C-Tier</Link>
                    </div>
                </div>
            </div>

            <div className="grid-auto">
                {tournaments.length > 0 ? (
                    tournaments.map((t) => (
                        <TournamentCard key={t.id} tournament={t} />
                    ))
                ) : (
                    <div className="card" style={{ gridColumn: "1 / -1", padding: "6rem 2rem", textAlign: "center", color: "var(--text-muted)", borderStyle: "dashed", borderRadius: "0px" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>🏆</div>
                        <p style={{ fontSize: "1.1rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em" }}>No tournaments found matching these criteria.</p>
                        <Link href="/tournaments" style={{ marginTop: "1.5rem", color: "var(--accent-red)", textDecoration: "none", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "2px solid var(--accent-red)" }}>Reset all filters</Link>
                    </div>
                )}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} searchParams={searchParams} />
        </div>
    );
}
