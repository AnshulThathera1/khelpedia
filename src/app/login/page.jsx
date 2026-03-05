"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleOAuthLogin = async (provider) => {
        setIsLoading(true);
        setMessage({ type: "", text: "" });
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setMessage({ type: "error", text: error.message });
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setMessage({ type: "", text: "" });

        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        setIsLoading(false);
        if (error) {
            setMessage({ type: "error", text: error.message });
        } else {
            setMessage({ type: "success", text: "Magic link sent! Check your inbox." });
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
                padding: "3rem 2.5rem",
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
                        fontSize: "2.2rem",
                        fontWeight: 800,
                        fontFamily: '"Rajdhani", sans-serif',
                        color: "var(--text-primary)",
                        marginBottom: "0.5rem"
                    }}>Welcome Back</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                        Sign in to access your dashboard and tournament trackings.
                    </p>
                </div>

                {message.text && (
                    <div style={{
                        padding: "1rem",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        background: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: message.type === "error" ? "#ef4444" : "#10b981",
                        border: `1px solid ${message.type === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`,
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Google Button */}
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "0.8rem",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "var(--text-primary)"
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={() => handleOAuthLogin('discord')}
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "0.8rem",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                            background: "rgba(88, 101, 242, 0.05)",
                            color: "#5865F2",
                            borderColor: "rgba(88, 101, 242, 0.2)"
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
                        Continue with Discord
                    </button>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                        margin: "1rem 0"
                    }}>
                        <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
                        <span>OR EMAIL</span>
                        <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
                    </div>

                    <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="filter-chip"
                            style={{
                                width: "100%",
                                padding: "1rem",
                                background: "rgba(255, 255, 255, 0.02)",
                                border: "1px solid var(--border-color)",
                                color: "#fff",
                                fontSize: "1rem",
                                outline: "none",
                                borderRadius: "12px",
                                textAlign: "center"
                            }}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{
                                width: "100%",
                                padding: "1rem",
                                fontSize: "1rem",
                                fontWeight: 700
                            }}
                        >
                            {isLoading ? "Sending..." : "Send Magic Link"}
                        </button>
                    </form>
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "1rem", lineHeight: 1.5 }}>
                    We'll email you a magic code for a password-free sign in. <br />
                    By authenticating, you agree to our Terms of Service.
                </p>
            </div>
        </div>
    );
}
