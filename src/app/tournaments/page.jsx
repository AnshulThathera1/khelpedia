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
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1.5rem" }}>
                <div>
                    <h1 className="page-title">Tournaments</h1>
                    <p className="page-description">
                        Track {count} competitions across the globe.
                    </p>
                </div>

                <div style={{ display: "flex", flexFlow: "column", gap: "1rem", alignItems: "flex-end" }}>
                    {/* Status Filters */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", width: "100%", textAlign: "right", letterSpacing: "0.1em" }}>STATUS</span>
                        <Link href={getFilterUrl("status", null)} className={`filter-chip ${!status ? 'active' : ''}`}>All</Link>
                        <Link href={getFilterUrl("status", "live")} className={`filter-chip ${status === 'live' ? 'active' : ''}`}>🔴 Live</Link>
                        <Link href={getFilterUrl("status", "upcoming")} className={`filter-chip ${status === 'upcoming' ? 'active' : ''}`}>📅 Upcoming</Link>
                        <Link href={getFilterUrl("status", "completed")} className={`filter-chip ${status === 'completed' ? 'active' : ''}`}>✅ Completed</Link>
                    </div>

                    {/* Tier Filters */}
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", width: "100%", textAlign: "right", letterSpacing: "0.1em" }}>TIER</span>
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
                    <div className="glass-card" style={{ gridColumn: "1 / -1", padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
                        <p>No tournaments found with selected filters.</p>
                        <Link href="/tournaments" style={{ marginTop: "1rem", color: "var(--accent-cyan)", textDecoration: "underline", display: "inline-block" }}>Clear all filters</Link>
                    </div>
                )}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} searchParams={searchParams} />
        </div>
    );
}
