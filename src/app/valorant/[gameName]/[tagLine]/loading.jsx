import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoadingProfile() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header NavBar */}
      <header className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/valorant" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 font-medium">
            <ChevronLeft className="w-5 h-5" />
            Back to Search
          </Link>
          <div className="font-bold text-xl tracking-wider text-red-500">VALORANT TRACKER</div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Identity Skeleton */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6 h-32 animate-pulse flex flex-col justify-center gap-4">
            <div className="w-3/4 h-8 bg-[var(--bg-card)] rounded-md"></div>
            <div className="w-1/3 h-5 bg-[var(--bg-card)] rounded-md"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border-color)] rounded-xl p-6 h-64 animate-pulse">
            <div className="w-1/2 h-4 bg-[var(--bg-card)] rounded-md mb-6"></div>
            <div className="grid grid-cols-2 gap-4">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="space-y-2">
                   <div className="w-16 h-3 bg-[var(--bg-card)] rounded"></div>
                   <div className="w-20 h-6 bg-[var(--bg-card)] rounded"></div>
                 </div>
               ))}
            </div>
            <div className="mt-8">
               <div className="w-24 h-3 bg-[var(--bg-card)] rounded mb-2"></div>
               <div className="w-32 h-6 bg-[var(--bg-card)] rounded"></div>
            </div>
          </div>
        </div>

        {/* Right Column: Match History feed Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 bg-[var(--bg-card)] rounded-full animate-pulse" />
            <div className="w-32 h-6 bg-[var(--bg-card)] rounded-md animate-pulse" />
          </div>

          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 animate-pulse h-24 gap-4">
               <div className="w-16 h-16 bg-[var(--bg-card)] rounded-lg hidden sm:block"></div>
               <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                 <div>
                   <div className="w-20 h-5 bg-[var(--bg-card)] rounded mb-2"></div>
                   <div className="w-16 h-3 bg-[var(--bg-card)] rounded"></div>
                 </div>
                 <div className="text-center flex flex-col items-center">
                   <div className="w-24 h-5 bg-[var(--bg-card)] rounded mb-2"></div>
                   <div className="w-8 h-3 bg-[var(--bg-card)] rounded"></div>
                 </div>
                 <div className="text-center hidden md:flex flex-col items-center">
                   <div className="w-12 h-5 bg-[var(--bg-card)] rounded mb-2"></div>
                   <div className="w-8 h-3 bg-[var(--bg-card)] rounded"></div>
                 </div>
                 <div className="text-center flex flex-col items-center">
                   <div className="w-12 h-5 bg-[var(--bg-card)] rounded mb-2"></div>
                   <div className="w-8 h-3 bg-[var(--bg-card)] rounded"></div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
