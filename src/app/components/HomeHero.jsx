"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ValorantPromoPopup from "./ValorantPromoPopup";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HomeHero() {
    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <ValorantPromoPopup />

            <section className="hero">
                <div className="hero-grid"></div>
                <div className="page-container" style={{ position: "relative", zIndex: 10, textAlign: "center", paddingTop: "2rem" }}>
                    <motion.h1
                        variants={itemVariants}
                        style={{
                            fontFamily: '"Rajdhani", sans-serif',
                            fontSize: "clamp(3rem, 7vw, 6rem)",
                            fontWeight: 900,
                            lineHeight: 1,
                            marginBottom: "1.5rem",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                        }}
                    >
                        THE <span style={{ color: "var(--accent-red)" }}>EPICENTER</span> OF <br />
                        GLOBAL ESPORTS
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "clamp(1rem, 2vw, 1.25rem)",
                            maxWidth: "650px",
                            margin: "0 auto 3rem",
                            lineHeight: 1.6,
                            fontWeight: 400,
                        }}
                    >
                        Real-time tournament tracking, player performance analytics, and professional team insights across all major titles.
                    </motion.p>
                    <motion.div variants={itemVariants} style={{ display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href="/tournaments" className="btn-primary" style={{ padding: "12px 32px" }}>
                            <span>Live Tournaments</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </Link>
                        <Link href="/players" className="btn-secondary" style={{ padding: "12px 32px" }}>
                            Explore Players
                        </Link>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    );
}
