'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Trophy, Swords, Map, Target, Users, Zap, AlertTriangle, Activity, ChevronDown
} from 'lucide-react';
import { getDDragonChampions } from '@/app/actions/lol';

// ─── Animation Variants ───────────────────────────────────────
const stagger = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const fadeUp = {
  hidden: { opacity: 1, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const REGIONS = [
  { id: 'na1', name: 'North America' },
  { id: 'euw1', name: 'Europe West' },
  { id: 'eun1', name: 'Europe Nordic & East' },
  { id: 'kr', name: 'Korea' },
  { id: 'br1', name: 'Brazil' },
  { id: 'jp1', name: 'Japan' },
  { id: 'ru', name: 'Russia' },
  { id: 'tr1', name: 'Turkey' },
  { id: 'oc1', name: 'Oceania' },
  { id: 'la1', name: 'LAS' },
  { id: 'la2', name: 'LAN' },
  { id: 'ph2', name: 'Philippines' },
  { id: 'sg2', name: 'Singapore' },
  { id: 'tw2', name: 'Taiwan' },
  { id: 'th2', name: 'Thailand' },
  { id: 'vn2', name: 'Vietnam' }
];

export default function LeagueOfLegendsHub() {
  const [riotId, setRiotId] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('na1');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const regionDropdownRef = useRef(null);
  
  const [champions, setChampions] = useState([]);

  const router = useRouter();

  useEffect(() => {
    async function fetchStaticData() {
      try {
        const champs = await getDDragonChampions();
        setChampions(Object.values(champs || {}));
      } catch (e) {
        console.error('Failed to fetch champions', e);
      }
    }
    fetchStaticData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target)) {
        setIsRegionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [regionDropdownRef]);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    if (!riotId) { setError('Please enter a Riot ID'); return; }
    if (!riotId.includes('#')) { setError('Include your Tagline (e.g. Faker#KR1)'); return; }
    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) { setError('Invalid format. Use Player#Tag'); return; }
    
    setIsLoading(true);
    router.push(`/lol/profile/${selectedRegion}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
  };

  const freeRotationChamps = champions.slice(0, 10); // Mock rotation for now, or could implement champion-v3

  return (
    <div className="overflow-x-hidden" style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ═══════ SUB-NAVIGATION ═══════ */}
      <nav style={{
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 72,
        zIndex: 40,
      }}>
        <div className="container flex flex-col md:flex-row items-center justify-between p-3 md:p-4 gap-3 md:gap-0">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              background: '#C89B3C', // Gold color for LoL
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trophy className="w-4 h-4" style={{ color: '#111' }} />
            </div>
            <span style={{
              fontFamily: '"Rajdhani", sans-serif', fontWeight: 800, fontSize: '1.1rem',
              textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)'
            }}>LEAGUE OF LEGENDS</span>
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {[
              { href: '#search', label: 'Search', icon: <Search className="w-3.5 h-3.5" /> },
              { href: '/lol/leaderboards', label: 'Leaderboards', icon: <Trophy className="w-3.5 h-3.5" /> },
              { href: '#champions', label: 'Champions', icon: <Users className="w-3.5 h-3.5" /> },
            ].map(item => (
              item.href.startsWith('#') ? (
                <a key={item.label} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  border: '1px solid transparent', transition: 'all 0.2s',
                  fontFamily: '"Rajdhani", sans-serif',
                }}
                  onMouseEnter={e => { e.target.style.color = 'var(--text-primary)'; e.target.style.borderColor = 'var(--border-color)'; }}
                  onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'transparent'; }}
                >
                  {item.icon}{item.label}
                </a>
              ) : (
                <Link key={item.label} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  border: '1px solid transparent', transition: 'all 0.2s',
                  fontFamily: '"Rajdhani", sans-serif',
                }}>
                  {item.icon}{item.label}
                </Link>
              )
            ))}
          </div>
        </div>
      </nav>

      {/* ═══════ HERO SECTION ═══════ */}
      <section id="search" style={{ position: 'relative', paddingTop: '6rem', paddingBottom: '5rem' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 600, background: 'radial-gradient(circle, rgba(200,155,60,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial="hidden" animate="visible" variants={stagger}
          className="container"
          style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '0 1.5rem' }}
        >
          <motion.div variants={fadeUp} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', marginBottom: '1.5rem',
            background: 'rgba(200,155,60,0.08)', border: '1px solid rgba(200,155,60,0.2)',
            color: '#C89B3C', fontSize: '0.75rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.15em',
            fontFamily: '"Rajdhani", sans-serif',
          }}>
            <Swords className="w-4 h-4" />
            LOL STATS TRACKER
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontFamily: '"Rajdhani", sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900, lineHeight: 1.05, marginBottom: '1rem',
            textTransform: 'uppercase', letterSpacing: '0.03em',
          }}>
            BECOME A <span style={{
              background: 'linear-gradient(135deg, #C89B3C, #F0E6D2)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>LEGEND</span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 550,
            margin: '0 auto 2.5rem', lineHeight: 1.6, fontWeight: 400,
          }}>
            Search any Summoner by Riot ID to view detailed match history, champion mastery, rank, and live game status.
          </motion.p>

          <motion.div variants={fadeUp} style={{ position: 'relative', maxWidth: 650, margin: '0 auto', zIndex: 50 }}>
            <form onSubmit={handleSearch} style={{
              display: 'flex', gap: '8px', background: 'var(--bg-secondary)',
              padding: '8px', borderRadius: '12px', border: '1px solid var(--border-color)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
                <div className="relative" ref={regionDropdownRef} style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                    style={{
                      background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
                      border: 'none', borderRadius: '8px', padding: '0 12px 0 16px',
                      fontSize: '0.9rem', fontWeight: 600, outline: 'none', cursor: 'pointer',
                      minWidth: '130px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'
                    }}
                  >
                    {REGIONS.find(r => r.id === selectedRegion)?.name}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {isRegionDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                          borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                          zIndex: 60, minWidth: '100%', padding: '4px',
                          maxHeight: '300px', overflowY: 'auto'
                        }}
                      >
                        {REGIONS.map(r => (
                          <div
                            key={r.id}
                            onClick={() => { setSelectedRegion(r.id); setIsRegionDropdownOpen(false); }}
                            style={{
                              padding: '8px 12px', cursor: 'pointer', borderRadius: '4px',
                              background: selectedRegion === r.id ? 'var(--bg-tertiary)' : 'transparent',
                              color: selectedRegion === r.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                              fontWeight: selectedRegion === r.id ? 700 : 500,
                              fontSize: '0.85rem', textAlign: 'left', transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.target.style.background = 'var(--bg-tertiary)'; e.target.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => {
                                if(selectedRegion !== r.id) {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = 'var(--text-secondary)';
                                }
                            }}
                          >
                            {r.name} <span style={{ opacity: 0.5, fontSize: '0.75rem', marginLeft: '4px' }}>({r.id.toUpperCase()})</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <Search className="w-5 h-5 absolute left-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Riot ID (e.g. Faker#KR1)"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    padding: '16px 16px 16px 44px', fontSize: '1.1rem', color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: '#C89B3C', color: '#111', border: 'none',
                  padding: '0 24px', borderRadius: '8px', fontWeight: 700,
                  fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
                  fontFamily: '"Rajdhani", sans-serif', textTransform: 'uppercase',
                  opacity: isLoading ? 0.7 : 1
                }}
                onMouseEnter={e => !isLoading && (e.target.style.background = '#d9ad4e')}
                onMouseLeave={e => !isLoading && (e.target.style.background = '#C89B3C')}
              >
                {isLoading ? <Activity className="w-5 h-5 animate-spin" /> : 'SEARCH'}
              </button>
            </form>

            {error && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444', padding: '8px 16px', borderRadius: '8px',
                fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
              }}>
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
