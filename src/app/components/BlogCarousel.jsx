"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BlogCarousel({ blogs, variant = "news" }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % blogs.length);
    }, [blogs.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? blogs.length - 1 : prev - 1));
    }, [blogs.length]);

    useEffect(() => {
        if (blogs.length <= 1) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [blogs.length, nextSlide]);

    if (!blogs || blogs.length === 0) return null;

    // Helper to get relative position of an index compared to current center
    const getPosition = (index) => {
        const diff = index - currentIndex;
        if (diff === 0) return 0; // Center
        
        // Handle wrapping for 3D effect
        const half = Math.floor(blogs.length / 2);
        
        if (diff > 0) {
            return diff <= half ? diff : diff - blogs.length;
        } else {
            return Math.abs(diff) <= half ? diff : diff + blogs.length;
        }
    };

    return (
        <div className="relative w-full overflow-hidden py-12 flex flex-col items-center justify-center min-h-[450px]">
            <div className="relative w-full max-w-5xl flex justify-center items-center h-[380px] perspective-1000">
                <AnimatePresence initial={false}>
                    {blogs.map((blog, idx) => {
                        const position = getPosition(idx);
                        
                        // We only want to render items that are close to the center for performance and clarity
                        if (Math.abs(position) > 2) return null;

                        const isCenter = position === 0;
                        const isNews = variant === "news";
                        const accentColor = isNews ? "var(--accent-cyan)" : "var(--accent-purple)";

                        return (
                            <motion.div
                                key={blog.id}
                                className="absolute top-0 w-full max-w-[320px] h-full"
                                initial={{ opacity: 0, scale: 0.8, x: position * 100 }}
                                animate={{
                                    opacity: Math.abs(position) === 2 ? 0.3 : (Math.abs(position) === 1 ? 0.6 : 1),
                                    scale: isCenter ? 1 : (Math.abs(position) === 1 ? 0.85 : 0.7),
                                    x: `${position * 65}%`,
                                    zIndex: 10 - Math.abs(position),
                                    filter: isCenter ? "blur(0px)" : "blur(2px)",
                                }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                onClick={() => !isCenter && (position > 0 ? nextSlide() : prevSlide())}
                                style={{
                                    cursor: isCenter ? "default" : "pointer"
                                }}
                            >
                                <Link href={`/blogs/${blog.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                                    <div 
                                        className="card transition-all duration-300"
                                        style={{ 
                                            padding: isNews ? 0 : "1.5rem", 
                                            overflow: "hidden", 
                                            height: "100%", 
                                            display: "flex", 
                                            flexDirection: "column",
                                            borderLeft: !isNews ? `3px solid ${accentColor}` : "none",
                                            boxShadow: isCenter ? `0 10px 40px -10px ${accentColor}40` : "none",
                                        }}
                                    >
                                        {isNews && (
                                            <div style={{ height: "160px", width: "100%", background: "var(--bg-secondary)", position: "relative" }}>
                                                {blog.cover_image_url ? (
                                                    <img src={blog.cover_image_url} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(45deg, rgba(255,70,85,0.1), rgba(139,92,246,0.1))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <span style={{ fontSize: "2rem" }}>📰</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div style={{ padding: isNews ? "1.25rem" : "0", flex: 1, display: "flex", flexDirection: "column", gap: !isNews ? "0.5rem" : "0" }}>
                                            {!isNews && (
                                                <span style={{ color: accentColor, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>FEATURED</span>
                                            )}
                                            
                                            {isNews && (
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", fontSize: "0.75rem" }}>
                                                    <span style={{ color: accentColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>NEWS</span>
                                                    <span style={{ color: "var(--text-muted)" }}>{new Date(blog.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                                                </div>
                                            )}
                                            
                                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: isNews ? "0.5rem" : "0", lineHeight: 1.3, fontFamily: !isNews ? '"Rajdhani", sans-serif' : 'inherit' }}>
                                                {blog.title}
                                            </h3>
                                            
                                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, flex: 1, margin: !isNews ? "0.5rem 0" : "0" }}>
                                                {blog.excerpt}
                                            </p>
                                            
                                            {isNews ? (
                                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: accentColor, display: "inline-block" }}></div>
                                                    By {blog.profiles?.display_name || "Editorial Team"}
                                                </div>
                                            ) : (
                                                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "auto" }}>
                                                    {new Date(blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4 mt-6">
                <button 
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                    {blogs.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? "w-6 bg-white" : "bg-[var(--border-color)]"}`}
                        />
                    ))}
                </div>
                <button 
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-white transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
