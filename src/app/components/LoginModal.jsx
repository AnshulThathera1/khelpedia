"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function LoginModal({ isOpen, onClose }) {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleOAuthLogin = async (provider) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Login error:", error.message);
            setIsLoading(false);
        }
    };

    const handleRiotLogin = async () => {
        setIsLoading(true);
        // This will be connected to your Riot RSO logic once approved
        // For now, it mimics the OAuth flow
        window.location.href = `https://khelpedia.vercel.app/api/auth/riot/login`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(10, 15, 20, 0.95)",
                            backdropFilter: "blur(10px)",
                            zIndex: 1000,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem"
                        }}
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: "100%",
                                maxWidth: "440px",
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "0px",
                                position: "relative",
                                padding: "3rem 2rem",
                                overflow: "hidden",
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                            }}
                        >
                            {/* Accent Lines */}
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "var(--accent-red)" }} />
                            <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "40px", background: "var(--accent-red)" }} />

                            {/* Close Button */}
                            <button 
                                onClick={onClose}
                                style={{
                                    position: "absolute",
                                    top: "1.5rem",
                                    right: "1.5rem",
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    transition: "color 0.2s"
                                }}
                                onMouseEnter={(e) => e.target.style.color = "var(--accent-red)"}
                                onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
                            >
                                ✕
                            </button>

                            {/* Header */}
                            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                                <div style={{
                                    width: "50px",
                                    height: "50px",
                                    background: "var(--accent-red)",
                                    borderRadius: "2px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transform: "rotate(45deg)",
                                    margin: "0 auto 1.5rem",
                                    boxShadow: "0 0 20px rgba(255, 70, 85, 0.3)"
                                }}>
                                    <span style={{
                                        color: "#fff",
                                        fontFamily: '"Orbitron", sans-serif',
                                        fontWeight: 900,
                                        fontSize: "24px",
                                        transform: "rotate(-45deg)"
                                    }}>K</span>
                                </div>
                                <h2 style={{ 
                                    fontFamily: '"Rajdhani", sans-serif', 
                                    fontSize: "2rem", 
                                    fontWeight: 800, 
                                    color: "var(--text-primary)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "0.5rem"
                                }}>
                                    Welcome <span style={{ color: "var(--accent-red)" }}>Agent</span>
                                </h2>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>
                                    Sign in to track your stats and tournaments
                                </p>
                            </div>

                            {/* Login Options */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {/* Riot Login - Highlighted */}
                                <button
                                    onClick={handleRiotLogin}
                                    disabled={isLoading}
                                    style={{
                                        background: "#ff4655",
                                        color: "#fff",
                                        border: "none",
                                        padding: "1.1rem",
                                        fontSize: "0.9rem",
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "12px",
                                        transition: "all 0.2s",
                                        borderRadius: "0px",
                                        boxShadow: "0 4px 15px rgba(255, 70, 85, 0.2)"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "#e63e4c";
                                        e.target.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "#ff4655";
                                        e.target.style.transform = "translateY(0)";
                                    }}
                                >
                                    <span style={{ fontSize: "1.2rem" }}>🕹️</span>
                                    Continue with Riot Games
                                </button>

                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1rem 0" }}>
                                    <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Other Access</span>
                                    <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
                                </div>

                                {/* Social Providers */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <button
                                        onClick={() => handleOAuthLogin("google")}
                                        disabled={isLoading}
                                        style={{
                                            background: "rgba(255,255,255,0.03)",
                                            color: "var(--text-primary)",
                                            border: "1px solid var(--border-color)",
                                            padding: "0.9rem",
                                            fontSize: "0.8rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.07)"}
                                        onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.03)"}
                                    >
                                        Google
                                    </button>
                                    <button
                                        onClick={() => handleOAuthLogin("discord")}
                                        disabled={isLoading}
                                        style={{
                                            background: "rgba(255,255,255,0.03)",
                                            color: "var(--text-primary)",
                                            border: "1px solid var(--border-color)",
                                            padding: "0.9rem",
                                            fontSize: "0.8rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = "rgba(88, 101, 242, 0.15)"}
                                        onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.03)"}
                                    >
                                        Discord
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1.5 }}>
                                    By signing in, you agree to our <br />
                                    <a href="/terms" style={{ color: "var(--accent-red)", textDecoration: "none", fontWeight: 700 }}>Terms of Service</a> and <a href="/privacy" style={{ color: "var(--accent-red)", textDecoration: "none", fontWeight: 700 }}>Privacy Policy</a>
                                </p>
                            </div>

                            {/* Decorative corner */}
                            <div style={{
                                position: "absolute",
                                bottom: "-20px",
                                right: "-20px",
                                width: "60px",
                                height: "60px",
                                border: "1px solid var(--accent-red)",
                                opacity: 0.1,
                                transform: "rotate(45deg)"
                            }} />
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
