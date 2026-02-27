"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const handleOAuthLogin = async (provider) => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            console.error("Login failed:", error.message);
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "calc(100vh - 72px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Background Effects */}
            <div style={{
                position: "absolute",
                top: "20%",
                left: "20%",
                width: "400px",
                height: "400px",
                background: "var(--accent-purple)",
                filter: "blur(150px)",
                opacity: 0.15,
                borderRadius: "50%",
                zIndex: -1
            }} />
            <div style={{
                position: "absolute",
                bottom: "10%",
                right: "20%",
                width: "500px",
                height: "500px",
                background: "var(--accent-cyan)",
                filter: "blur(150px)",
                opacity: 0.1,
                borderRadius: "50%",
                zIndex: -1
            }} />

            <div className="glass-card" style={{
                width: "100%",
                maxWidth: "480px",
                padding: "3rem 2rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                position: "relative"
            }}>
                <div>
                    <div style={{
                        width: "60px",
                        height: "60px",
                        background: "var(--gradient-primary)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: "rotate(45deg)",
                        boxShadow: "0 10px 30px rgba(14, 165, 233, 0.4)",
                        margin: "0 auto 1.5rem"
                    }}>
                        <span style={{
                            color: "#fff",
                            fontFamily: '"Orbitron", sans-serif',
                            fontWeight: 800,
                            fontSize: "28px",
                            transform: "rotate(-45deg)",
                            textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                        }}>K</span>
                    </div>
                    <h1 style={{
                        fontSize: "2rem",
                        fontWeight: 800,
                        fontFamily: '"Rajdhani", sans-serif',
                        color: "var(--text-primary)",
                        marginBottom: "0.5rem"
                    }}>Secure Access</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                        Authenticate to unlock your personal Riot Games dashboard.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Riot Button */}
                    <button
                        className="btn btn-primary"
                        onClick={() => handleOAuthLogin('discord')} // Using discord as placeholder for RSO
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "1rem",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                            background: "linear-gradient(90deg, #d32f2f, #f44336)",
                            boxShadow: "0 4px 15px rgba(244, 67, 54, 0.3)"
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                        Sign in with Riot Games
                    </button>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                        margin: "0.5rem 0"
                    }}>
                        <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
                        <span>OR</span>
                        <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
                    </div>

                    {/* Discord Button */}
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleOAuthLogin('discord')}
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "1rem",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                            background: "rgba(88, 101, 242, 0.1)",
                            color: "#5865F2",
                            borderColor: "rgba(88, 101, 242, 0.3)"
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
                        Continue with Discord
                    </button>

                    {/* Google Button */}
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "1rem",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>
                        Continue with Google
                    </button>
                </div>

                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "1rem" }}>
                    By authenticating, you agree to our Terms of Service and Privacy Policy. All Riot Games assets are property of Riot Games, Inc.
                </p>
            </div>
        </div>
    );
}
