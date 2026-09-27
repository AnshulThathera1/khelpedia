import { getTeams } from "@/lib/queries";
import TeamCard from "../components/TeamCard";
import Pagination from "../components/Pagination";

export async function generateMetadata({ searchParams }) {
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page) || 1;
    const isPaginated = page > 1;

    return {
        title: "Esports Teams & Organizations",
        description: "Browse professional esports teams and organizations competing in Valorant, CS2, BGMI, Dota 2, and more. View rosters, tournament history, and achievements.",
        alternates: {
            canonical: "/teams",
        },
        ...(isPaginated ? {
            robots: {
                index: false,
                follow: true,
            },
        } : {}),
    };
}

export default async function TeamsPage({ searchParams }) {
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page) || 1;
    const limit = 24;

    const { teams, count } = await getTeams({ page, limit, paginate: true });
    const totalPages = Math.ceil(count / limit);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Teams & Organizations</h1>
                <p className="page-description">
                    Global esports powerhouses.
                </p>
            </div>

            <div className="grid-auto-sm">
                {teams.length > 0 ? (
                    teams.map((team) => (
                        <TeamCard key={team.id} team={team} />
                    ))
                ) : (
                    <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                        No teams found.
                    </p>
                )}
            </div>

            {totalPages > 1 && (
                <Pagination currentPage={page} totalPages={totalPages} searchParams={resolvedParams} />
            )}
        </div>
    );
}
