"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ValorantPromoPopup from "./ValorantPromoPopup";
import { Target, Trophy, ChevronRight, Swords, Shield, Zap } from "lucide-react";

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

const FEATURES = [
    {
        id: "lol",
        title: "League of Legends Hub",
        badge: "NEW FEATURE",
        description: "Track summoner profiles, match history, champion mastery, and live games across all regions.",
        icon: <Trophy className="w-8 h-8 text-[#C89B3C]" />,
        link: "/lol",
        color: "#C89B3C",
        bg: "rgba(200, 155, 60, 0.1)"
    },
    {
        id: "valorant",
        title: "VALORANT Tracker",
        badge: "NEW FEATURE",
        description: "Analyze agent performance, match history, headshot percentages, and competitive leaderboards.",
        icon: <Target className="w-8 h-8 text-red-500" />,
        link: "/valorant",
        color: "#ff4655",
        bg: "rgba(255, 70, 85, 0.1)"
    }
];

export default function HomeHero() {
    const [currentFeature, setCurrentFeature] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % FEATURES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <ValorantPromoPopup />

            <section className="hero" style={{ padding: "4rem 0", overflow: "hidden" }}>
                <div className="hero-grid"></div>
                <div className="page-container" style={{ position: "relative", zIndex: 10 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        
                        {/* LEFT COLUMN: TEXT */}
                        <div style={{ textAlign: "center", paddingTop: "2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <motion.h1
                                variants={itemVariants}
                                style={{
                                    fontFamily: '"Rajdhani", sans-serif',
                                    fontSize: "clamp(3rem, 6vw, 5.5rem)",
                                    fontWeight: 900,
                                    lineHeight: 1,
                                    marginBottom: "1.5rem",
                                    letterSpacing: "0.02em",
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
                                    maxWidth: "600px",
                                    marginBottom: "3rem",
                                    lineHeight: 1.6,
                                    fontWeight: 400,
                                }}
                            >
                                Real-time tournament tracking, player performance analytics, and professional team insights across all major titles.
                            </motion.p>
                            <motion.div variants={itemVariants} style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", justifyContent: "center" }}>
                                <Link href="/tournaments" className="btn-primary" style={{ padding: "12px 32px" }}>
                                    <span>Live Tournaments</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Link>
                                <Link href="/players" className="btn-secondary" style={{ padding: "12px 32px" }}>
                                    Explore Players
                                </Link>
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN: SLIDER */}
                        <motion.div variants={itemVariants} className="relative h-full min-h-[350px] flex items-center justify-center lg:justify-end">
                             <div className="w-full max-w-md relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentFeature}
                                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-8 shadow-2xl relative overflow-hidden group cursor-pointer"
                                        onClick={() => window.location.href = FEATURES[currentFeature].link}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none rounded-bl-full transition-transform group-hover:scale-110" style={{ background: `radial-gradient(circle at top right, ${FEATURES[currentFeature].color}, transparent)` }} />
                                        
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-6 border" style={{ color: FEATURES[currentFeature].color, borderColor: `${FEATURES[currentFeature].color}40`, background: FEATURES[currentFeature].bg }}>
                                            <Zap className="w-3 h-3" /> {FEATURES[currentFeature].badge}
                                        </div>
                                        
                                        <div className="mb-4">
                                            {FEATURES[currentFeature].icon}
                                        </div>

                                        <h3 className="text-2xl font-black uppercase tracking-tight mb-3 font-['Rajdhani']">
                                            {FEATURES[currentFeature].title}
                                        </h3>
                                        
                                        <p className="text-gray-400 mb-8 leading-relaxed">
                                            {FEATURES[currentFeature].description}
                                        </p>

                                        <div className="flex items-center font-bold text-sm tracking-widest uppercase transition-colors" style={{ color: FEATURES[currentFeature].color }}>
                                            Explore feature <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Slider Dots */}
                                <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-2">
                                    {FEATURES.map((f, idx) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setCurrentFeature(idx)}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentFeature === idx ? "w-6" : "opacity-40"}`}
                                            style={{ background: currentFeature === idx ? f.color : "var(--text-secondary)" }}
                                            aria-label={`Go to slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                             </div>
                        </motion.div>

                    </div>
                </div>
            </section>
        </motion.div>
    );
}
