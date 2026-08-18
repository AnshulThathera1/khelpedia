import { createClient } from "@/utils/supabase/server";
import { getActiveLeague, getUserFantasyTeam } from "@/app/actions/fantasy";
import DraftBoard from "./DraftBoard";
import { redirect } from "next/navigation";

export default async function FantasyDraftPage() {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
        redirect("/login");
    }

    const { data: activeLeague } = await getActiveLeague();
    if (!activeLeague) {
        return <div className="page-container">No active fantasy league.</div>;
    }

    const { data: myTeam } = await getUserFantasyTeam(userData.user.id, activeLeague.id);
    
    if (!myTeam) {
        // Must create a team first
        redirect("/fantasy");
    }

    return (
        <div className="page-container" style={{ paddingTop: "1rem", maxWidth: "1400px" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', textTransform: "uppercase" }}>
                    Drafting Room
                </h2>
                <p style={{ color: "var(--text-secondary)" }}>
                    Scout players and assign them to your {myTeam.name} roster.
                </p>
            </div>
            
            <DraftBoard myTeam={myTeam} />
        </div>
    );
}
