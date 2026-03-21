import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoadingProfile() {
  return (
    <div className="min-h-screen bg-[#0f1923] text-white">
      {/* Header NavBar */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/valorant" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-medium">
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-32 animate-pulse flex flex-col justify-center gap-4">
            <div className="w-3/4 h-8 bg-zinc-800 rounded-md"></div>
            <div className="w-1/3 h-5 bg-zinc-800 rounded-md"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-6 h-64 animate-pulse">
            <div className="w-1/2 h-4 bg-zinc-800 rounded-md mb-6"></div>
            <div className="grid grid-cols-2 gap-4">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="space-y-2">
                   <div className="w-16 h-3 bg-zinc-800 rounded"></div>
                   <div className="w-20 h-6 bg-zinc-800 rounded"></div>
                 </div>
               ))}
            </div>
            <div className="mt-8">
               <div className="w-24 h-3 bg-zinc-800 rounded mb-2"></div>
               <div className="w-32 h-6 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>

        {/* Right Column: Match History feed Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 bg-zinc-800 rounded-full animate-pulse" />
            <div className="w-32 h-6 bg-zinc-800 rounded-md animate-pulse" />
          </div>

          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse h-24 gap-4">
               <div className="w-16 h-16 bg-zinc-800 rounded-lg hidden sm:block"></div>
               <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                 <div>
                   <div className="w-20 h-5 bg-zinc-800 rounded mb-2"></div>
                   <div className="w-16 h-3 bg-zinc-800 rounded"></div>
                 </div>
                 <div className="text-center flex flex-col items-center">
                   <div className="w-24 h-5 bg-zinc-800 rounded mb-2"></div>
                   <div className="w-8 h-3 bg-zinc-800 rounded"></div>
                 </div>
                 <div className="text-center hidden md:flex flex-col items-center">
                   <div className="w-12 h-5 bg-zinc-800 rounded mb-2"></div>
                   <div className="w-8 h-3 bg-zinc-800 rounded"></div>
                 </div>
                 <div className="text-center flex flex-col items-center">
                   <div className="w-12 h-5 bg-zinc-800 rounded mb-2"></div>
                   <div className="w-8 h-3 bg-zinc-800 rounded"></div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
