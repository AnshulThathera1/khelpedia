import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  getTournamentDetails, 
  getTournamentTeams, 
  getTournamentStandings, 
  getTournamentSchedule 
} from '@/lib/esportsamaze';
import TournamentTabs from './TournamentTabs';

export default async function TournamentDetailPage({ params }) {
  const { slug } = await params;
  const tournamentName = decodeURIComponent(slug).replace(/_/g, ' ');

  const [tournament, teams, standings, schedule] = await Promise.all([
    getTournamentDetails(tournamentName),
    getTournamentTeams(tournamentName),
    getTournamentStandings(tournamentName),
    getTournamentSchedule(tournamentName)
  ]);

  if (!tournament) {
    notFound();
  }

  // Handle hero image
  const heroImage = tournament.image 
    ? `https://esportsamaze.in/Special:FilePath/${tournament.image}` 
    : null;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex text-sm text-[var(--text-secondary)] mb-6">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/bgmi" className="hover:text-[var(--text-primary)] transition-colors">BGMI Hub</Link>
          </li>
          <li><span className="mx-2">/</span></li>
          <li>
            <Link href="/bgmi/tournaments" className="hover:text-[var(--text-primary)] transition-colors">Tournaments</Link>
          </li>
          <li><span className="mx-2">/</span></li>
          <li className="text-[var(--text-primary)] font-semibold truncate" aria-current="page">
            {tournament.name}
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border-color)] mb-8 relative">
        {/* Background Blur */}
        {heroImage && (
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center blur-xl"
            style={{ backgroundImage: `url('${heroImage}')` }}
          />
        )}
        
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 z-10">
          {/* Logo */}
          <div className="w-48 h-48 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 p-4 shadow-2xl">
            {heroImage ? (
              <img 
                src={heroImage} 
                alt={tournament.name} 
                className="w-full h-full object-contain drop-shadow-xl"
              />
            ) : (
              <span className="text-4xl">🏆</span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-3 py-1 bg-[#F1B11D]/10 border border-[#F1B11D]/30 text-[#F1B11D] rounded-full text-xs font-bold tracking-wider mb-4 uppercase">
              {tournament.tier || 'Tournament'}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-4 tracking-tight">
              {tournament.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-sm">
              <div className="flex flex-col">
                <span className="text-[var(--text-secondary)] font-semibold mb-1">Dates</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {tournament.start_date} - {tournament.end_date || 'TBD'}
                </span>
              </div>
              
              {tournament.prize_pool && (
                <div className="flex flex-col">
                  <span className="text-[var(--text-secondary)] font-semibold mb-1">Prize Pool</span>
                  <span className="text-green-400 font-bold text-lg">
                    {tournament.prize_pool}
                  </span>
                </div>
              )}
              
              <div className="flex flex-col">
                <span className="text-[var(--text-secondary)] font-semibold mb-1">Location</span>
                <span className="text-[var(--text-primary)] font-medium flex items-center gap-1">
                  📍 {tournament.location || 'Online'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <TournamentTabs 
        tournament={tournament}
        teams={teams}
        standings={standings}
        schedule={schedule}
      />
    </div>
  );
}
