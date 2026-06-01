'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Trophy, Crosshair, TrendingUp, Activity, AlertTriangle,
  Shield, Swords, Map, Target, ChevronRight, Users, Layers, Zap, Crown,
  Clock, Star, X, UserCircle, Calendar, Globe
} from 'lucide-react';
import {
  getValorantServerStatus, getCurrentActId, getValorantLeaderboard,
  searchValorantAccounts, getValorantGlobalStats
} from '@/app/actions/valorant';

// ─── Client-side fetchers for public valorant-api.com (no key needed) ──
async function fetchAgents() {
  const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
  const json = await res.json();
  return json.data || [];
}
async function fetchMaps() {
  const res = await fetch('https://valorant-api.com/v1/maps');
  const json = await res.json();
  return json.data || [];
}
async function fetchWeapons() {
  const res = await fetch('https://valorant-api.com/v1/weapons');
  const json = await res.json();
  return json.data || [];
}
async function fetchTiers() {
  const res = await fetch('https://valorant-api.com/v1/competitivetiers');
  const json = await res.json();
  if (!json.data || json.data.length === 0) return [];
  const latest = json.data[json.data.length - 1];
  return (latest.tiers || []).filter(t => t.tierName && t.tierName !== 'INVALID');
}

// ─── Animation Variants ───────────────────────────────────────
const stagger = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const fadeUp = {
  hidden: { opacity: 1, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

// ─── LocalStorage keys ────────────────────────────────────────
const LS_RECENT = 'kp_val_recent';
const LS_FAVORITES = 'kp_val_favorites';

// ─── Main Page ────────────────────────────────────────────────
export default function ValorantTrackerHub() {
  const [riotId, setRiotId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  // Search dropdown state
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' | 'favorites'
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Content data
  const [agents, setAgents] = useState([]);
  const [maps, setMaps] = useState([]);
  const [weapons, setWeapons] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalStats, setGlobalStats] = useState({ playersTracked: 0, seasonEndTime: null });
  const [contentLoading, setContentLoading] = useState(true);

  const router = useRouter();

  // Load recent searches & favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_RECENT);
      if (stored) setRecentSearches(JSON.parse(stored));
      const storedFav = localStorage.getItem(LS_FAVORITES);
      if (storedFav) setFavorites(JSON.parse(storedFav));
    } catch (e) { /* ignore */ }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for matching accounts
  useEffect(() => {
    if (!riotId || riotId.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchValorantAccounts(riotId.split('#')[0]);
        setSearchResults(res.data || []);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [riotId]);

  // Save a player to recent searches
  const saveToRecent = useCallback((gameName, tagLine) => {
    const entry = { gameName, tagLine, timestamp: Date.now() };
    setRecentSearches(prev => {
      const filtered = prev.filter(r => !(r.gameName === gameName && r.tagLine === tagLine));
      const updated = [entry, ...filtered].slice(0, 10);
      localStorage.setItem(LS_RECENT, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove from recent
  const removeFromRecent = useCallback((gameName, tagLine) => {
    setRecentSearches(prev => {
      const updated = prev.filter(r => !(r.gameName === gameName && r.tagLine === tagLine));
      localStorage.setItem(LS_RECENT, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((gameName, tagLine) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.gameName === gameName && f.tagLine === tagLine);
      const updated = exists
        ? prev.filter(f => !(f.gameName === gameName && f.tagLine === tagLine))
        : [{ gameName, tagLine, timestamp: Date.now() }, ...prev].slice(0, 20);
      localStorage.setItem(LS_FAVORITES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorited = (gameName, tagLine) => favorites.some(f => f.gameName === gameName && f.tagLine === tagLine);

  // Navigate to a player profile
  const goToPlayer = (gameName, tagLine) => {
    saveToRecent(gameName, tagLine);
    setSearchOpen(false);
    setRiotId('');
    setIsLoading(true);
    router.push(`/valorant/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
  };

  // Time ago helper
  const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // Time left helper for season countdown
  const formatTimeLeft = (endTimeStr) => {
    if (!endTimeStr) return 'Unknown';
    const diff = new Date(endTimeStr).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h`;
  };

  // Fetch all content data on mount
  useEffect(() => {
    async function fetchAll() {
      try {
        const [agentsData, mapsData, weaponsData, tiersData, statsData] = await Promise.all([
          fetchAgents(), fetchMaps(), fetchWeapons(), fetchTiers(), getValorantGlobalStats()
        ]);
        setAgents(agentsData);
        setMaps(mapsData);
        setWeapons(weaponsData);
        setTiers(tiersData);
        setGlobalStats(statsData || { playersTracked: 0, seasonEndTime: null });

        try {
          const statusRes = await getValorantServerStatus();
          if (!statusRes.error && statusRes.data) {
            const hasIncidents = statusRes.data.incidents?.length > 0;
            const hasMaintenance = statusRes.data.maintenances?.length > 0;
            if (hasMaintenance) setServerStatus({ type: 'warning', message: 'Under Maintenance' });
            else if (hasIncidents) setServerStatus({ type: 'error', message: 'Issues Detected' });
            else setServerStatus({ type: 'success', message: 'All Systems Online' });
          }
        } catch (e) { console.error('Server status fetch skipped:', e); }

        try {
          const actId = await getCurrentActId();
          if (actId) {
            const lbRes = await getValorantLeaderboard(actId, 'ap');
            if (!lbRes.error) setLeaderboard((lbRes.data || []).slice(0, 5));
          }
        } catch (e) { console.error('Leaderboard fetch skipped:', e); }
      } catch (err) {
        console.error('Content fetch error:', err);
      } finally {
        setContentLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    if (!riotId) { setError('Please enter a Riot ID'); return; }
    if (!riotId.includes('#')) { setError('Include your Tagline (e.g. TenZ#SEN)'); return; }
    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) { setError('Invalid format. Use Player#Tag'); return; }
    goToPlayer(gameName, tagLine);
  };

  // Whether dropdown should show search results tab
  const hasQuery = riotId.trim().length >= 2;

  // Role mapping for agent icons
  const roleIcons = {
    'Duelist': <Swords className="w-3.5 h-3.5" />,
    'Sentinel': <Shield className="w-3.5 h-3.5" />,
    'Initiator': <Zap className="w-3.5 h-3.5" />,
    'Controller': <Layers className="w-3.5 h-3.5" />,
  };

  // Filter maps to unique playable ones
  const playableMaps = maps.filter(m =>
    m.displayName && m.displayName !== 'The Range' && m.splash
  );

  // Sort weapons by category for display
  const featuredWeapons = weapons
    .filter(w => w.displayName && w.displayIcon)
    .slice(0, 8);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ═══════ SUB-NAVIGATION ═══════ */}
      <nav style={{
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(15, 25, 35, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 72,
        zIndex: 40,
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              background: 'var(--accent-red)', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}>
              <Target className="w-3.5 h-3.5" style={{ color: '#fff' }} />
            </div>
            <span style={{
              fontFamily: '"Rajdhani", sans-serif', fontWeight: 800, fontSize: '1.1rem',
              textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)'
            }}>VALORANT</span>
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {[
              { href: '#search', label: 'Search', icon: <Search className="w-3.5 h-3.5" /> },
              { href: '/valorant/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
              { href: '#agents', label: 'Agents', icon: <Users className="w-3.5 h-3.5" /> },
              { href: '#maps', label: 'Maps', icon: <Map className="w-3.5 h-3.5" /> },
              { href: '#weapons', label: 'Weapons', icon: <Crosshair className="w-3.5 h-3.5" /> },
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

          {/* Server Status */}
          {serverStatus && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', fontSize: '0.7rem', fontWeight: 700,
              border: '1px solid',
              borderColor: serverStatus.type === 'success' ? 'rgba(34,197,94,0.3)' :
                serverStatus.type === 'warning' ? 'rgba(234,179,8,0.3)' : 'rgba(239,68,68,0.3)',
              color: serverStatus.type === 'success' ? '#22c55e' :
                serverStatus.type === 'warning' ? '#eab308' : '#ef4444',
              background: serverStatus.type === 'success' ? 'rgba(34,197,94,0.06)' :
                serverStatus.type === 'warning' ? 'rgba(234,179,8,0.06)' : 'rgba(239,68,68,0.06)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {serverStatus.type === 'success'
                ? <Activity className="w-3 h-3" />
                : <AlertTriangle className="w-3 h-3" />}
              {serverStatus.message}
            </div>
          )}
        </div>
      </nav>

      {/* ═══════ HERO SECTION ═══════ */}
      <section id="search" style={{ position: 'relative', paddingTop: '5rem', paddingBottom: '4rem' }}>
        {/* Background effects */}
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: 900, height: 500, background: 'radial-gradient(circle, rgba(255,70,85,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none',
        }} />

        <motion.div
          initial="hidden" animate="visible" variants={stagger}
          className="container"
          style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '0 1.5rem' }}
        >
          {/* Badge */}
          <motion.div variants={fadeUp} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', marginBottom: '1.5rem',
            background: 'rgba(255,70,85,0.08)', border: '1px solid rgba(255,70,85,0.2)',
            color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.15em',
            fontFamily: '"Rajdhani", sans-serif',
          }}>
            <Target className="w-4 h-4" />
            VALORANT STATS TRACKER
          </motion.div>

          {/* Title */}
          <motion.h1 variants={fadeUp} style={{
            fontFamily: '"Rajdhani", sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900, lineHeight: 1.05, marginBottom: '1rem',
            textTransform: 'uppercase', letterSpacing: '0.03em',
          }}>
            TRACK YOUR <span style={{
              background: 'linear-gradient(135deg, #ff4655, #ff8a65)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>LEGACY</span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 550,
            margin: '0 auto 2.5rem', lineHeight: 1.6, fontWeight: 400,
          }}>
            Search any player by Riot ID to view detailed match history, agent mastery, K/D ratio, win rate, and competitive rank.
          </motion.p>

          {/* ═══ Enhanced Search Bar with Dropdown ═══ */}
          <motion.div variants={fadeUp} ref={searchRef} style={{ position: 'relative', maxWidth: 600, margin: '0 auto', zIndex: 50 }}>
            <form onSubmit={handleSearch}>
              {/* Glow effect */}
              <div style={{
                position: 'absolute', inset: '-2px', top: '-2px',
                background: 'linear-gradient(135deg, rgba(255,70,85,0.4), rgba(255,138,101,0.2), rgba(255,70,85,0.4))',
                filter: 'blur(8px)', opacity: searchOpen ? 0.5 : 0.3, transition: 'opacity 0.3s',
                height: 56, zIndex: 0,
              }} />
              <div style={{
                position: 'relative', display: 'flex', alignItems: 'center',
                background: searchOpen ? 'rgba(20,30,42,0.99)' : 'rgba(15,25,35,0.95)',
                border: '1px solid',
                borderColor: searchOpen ? 'rgba(255,70,85,0.35)' : 'rgba(255,70,85,0.2)',
                borderBottom: searchOpen ? '1px solid var(--border-color)' : undefined,
                padding: '4px', transition: 'all 0.2s', zIndex: 2,
              }}>
                <Search className="w-5 h-5" style={{ color: 'var(--text-muted)', marginLeft: '16px', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  id="riot-id-search"
                  type="text"
                  placeholder="Search Riot ID (e.g. TenZ#SEN)"
                  value={riotId}
                  onChange={e => { setRiotId(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  autoComplete="off"
                  style={{
                    flex: 1, background: 'none', border: 'none', color: 'var(--text-primary)',
                    fontSize: '1rem', padding: '14px 16px', outline: 'none',
                    fontFamily: '"Outfit", sans-serif',
                  }}
                />
                {riotId && (
                  <button type="button" onClick={() => { setRiotId(''); setSearchResults([]); inputRef.current?.focus(); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button id="search-btn" type="submit" disabled={isLoading}
                  style={{
                    background: 'var(--accent-red)', color: '#fff', fontWeight: 800,
                    padding: '14px 32px', border: 'none', cursor: 'pointer',
                    fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                    fontFamily: '"Rajdhani", sans-serif', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    opacity: isLoading ? 0.6 : 1,
                  }}>
                  {isLoading ? (
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  ) : 'SEARCH'}
                </button>
              </div>
            </form>

            {/* ═══ Search Dropdown ═══ */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'rgba(20,30,42,0.99)', border: '1px solid rgba(255,70,85,0.2)',
                    borderTop: 'none', zIndex: 100,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    maxHeight: 420, overflowY: 'auto',
                  }}
                >
                  <div style={{ display: 'flex' }}>
                    {/* Left Sidebar Tabs */}
                    <div style={{
                      width: 160, borderRight: '1px solid var(--border-color)',
                      padding: '0.75rem 0', flexShrink: 0,
                    }}>
                      {hasQuery && (
                        <button onClick={() => setActiveTab('results')}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            padding: '10px 16px', background: activeTab === 'results' ? 'rgba(255,70,85,0.08)' : 'none',
                            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                            color: activeTab === 'results' ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontSize: '0.8rem', fontWeight: 700, textAlign: 'left',
                            borderLeft: activeTab === 'results' ? '2px solid var(--accent-red)' : '2px solid transparent',
                          }}>
                          <Search className="w-3.5 h-3.5" /> Search Results
                        </button>
                      )}
                      <button onClick={() => setActiveTab('recent')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                          padding: '10px 16px', background: activeTab === 'recent' ? 'rgba(255,70,85,0.08)' : 'none',
                          border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                          color: activeTab === 'recent' ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontSize: '0.8rem', fontWeight: 700, textAlign: 'left',
                          borderLeft: activeTab === 'recent' ? '2px solid var(--accent-red)' : '2px solid transparent',
                        }}>
                        <Clock className="w-3.5 h-3.5" /> Recent Players
                      </button>
                      <button onClick={() => setActiveTab('favorites')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                          padding: '10px 16px', background: activeTab === 'favorites' ? 'rgba(255,70,85,0.08)' : 'none',
                          border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                          color: activeTab === 'favorites' ? '#ffb400' : 'var(--text-muted)',
                          fontSize: '0.8rem', fontWeight: 700, textAlign: 'left',
                          borderLeft: activeTab === 'favorites' ? '2px solid #ffb400' : '2px solid transparent',
                        }}>
                        <Star className="w-3.5 h-3.5" /> Favorites
                      </button>
                    </div>

                    {/* Right Content Panel */}
                    <div style={{ flex: 1, padding: '0.75rem 0', minHeight: 180 }}>

                      {/* ── Search Results Tab ── */}
                      {(hasQuery && activeTab === 'results') && (
                        <div>
                          <div style={{
                            padding: '4px 16px 8px', fontSize: '0.65rem', fontWeight: 800,
                            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em',
                          }}>Players</div>

                          {/* Always show the typed query as first option */}
                          {riotId.includes('#') && (
                            <button onClick={() => { const [g, t] = riotId.split('#'); if (g && t) goToPlayer(g, t); }}
                              className="search-dropdown-row"
                              style={{
                                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                                padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--text-primary)', textAlign: 'left', transition: 'background 0.15s',
                              }}>
                              <div style={{
                                width: 32, height: 32, background: 'rgba(255,70,85,0.1)', border: '1px solid rgba(255,70,85,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                <UserCircle className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />
                              </div>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{riotId.split('#')[0]}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 3 }}>#{riotId.split('#')[1]}</span>
                              </div>
                            </button>
                          )}

                          {isSearching ? (
                            <div style={{ padding: '1.5rem 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Searching...</div>
                          ) : searchResults.length > 0 ? (
                            searchResults.map((acc, i) => (
                              <button key={acc.puuid || i} onClick={() => goToPlayer(acc.game_name, acc.tag_line)}
                                className="search-dropdown-row"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                                  padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                                  color: 'var(--text-primary)', textAlign: 'left', transition: 'background 0.15s',
                                }}>
                                <div style={{
                                  width: 32, height: 32, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                  <UserCircle className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div>
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{acc.game_name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 3 }}>#{acc.tag_line}</span>
                                  </div>
                                  {acc.last_updated && (
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 1 }}>
                                      Last Active: {timeAgo(new Date(acc.last_updated).getTime())}
                                    </div>
                                  )}
                                </div>
                                <button onClick={(ev) => { ev.stopPropagation(); toggleFavorite(acc.game_name, acc.tag_line); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                                  <Star className="w-3.5 h-3.5" style={{
                                    color: isFavorited(acc.game_name, acc.tag_line) ? '#ffb400' : 'var(--text-muted)',
                                    fill: isFavorited(acc.game_name, acc.tag_line) ? '#ffb400' : 'none',
                                  }} />
                                </button>
                              </button>
                            ))
                          ) : (
                            <div style={{ padding: '1.5rem 16px', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                              {!riotId.includes('#') ? (
                                <>
                                  <span style={{ color: 'var(--text-secondary)' }}>No players found in cache.</span><br/>
                                  Type the full Riot ID with # tag to search globally.
                                </>
                              ) : (
                                'Press Enter to search for this Riot ID.'
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Recent Players Tab ── */}
                      {activeTab === 'recent' && (
                        <div>
                          <div style={{
                            padding: '4px 16px 8px', fontSize: '0.65rem', fontWeight: 800,
                            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em',
                          }}>Recent Searches</div>

                          {recentSearches.length === 0 ? (
                            <div style={{ padding: '2rem 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              No recent searches yet
                            </div>
                          ) : (
                            recentSearches.map((r, i) => (
                              <div key={`${r.gameName}-${r.tagLine}-${i}`}
                                className="search-dropdown-row"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '10px',
                                  padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s',
                                }}
                                onClick={() => goToPlayer(r.gameName, r.tagLine)}>
                                <div style={{
                                  width: 32, height: 32, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                  <UserCircle className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{r.gameName}</span>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 3 }}>#{r.tagLine}</span>
                                  {r.timestamp && (
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 1 }}>{timeAgo(r.timestamp)}</div>
                                  )}
                                </div>
                                <button onClick={(ev) => { ev.stopPropagation(); toggleFavorite(r.gameName, r.tagLine); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                                  <Star className="w-3.5 h-3.5" style={{
                                    color: isFavorited(r.gameName, r.tagLine) ? '#ffb400' : 'var(--text-muted)',
                                    fill: isFavorited(r.gameName, r.tagLine) ? '#ffb400' : 'none',
                                  }} />
                                </button>
                                <button onClick={(ev) => { ev.stopPropagation(); removeFromRecent(r.gameName, r.tagLine); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--text-muted)' }}>
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* ── Favorites Tab ── */}
                      {activeTab === 'favorites' && (
                        <div>
                          <div style={{
                            padding: '4px 16px 8px', fontSize: '0.65rem', fontWeight: 800,
                            color: '#ffb400', textTransform: 'uppercase', letterSpacing: '0.12em',
                          }}>Favorite Players</div>

                          {favorites.length === 0 ? (
                            <div style={{ padding: '2rem 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              No favorites yet — click ★ on any player
                            </div>
                          ) : (
                            favorites.map((f, i) => (
                              <div key={`${f.gameName}-${f.tagLine}-${i}`}
                                className="search-dropdown-row"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '10px',
                                  padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s',
                                }}
                                onClick={() => goToPlayer(f.gameName, f.tagLine)}>
                                <div style={{
                                  width: 32, height: 32, background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.2)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                  <Star className="w-3.5 h-3.5" style={{ color: '#ffb400', fill: '#ffb400' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.gameName}</span>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 3 }}>#{f.tagLine}</span>
                                </div>
                                <button onClick={(ev) => { ev.stopPropagation(); toggleFavorite(f.gameName, f.tagLine); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#ef4444' }}>
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            {error && (
              <div style={{
                marginTop: '8px', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, textAlign: 'left', paddingLeft: 4,
              }}>
                {error}
              </div>
            )}

            {/* ═══ Global Stats Banner (Season & Players) ═══ */}
            <motion.div variants={fadeUp} style={{
              marginTop: '1.25rem', background: 'var(--bg-card)',
              border: '1px solid var(--border-color)', borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px', gap: '24px', position: 'relative', zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Season Ends
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', lineHeight: 1.1 }}>
                    {formatTimeLeft(globalStats.seasonEndTime)}
                  </div>
                </div>
              </div>
              
              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Players Tracked
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', lineHeight: 1.1 }}>
                    {globalStats.playersTracked.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Decorative search icon background box like tracker.gg */}
              <div style={{
                width: '28px', height: '28px', background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px',
                marginLeft: '8px'
              }}>
                <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </div>
            </motion.div>

          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ QUICK STATS ROW ═══════ */}
      <section style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}
          >
            {[
              { label: 'Playable Agents', value: contentLoading ? '—' : agents.length, icon: <Users className="w-5 h-5" />, color: '#ff4655' },
              { label: 'Active Maps', value: contentLoading ? '—' : playableMaps.length, icon: <Map className="w-5 h-5" />, color: '#00bda5' },
              { label: 'Competitive Ranks', value: contentLoading ? '—' : tiers.length, icon: <Crown className="w-5 h-5" />, color: '#7b46ff' },
              { label: 'Weapons Arsenal', value: contentLoading ? '—' : weapons.length, icon: <Crosshair className="w-5 h-5" />, color: '#ffb400' },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} style={{
                padding: '1.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
                borderRight: i < 3 ? '1px solid var(--border-color)' : 'none',
              }}>
                <div style={{
                  width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${stat.color}10`, color: stat.color, border: `1px solid ${stat.color}20`,
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '1.75rem', fontWeight: 900, fontFamily: '"Rajdhani", sans-serif',
                    lineHeight: 1, color: 'var(--text-primary)',
                  }}>{stat.value}</div>
                  <div style={{
                    fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2,
                  }}>{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ FEATURED AGENTS ═══════ */}
      <section id="agents" style={{ padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
            {/* Section Header */}
            <motion.div variants={fadeUp} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem',
            }}>
              <div>
                <h2 style={{
                  fontFamily: '"Rajdhani", sans-serif', fontSize: '1.5rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ width: 3, height: 22, background: 'var(--accent-red)', display: 'inline-block' }} />
                  Agent Roster
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  All playable agents in VALORANT
                </p>
              </div>
            </motion.div>

            {/* Agent Grid */}
            {contentLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 200 }} />
                ))}
              </div>
            ) : (
              <motion.div variants={stagger} style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem',
              }}>
                {agents.slice(0, 12).map(agent => (
                  <motion.div key={agent.uuid} variants={fadeUp}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      cursor: 'default', transition: 'all 0.25s',
                      position: 'relative',
                    }}
                    className="agent-card-hover"
                  >
                    {/* Agent Background Gradient */}
                    <div style={{
                      height: 140, position: 'relative',
                      background: `linear-gradient(135deg, #${agent.backgroundGradientColors?.[0]?.slice(0, 6) || '1f2326'}40, #${agent.backgroundGradientColors?.[2]?.slice(0, 6) || '17232d'}60)`,
                    }}>
                      {agent.displayIcon && (
                        <img
                          src={agent.displayIcon}
                          alt={agent.displayName}
                          style={{
                            position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
                            width: '80%', height: 'auto', objectFit: 'contain',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ padding: '0.75rem' }}>
                      <p style={{
                        fontFamily: '"Rajdhani", sans-serif', fontWeight: 800, fontSize: '0.95rem',
                        textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.2,
                      }}>{agent.displayName}</p>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px',
                        color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {agent.role?.displayIcon && (
                          <img src={agent.role.displayIcon} alt="" style={{ width: 12, height: 12, filter: 'brightness(0.7)' }} />
                        )}
                        {agent.role?.displayName || 'Unknown'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Show All Button */}
            {agents.length > 12 && (
              <motion.div variants={fadeUp} style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  onClick={() => {
                    const section = document.getElementById('agents');
                    // Toggle showing all agents — just scroll for now
                  }}
                  style={{
                    background: 'none', border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)', padding: '10px 28px', cursor: 'pointer',
                    fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', fontFamily: '"Rajdhani", sans-serif',
                    transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px',
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--accent-red)'; e.target.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-secondary)'; }}
                >
                  View All {agents.length} Agents <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════ LEADERBOARD + MAPS SPLIT ═══════ */}
      <section style={{ padding: '0 0 4rem', borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}
            className="split-grid"
          >
            {/* LEADERBOARD PREVIEW */}
            <motion.div variants={fadeUp} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            }}>
              <div style={{
                padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.01)',
              }}>
                <h2 style={{
                  fontFamily: '"Rajdhani", sans-serif', fontWeight: 800, fontSize: '1rem',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <Trophy className="w-4 h-4" style={{ color: '#ffb400' }} />
                  Top Ranked — AP
                </h2>
                <Link href="/valorant/leaderboard" style={{
                  color: 'var(--accent-red)', textDecoration: 'none', fontSize: '0.72rem',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  Full Board <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {contentLoading ? (
                <div style={{ padding: '1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6 }} />
                  ))}
                </div>
              ) : leaderboard.length > 0 ? (
                <div>
                  {leaderboard.map((player, i) => {
                    const isAnonymous = !player.gameName;
                    const rankColors = ['#fbbf24', '#94a3b8', '#d97706'];
                    return (
                      <div key={player.puuid || i} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 1.25rem',
                        borderBottom: i < 4 ? '1px solid var(--border-color)' : 'none',
                        transition: 'background 0.15s',
                      }}
                        className="leaderboard-row"
                      >
                        <div style={{
                          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '0.8rem', fontFamily: '"Rajdhani", sans-serif',
                          color: rankColors[i] || 'var(--text-muted)',
                          background: i < 3 ? `${rankColors[i]}12` : 'transparent',
                          border: i < 3 ? `1px solid ${rankColors[i]}30` : '1px solid transparent',
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {isAnonymous ? (
                            <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontStyle: 'italic', fontSize: '0.85rem' }}>Secret Agent</span>
                          ) : (
                            <Link href={`/valorant/${encodeURIComponent(player.gameName)}/${encodeURIComponent(player.tagLine)}`}
                              style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                              {player.gameName}
                              <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem', marginLeft: 3 }}>#{player.tagLine}</span>
                            </Link>
                          )}
                        </div>
                        <div style={{
                          fontWeight: 900, fontSize: '0.95rem', fontFamily: '"Rajdhani", sans-serif',
                          color: 'var(--text-primary)',
                        }}>
                          {player.rankedRating}
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: 3 }}>RR</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Leaderboard data unavailable
                </div>
              )}
            </motion.div>

            {/* POPULAR MAPS */}
            <motion.div variants={fadeUp} id="maps">
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem',
              }}>
                <h2 style={{
                  fontFamily: '"Rajdhani", sans-serif', fontWeight: 800, fontSize: '1rem',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ width: 3, height: 18, background: 'var(--accent-cyan)', display: 'inline-block' }} />
                  Map Pool
                </h2>
              </div>

              {contentLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 120 }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {playableMaps.slice(0, 6).map(map => (
                    <div key={map.uuid} style={{
                      position: 'relative', height: 120,
                      border: '1px solid var(--border-color)', cursor: 'default',
                      transition: 'all 0.25s',
                    }} className="map-card-hover">
                      <img
                        src={map.splash}
                        alt={map.displayName}
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                        className="map-img"
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)',
                      }} />
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: '0.75rem 1rem',
                      }}>
                        <p style={{
                          fontFamily: '"Rajdhani", sans-serif', fontWeight: 800,
                          fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em',
                          color: '#fff',
                        }}>{map.displayName}</p>
                        {map.coordinates && (
                          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                            {map.coordinates}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ WEAPONS ARSENAL ═══════ */}
      <section id="weapons" style={{
        padding: '4rem 0', borderTop: '1px solid var(--border-color)',
      }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
            <motion.div variants={fadeUp} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem',
            }}>
              <div>
                <h2 style={{
                  fontFamily: '"Rajdhani", sans-serif', fontSize: '1.5rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.03em',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ width: 3, height: 22, background: '#ffb400', display: 'inline-block' }} />
                  Weapons Arsenal
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Full weapon catalog in VALORANT
                </p>
              </div>
            </motion.div>

            {contentLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 100 }} />
                ))}
              </div>
            ) : (
              <motion.div variants={stagger} style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem',
              }}>
                {featuredWeapons.map(weapon => (
                  <motion.div key={weapon.uuid} variants={fadeUp} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                    transition: 'all 0.2s', cursor: 'default',
                  }} className="weapon-card-hover">
                    <div style={{
                      width: 90, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <img
                        src={weapon.displayIcon}
                        alt={weapon.displayName}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'brightness(0.85) contrast(1.1)' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: '"Rajdhani", sans-serif', fontWeight: 800, fontSize: '1rem',
                        textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.2,
                      }}>{weapon.displayName}</p>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '4px' }}>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {weapon.shopData?.categoryText || weapon.category?.split('::').pop() || '—'}
                        </span>
                        {weapon.shopData?.cost != null && (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, color: '#ffb400',
                            display: 'flex', alignItems: 'center', gap: '2px',
                          }}>
                            ¤ {weapon.shopData.cost}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════ FEATURE HIGHLIGHTS ═══════ */}
      <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}
          >
            {[
              {
                icon: <Crosshair className="w-5 h-5" />, color: '#ff4655', title: 'Detailed Stats',
                desc: 'Track your K/D, combat score, headshot percentages, and ADR across all matches.',
              },
              {
                icon: <Trophy className="w-5 h-5" />, color: '#00bda5', title: 'Match History',
                desc: 'Review past matches with team performance, scoreboards, and round-by-round data.',
              },
              {
                icon: <TrendingUp className="w-5 h-5" />, color: '#ffb400', title: 'Agent Mastery',
                desc: 'See which agents you perform best with — win rates, K/D, and ACS per agent.',
              },
            ].map(feature => (
              <motion.div key={feature.title} variants={fadeUp} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                padding: '2rem', transition: 'all 0.2s',
              }} className="feature-card-hover">
                <div style={{
                  width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${feature.color}10`, color: feature.color,
                  border: `1px solid ${feature.color}20`, marginBottom: '1rem',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontFamily: '"Rajdhani", sans-serif', fontWeight: 800, fontSize: '1.15rem',
                  textTransform: 'uppercase', marginBottom: '0.5rem',
                }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ COMPLIANCE ═══════ */}
      <section style={{ padding: '3rem 0 4rem', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)',
            padding: '2rem', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: 3, height: 24,
              background: 'var(--accent-red)',
            }} />
            <h4 style={{
              fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem',
              fontFamily: '"Rajdhani", sans-serif',
            }}>Compliance & Privacy</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.8 }}>
              KhelPediA complies with Riot Games&apos; official API policies. By searching for a player, you acknowledge that
              detailed match history and statistics are only available for players who have explicitly <strong style={{ color: 'var(--text-secondary)' }}>opted-in</strong> to
              our service via Riot Sign On (RSO). If you wish to display your own stats, please log in and verify your account.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ INLINE STYLES ═══════ */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .agent-card-hover:hover {
          border-color: var(--accent-red) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(255, 70, 85, 0.1);
        }

        .map-card-hover:hover {
          border-color: var(--accent-cyan) !important;
        }
        .map-card-hover:hover .map-img {
          transform: scale(1.08);
        }

        .weapon-card-hover:hover {
          border-color: rgba(255, 180, 0, 0.4) !important;
          background: var(--bg-card-hover) !important;
        }

        .feature-card-hover:hover {
          border-color: var(--accent-red) !important;
          transform: translateY(-2px);
        }

        .leaderboard-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .search-dropdown-row:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        .split-grid {
          grid-template-columns: 1fr 1.4fr;
        }

        @media (max-width: 768px) {
          .split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
