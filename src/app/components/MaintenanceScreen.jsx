"use client";

import { Shield, RefreshCw, MessageSquare, ExternalLink, Activity, Database, Radio } from "lucide-react";
import Image from "next/image";

export default function MaintenanceScreen({
  message = "KhelPediA is undergoing scheduled system upgrades. Live match trackers, tournament schedules, and statistics will be back online shortly.",
}) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-red-500/30 selection:text-white relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Brand */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white font-bold shadow-lg shadow-red-950/40">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight font-rajdhani text-white">
              KhelPediA
            </span>
            <span className="text-[10px] block text-zinc-400 font-mono tracking-widest uppercase -mt-1">
              Esports Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Under Maintenance</span>
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="w-full max-w-2xl mx-auto my-auto py-12 text-center z-10 space-y-8">
        {/* Glow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs font-mono shadow-inner">
          <Activity className="h-3.5 w-3.5 text-red-500 animate-pulse" />
          <span>Scheduled Infrastructure Maintenance</span>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black font-rajdhani uppercase tracking-tight text-white leading-tight">
            Leveling Up The Servers
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            {message}
          </p>
        </div>

        {/* Live Systems Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-blue-400" />
                PostgreSQL DB
              </span>
              <span className="text-amber-400 text-[10px]">Optimizing</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-4/5 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-red-400" />
                Live Match Feeds
              </span>
              <span className="text-amber-400 text-[10px]">Syncing</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full w-2/3 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                Security Gateway
              </span>
              <span className="text-emerald-400 text-[10px]">Online</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full rounded-full" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRefresh}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Check If We&apos;re Back</span>
          </button>

          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span>Join Discord for Updates</span>
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between py-4 text-xs text-zinc-400 font-mono border-t border-zinc-900 gap-2 z-10">
        <div>
          <span>&copy; {new Date().getFullYear()} KhelPediA. All rights reserved.</span>
        </div>
        <div>
          <a
            href="https://admin.khelpedia.org"
            className="text-zinc-400 hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            <Shield className="h-3 w-3" />
            <span>Admin Control Center</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
