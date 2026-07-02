import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TripPlan, TripPlanDay } from '../types';
import api from '../services/api';

const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
  </svg>
);
const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
  </svg>
);
const ForkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v12m0-12C12 5.25 9.75 3 9.75 3m2.25 5.25C12 5.25 14.25 3 14.25 3M9.75 21H12m0 0h2.25M12 12a4.5 4.5 0 010-9 4.5 4.5 0 010 9z"/>
  </svg>
);
const LightbulbIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
  </svg>
);
const AlertIcon = () => (
  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
  </svg>
);

const LOADING_STEPS = [
  'Researching destination…',
  'Mapping out your days…',
  'Finding top restaurants…',
  'Adding local tips…',
  'Finalising your itinerary…',
];

const SUGGESTIONS = ['Tokyo, Japan', 'Santorini, Greece', 'New York, USA', 'Bali, Indonesia', 'Paris, France', 'Reykjavik, Iceland'];

const DESTINATIONS = [
  { name: 'Tokyo', country: 'Japan', flag: 'JP' },
  { name: 'Paris', country: 'France', flag: 'FR' },
  { name: 'Rome', country: 'Italy', flag: 'IT' },
  { name: 'Bali', country: 'Indonesia', flag: 'ID' },
  { name: 'New York', country: 'USA', flag: 'US' },
  { name: 'Santorini', country: 'Greece', flag: 'GR' },
  { name: 'Barcelona', country: 'Spain', flag: 'ES' },
  { name: 'Reykjavik', country: 'Iceland', flag: 'IS' },
  { name: 'Dubai', country: 'UAE', flag: 'AE' },
  { name: 'Prague', country: 'Czech Republic', flag: 'CZ' },
  { name: 'Amsterdam', country: 'Netherlands', flag: 'NL' },
  { name: 'Lisbon', country: 'Portugal', flag: 'PT' },
  { name: 'Kyoto', country: 'Japan', flag: 'JP' },
  { name: 'Cape Town', country: 'South Africa', flag: 'ZA' },
  { name: 'Sydney', country: 'Australia', flag: 'AU' },
  { name: 'Istanbul', country: 'Turkey', flag: 'TR' },
  { name: 'Vienna', country: 'Austria', flag: 'AT' },
  { name: 'Athens', country: 'Greece', flag: 'GR' },
  { name: 'Singapore', country: 'Singapore', flag: 'SG' },
  { name: 'Bangkok', country: 'Thailand', flag: 'TH' },
  { name: 'Marrakech', country: 'Morocco', flag: 'MA' },
  { name: 'Amalfi Coast', country: 'Italy', flag: 'IT' },
  { name: 'Copenhagen', country: 'Denmark', flag: 'DK' },
  { name: 'Havana', country: 'Cuba', flag: 'CU' },
];

const DayCard: React.FC<{ day: TripPlanDay; index: number }> = ({ day, index }) => (
  <div className="relative pl-10 pb-8 last:pb-0">
    {/* Timeline line */}
    <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-primary-100 dark:bg-primary-900/50 last:hidden" />
    {/* Day number bubble */}
    <div className="absolute left-0 top-1 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold ring-4 ring-sky-50 dark:ring-gray-950 shadow-sm" style={{ animationDelay: `${index * 80}ms` }}>
      {day.day}
    </div>

    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700/60 p-5">
      <h3 className="font-display font-bold text-gray-900 dark:text-white text-base mb-4">
        Day {day.day} — {day.theme}
      </h3>

      <div className="space-y-3">
        {/* Activities */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Activities</p>
          <ul className="space-y-1.5">
            {day.activities.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="w-1.5 h-1.5 mt-2 rounded-full bg-primary-400 flex-shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Restaurant pick */}
        <div className="flex items-start gap-3 py-3 px-3.5 bg-accent-50 dark:bg-accent-900/20 rounded-xl border border-accent-100 dark:border-accent-700/30">
          <div className="w-7 h-7 bg-accent-100 dark:bg-accent-900/40 rounded-lg flex items-center justify-center text-accent-600 dark:text-accent-400 flex-shrink-0">
            <ForkIcon />
          </div>
          <div>
            <p className="text-xs font-bold text-accent-700 dark:text-accent-400 mb-0.5">Restaurant Pick</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{day.restaurant}</p>
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-start gap-3 py-3 px-3.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-700/30">
          <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
            <LightbulbIcon />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{day.tip}</p>
        </div>
      </div>
    </div>
  </div>
);

type Pace = 'slow' | 'fast';

const TripPlanner: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [days,        setDays]        = useState(7);
  const [pace,        setPace]        = useState<Pace>('slow');
  const [plan,        setPlan]        = useState<TripPlan | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [loadStep,    setLoadStep]    = useState(0);
  const [error,       setError]       = useState<string | null>(null);
  const [dropdownOpen,      setDropdownOpen]      = useState(false);
  const [dropdownItems,     setDropdownItems]     = useState<typeof DESTINATIONS>([]);
  const [highlightedIndex,  setHighlightedIndex]  = useState(-1);

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setLoadStep(s => (s + 1) % LOADING_STEPS.length), 1500);
    return () => clearInterval(iv);
  }, [loading]);

  const handleGenerate = async (dest?: string) => {
    const target = (dest ?? destination).trim();
    if (!target) return;
    if (dest) setDestination(dest);

    setLoading(true);
    setError(null);
    setPlan(null);
    setLoadStep(0);

    try {
      const res = await api.post('/ai/trip-plan', { destination: target, days, pace });
      setPlan(res.data as TripPlan);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error ?? 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-3">

      {/* Header */}
      <div className="text-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-2">
          <MapPinIcon />
        </div>
        <h1 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-1">AI Trip Planner</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-sm">
          Type any destination and AI will build a personalised day-by-day itinerary with activities, restaurants, and local tips.
        </p>
      </div>

      {/* Input card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card border border-gray-100 dark:border-gray-700/60 p-6 mb-8">
        <label htmlFor="destination-input" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Where do you want to go?
        </label>

        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <MapPinIcon />
          </div>
          <input
            id="destination-input"
            type="text"
            value={destination}
            onChange={e => {
              const value = e.target.value;
              setDestination(value);
              setDropdownItems(DESTINATIONS.filter(d =>
                d.name.toLowerCase().includes(value.toLowerCase()) ||
                d.country.toLowerCase().includes(value.toLowerCase())
              ).slice(0, 8));
              setDropdownOpen(true);
              setHighlightedIndex(-1);
            }}
            onKeyDown={e => {
              if (dropdownOpen && dropdownItems.length > 0) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlightedIndex(i => (i + 1) % dropdownItems.length);
                  return;
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlightedIndex(i => (i - 1 + dropdownItems.length) % dropdownItems.length);
                  return;
                }
                if (e.key === 'Enter' && highlightedIndex >= 0) {
                  e.preventDefault();
                  const dest = dropdownItems[highlightedIndex];
                  setDestination(dest.name + ', ' + dest.country);
                  setDropdownOpen(false);
                  return;
                }
                if (e.key === 'Escape') {
                  setDropdownOpen(false);
                  return;
                }
              }
              if (e.key === 'Enter') handleGenerate();
            }}
            placeholder="e.g. Tokyo, Japan  ·  Amalfi Coast, Italy  ·  Anywhere!"
            className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all shadow-sm"
            disabled={loading}
          />

          {dropdownOpen && destination.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-green-100 rounded-xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto">
              {dropdownItems.map((dest, i) => (
                <button key={dest.name} type="button"
                  onMouseDown={() => { setDestination(dest.name + ', ' + dest.country); setDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-left transition-colors ${
                    i === highlightedIndex ? 'bg-green-50' : ''
                  }`}
                >
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5 min-w-[24px] text-center">
                    {dest.flag}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{dest.name}</div>
                    <div className="text-xs text-gray-400">{dest.country}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => setDestination(s)}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors border border-primary-100 dark:border-primary-700/40 disabled:opacity-50 font-medium cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Days stepper */}
        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Trip length</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setDays(d => Math.max(1, d - 1))} disabled={loading || days <= 1}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors cursor-pointer font-bold">−</button>
            <span className="w-20 text-center text-sm font-bold text-gray-800 dark:text-gray-200">
              {days} day{days !== 1 ? 's' : ''}
            </span>
            <button onClick={() => setDays(d => Math.min(30, d + 1))} disabled={loading || days >= 30}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors cursor-pointer font-bold">+</button>
          </div>
        </div>

        {/* Pace toggle */}
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Trip pace</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPace('slow')}
              disabled={loading}
              style={pace === 'slow' ? { borderColor: '#2f7f33', backgroundColor: '#f0fdf1', color: '#2f7f33' } : {}}
              className="flex flex-row items-center gap-3 py-2.5 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 transition-all cursor-pointer disabled:opacity-50 text-sm font-semibold"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.7.7m13.16 13.16.7.7M1 12h2m18 0h2m-4.22-7.78-.7.7M5.62 18.38l-.7.7"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
              </div>
              <span className="text-left">
                Relaxed
                <span className="block text-xs font-normal text-gray-400">2–3 stops/day</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPace('fast')}
              disabled={loading}
              style={pace === 'fast' ? { borderColor: '#2f7f33', backgroundColor: '#f0fdf1', color: '#2f7f33' } : {}}
              className="flex flex-row items-center gap-3 py-2.5 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 transition-all cursor-pointer disabled:opacity-50 text-sm font-semibold"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
                </svg>
              </div>
              <span className="text-left">
                Fast-paced
                <span className="block text-xs font-normal text-gray-400">5–6 stops/day</span>
              </span>
            </button>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => handleGenerate()}
          disabled={!destination.trim() || loading}
          className="mt-4 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {LOADING_STEPS[loadStep]}
            </>
          ) : (
            <>
              <SparklesIcon />
              Generate Itinerary
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertIcon />
          <div>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button onClick={() => handleGenerate()} className="mt-2 text-xs text-red-600 dark:text-red-400 underline cursor-pointer">Retry</button>
          </div>
        </div>
      )}

      {/* Itinerary */}
      {plan && (
        <div>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-display font-extrabold text-gray-900 dark:text-white">{plan.destination}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {plan.days.length}-day itinerary · AI-generated
              </p>
            </div>
            <Link to="/vacations"
              className="text-sm font-bold px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-sm">
              Browse vacations
            </Link>
          </div>

          <div className="relative">
            {plan.days.map((day, i) => (
              <DayCard key={day.day} day={day} index={i} />
            ))}
          </div>

          <p className="mt-8 text-xs text-center text-gray-400 dark:text-gray-600">
            Itinerary generated by AI · Always verify opening hours and availability locally
          </p>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;
