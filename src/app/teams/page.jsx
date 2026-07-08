import { getTeams } from "@/lib/queries";
import TeamCard from "../components/TeamCard";

export const metadata = {
    title: "Esports Teams & Organizations",
    description: "Browse professional esports teams and organizations competing in Valorant, CS2, BGMI, Dota 2, and more. View rosters, tournament history, and achievements.",
    alternates: {
        canonical: "/teams",
    },
};

export default async function TeamsPage() {
    const teams = await getTeams();

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
        </div>
    );
}
