import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Vacation } from '../types';
import { aiService } from '../services/aiService';
import VacationCard from '../components/Vacations/VacationCard';
import { getImageUrl } from '../services/api';

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className ?? 'w-5 h-5'} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
  </svg>
);
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className ?? 'w-5 h-5'} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
  </svg>
);
const AlertIcon = () => (
  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
  </svg>
);
const FaceIcon = () => (
  <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"/>
  </svg>
);
const ArrowDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
  </svg>
);
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className ?? 'w-4 h-4'} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
  </svg>
);

const SUGGESTIONS = [
  'Romantic beach vacation under $1,500',
  'Adventure trip in Europe next summer',
  'Family-friendly resort with warm weather',
  'Budget city break in Asia',
];

const SmartSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<Vacation[] | null>(null);
  const [matched, setMatched] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const lastRunSearchKey = useRef<string | null>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Pressing Enter in the navbar search sends { state: { runSearch: true } } —
  // run the search immediately instead of waiting for the debounced sync above.
  useEffect(() => {
    const state = location.state as { runSearch?: boolean } | null;
    if (state?.runSearch && location.key !== lastRunSearchKey.current) {
      lastRunSearchKey.current = location.key;
      handleSearch(searchParams.get('q') || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Scroll the results (or empty-state) into view once a search completes,
  // regardless of whether it was triggered from this page or the navbar.
  useEffect(() => {
    if (results !== null) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  const handleSearch = async (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await aiService.semanticSearch(searchQuery);
      setResults(res.data.data as Vacation[]);
      setMatched(searchQuery);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error ?? 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => { setResults(null); setMatched(''); setQuery(''); setError(null); };

  return (
    <div className="min-h-screen">

      {/* ══════════════════════════════════════════
          HERO — full-width AI-generated photo bg
          ══════════════════════════════════════════ */}
      <section className="relative h-[520px] sm:h-[580px] flex flex-col items-center justify-center overflow-hidden">

        {/* Hero background — Magnific/Freepik AI-generated travel photo */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl('hero-search.jpg')}
            alt="Tropical beach travel destination"
            className="w-full h-full object-cover object-center"
          />
          {/* Rich dark gradient overlay — bottom-heavy for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/75" />
          {/* Emerald colour tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-transparent to-accent-900/20" />
        </div>

        {/* Floating particles */}
        <motion.div
          animate={{ y: [0, -14, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 left-[10%] w-32 h-32 rounded-full bg-primary-400/10 blur-2xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 12, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-16 right-[12%] w-48 h-48 rounded-full bg-accent-400/10 blur-3xl pointer-events-none"
        />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto w-full">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 border border-white/25 text-white/90 text-xs font-bold rounded-full backdrop-blur-sm">
              <SparklesIcon className="w-3.5 h-3.5" />
              AI-Powered Semantic Search
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-3 drop-shadow-2xl"
          >
            Find Your Perfect
            <span className="block bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
              Destination
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-white/70 text-base mb-8 max-w-lg mx-auto"
          >
            Describe your dream vacation in plain English — AI finds the best matches instantly.
          </motion.p>

          {/* ── SEARCH BAR ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex gap-2 bg-white/10 border border-white/25 backdrop-blur-md rounded-2xl p-2 shadow-2xl">
              <div className="relative flex-1">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. romantic beach under $2,000…"
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-white placeholder-white/40 text-sm font-medium outline-none"
                  aria-label="Smart search query"
                  disabled={loading}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={!query.trim() || loading}
                className="flex items-center gap-2 px-5 py-3 bg-accent-500 hover:bg-accent-400 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-lg whitespace-nowrap text-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Searching…
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Suggestion pills — stay visible even after a search */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2 justify-center mt-4"
            >
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearch(s); }}
                  className="text-xs px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white/80 hover:text-white rounded-full border border-white/20 transition-all font-medium cursor-pointer backdrop-blur-sm"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/40 flex flex-col items-center gap-1"
        >
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
            <ArrowDownIcon />
          </motion.div>
        </motion.div>

        {/* Wave bottom divider */}
        <div className="absolute bottom-0 inset-x-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 60L1440 60L1440 30C1100 55 840 10 720 30C600 50 300 8 0 30L0 60Z" className="fill-emerald-50 dark:fill-gray-950"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          RESULTS AREA
          ══════════════════════════════════════════ */}
      <div ref={resultsRef} className="max-w-6xl mx-auto px-4 py-10">

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 rounded-2xl p-4"
          >
            <AlertIcon />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {results !== null && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                    Results for{' '}
                    <span className="text-primary-600 dark:text-primary-400">"{matched}"</span>
                  </h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                    {results.length} vacation{results.length !== 1 ? 's' : ''} found by AI
                  </p>
                </div>
                <button
                  onClick={clearSearch}
                  className="group inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold cursor-pointer transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span className="border-b border-transparent group-hover:border-current">New Search</span>
                </button>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-20 text-gray-400 dark:text-gray-600">
                  <FaceIcon />
                  <p className="text-lg font-display font-semibold mt-3">No matches found</p>
                  <p className="text-sm mt-1">Try a broader query or different keywords.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((v, i) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.4 }}
                    >
                      <VacationCard vacation={v} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state — before search */}
        {results === null && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-400 dark:text-gray-600"
          >
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-primary-400" />
            </div>
            <p className="text-base font-medium text-gray-500 dark:text-gray-400">
              Type a description above to find your perfect trip
            </p>
            <p className="text-sm mt-1">Our AI understands natural language — describe any vacation you can imagine.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SmartSearch;
