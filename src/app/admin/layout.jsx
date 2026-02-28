import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
    const supabase = await createClient();

    // 1. Check if user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // 2. Check if user is an Admin in the profiles table
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (profileError || !profile?.is_admin) {
        // Not an admin, silently redirect back to the home page or dashboard
        redirect("/dashboard");
    }

    // Wrap the admin interfaces in a dedicated admin styling wrapper
    return (
        <div style={{ background: "rgba(10, 14, 23, 0.95)", minHeight: "calc(100vh - 72px)" }}>
            {children}
        </div>
    );
}
