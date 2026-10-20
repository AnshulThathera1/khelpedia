import Link from "next/link";
import { ChevronLeft, Trophy, Calendar, Users, Target } from "lucide-react";

export default function BGMILayout({ children }) {
  // BGMI Theme Colors: 
  // Deep Blue/Black backgrounds: #0b1116
  // Krafton Yellow/Gold: #F1B11D
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[#F1B11D]/30 pb-20 font-sans transition-colors duration-400">
      
      {/* Top Navigation specific to BGMI */}
      <div className="sticky top-0 z-50 bg-[var(--bg-glass)] backdrop-blur-md border-b border-[#F1B11D]/20 transition-colors duration-400">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/games" 
              className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#F1B11D] transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Games
            </Link>

            <Link href="/bgmi" className="inline-flex items-center gap-2.5 text-decoration-none group">
              <div className="w-7 h-7 flex items-center justify-center">
                <img 
                  src="/images/games/bgmi.png" 
                  alt="BGMI Logo" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(241,177,29,0.35)] group-hover:scale-110 transition-transform" 
                />
              </div>
              <span className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-primary)] font-display">
                BGMI <span className="text-[#F1B11D]">Esports</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/bgmi" className="text-sm font-semibold hover:text-[#F1B11D] transition-colors uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Hub
            </Link>
            <Link href="/bgmi/tournaments" className="text-sm font-semibold hover:text-[#F1B11D] transition-colors uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Tournaments
            </Link>
            <Link href="/bgmi/teams" className="text-sm font-semibold hover:text-[#F1B11D] transition-colors uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" /> Teams
            </Link>
            <Link href="/bgmi/players" className="text-sm font-semibold hover:text-[#F1B11D] transition-colors uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" /> Players
            </Link>
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}
