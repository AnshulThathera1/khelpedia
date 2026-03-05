"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
    return (
        <div style={{
            minHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            padding: "2rem"
        }}>
            {/* Animated Background Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "50vw",
                    height: "50vw",
                    background: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(139, 92, 246, 0.1) 40%, rgba(10, 14, 23, 0) 70%)",
                    filter: "blur(60px)",
                    zIndex: 0,
                    pointerEvents: "none"
                }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ zIndex: 1, position: "relative" }}
            >
                {/* 404 Number with floating animation */}
                <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: "relative" }}
                >
                    <h1 style={{
                        fontSize: "clamp(8rem, 20vw, 15rem)",
                        fontWeight: 900,
                        lineHeight: 1,
                        margin: 0,
                        background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 20px 40px rgba(14, 165, 233, 0.2)",
                        fontFamily: '"Rajdhani", sans-serif',
                        letterSpacing: "-0.05em"
                    }}>
                        404
                    </h1>

                    {/* Decorative elements behind 404 */}
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "120%",
                        height: "2px",
                        background: "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.5), transparent)",
                        zIndex: -1
                    }} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 style={{
                        fontSize: "clamp(1.5rem, 5vw, 3rem)",
                        fontWeight: 800,
                        color: "var(--text-primary, #ffffff)",
                        margin: "1rem 0",
                        fontFamily: '"Rajdhani", sans-serif',
                        letterSpacing: "4px",
                        textTransform: "uppercase",
                        textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                    }}>
                        Lost in the Fog of War
                    </h2>

                    <p style={{
                        color: "var(--text-muted, #94a3b8)",
                        fontSize: "1.1rem",
                        maxWidth: "600px",
                        margin: "0 auto 3rem",
                        lineHeight: 1.6
                    }}>
                        The location you are trying to reach has been eliminated, relocated, or never existed in this realm. Check your coords and try again.
                    </p>

                    <Link href="/" style={{ textDecoration: "none" }}>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(14, 165, 233, 0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                padding: "1rem 2.5rem",
                                background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1))",
                                border: "1px solid rgba(14, 165, 233, 0.3)",
                                borderRadius: "8px",
                                color: "#0ea5e9",
                                cursor: "pointer",
                                backdropFilter: "blur(10px)",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m12 19-7-7 7-7" />
                                <path d="M19 12H5" />
                            </svg>
                            Return to Nexus
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Grid overlay for esports look */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
                zIndex: -2,
                opacity: 0.5,
                pointerEvents: "none"
            }} />
        </div>
    );
}
