"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function MarketingAdmin() {
    const [formData, setFormData] = useState({
        title: "",
        body: "",
        url: "",
        type: "both",
        target: "all"
    });
    const [status, setStatus] = useState({ loading: false, success: null, error: null });

    const handleSend = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: null, error: null });

        try {
            const res = await fetch("/api/notifications/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setStatus({ loading: false, success: `Sent! (Emails: ${data.results.email}, Push: ${data.results.push})`, error: null });
                setFormData({ title: "", body: "", url: "", type: "both", target: "all" });
            } else {
                setStatus({ loading: false, success: null, error: data.error });
            }
        } catch (err) {
            setStatus({ loading: false, success: null, error: "Failed to connect to API" });
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: "3rem" }}
            >
                <h1 className="page-title" style={{ marginBottom: "2rem" }}>Marketing Campaign Manager</h1>

                <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Campaign Title</label>
                        <input
                            className="search-input"
                            style={{ width: "100%", borderRadius: "8px", position: "static" }}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="e.g. Major Tournament Final Tonight!"
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Message Body</label>
                        <textarea
                            className="search-input"
                            style={{ width: "100%", borderRadius: "8px", height: "120px", position: "static", padding: "1rem" }}
                            value={formData.body}
                            onChange={e => setFormData({ ...formData, body: e.target.value })}
                            required
                            placeholder="Break down what's happening..."
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Target URL (Optional)</label>
                        <input
                            className="search-input"
                            style={{ width: "100%", borderRadius: "8px", position: "static" }}
                            value={formData.url}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://khelpedia.com/tournaments/123"
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Channel</label>
                            <select
                                className="search-input"
                                style={{ width: "100%", borderRadius: "8px", position: "static", background: "var(--bg-secondary)" }}
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="both">Email & Browser Push</option>
                                <option value="email">Email Only</option>
                                <option value="push">Browser Push Only</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Target Audience</label>
                            <select
                                className="search-input"
                                style={{ width: "100%", borderRadius: "8px", position: "static", background: "var(--bg-secondary)" }}
                                value={formData.target}
                                onChange={e => setFormData({ ...formData, target: e.target.value })}
                            >
                                <option value="all">Every Registered User</option>
                                <option value="admins">Admin Team Only (Test)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status.loading}
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "1rem", height: "50px", fontSize: "1.1rem" }}
                    >
                        {status.loading ? "Broadcasting..." : "🚀 Launch Campaign"}
                    </button>

                    {status.success && <p style={{ color: "var(--accent-cyan)", textAlign: "center", fontWeight: 600 }}>{status.success}</p>}
                    {status.error && <p style={{ color: "#ef4444", textAlign: "center", fontWeight: 600 }}>Error: {status.error}</p>}
                </form>
            </motion.div>
        </div>
    );
}
