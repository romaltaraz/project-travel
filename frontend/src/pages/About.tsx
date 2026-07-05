import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { getImageUrl } from '../services/api';
import SocialCards from '../components/ui/card-fan-carousel';

const MapIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20.25L3 17.25V3.75L9 6.75m0 13.5V6.75m0 13.5l6-3m-6-10.5l6 3m0 0l6-3v13.5l-6 3m0-13.5v13.5"/>
  </svg>
);
const SparkleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
  </svg>
);
const CreditCardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/>
  </svg>
);
const StarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
  </svg>
);
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
  </svg>
);
const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3.284 14.253A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253"/>
  </svg>
);
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
  </svg>
);

const features = [
  { icon: <MapIcon />, key: 'browse',    color: 'bg-primary-500',  glow: 'shadow-[0_0_28px_rgba(16,185,129,.45)]'  },
  { icon: <SparkleIcon />, key: 'ai',    color: 'bg-violet-500',   glow: 'shadow-[0_0_28px_rgba(139,92,246,.45)]'  },
  { icon: <CreditCardIcon />, key: 'book', color: 'bg-accent-500',  glow: 'shadow-[0_0_28px_rgba(245,158,11,.45)]'  },
  { icon: <StarIcon />, key: 'community', color: 'bg-[#f43f5e]',    glow: 'shadow-[0_0_28px_rgba(244,63,94,.45)]'   },
];

const CYCLING_WORDS = ['Tokyo', 'Santorini', 'Bali', 'Patagonia', 'Marrakech', 'Kyoto', 'Amalfi', 'Lisbon'];

const DESTINATION_CARDS = [
  { imgUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=700&fit=crop', alt: 'Paris, France' },
  { imgUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=700&fit=crop', alt: 'Tokyo, Japan' },
  { imgUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=700&fit=crop', alt: 'Rome, Italy' },
  { imgUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=700&fit=crop', alt: 'Santorini, Greece' },
  { imgUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=700&fit=crop', alt: 'Dubai, UAE' },
  { imgUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=700&fit=crop', alt: 'Barcelona, Spain' },
  { imgUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=700&fit=crop', alt: 'Bali, Indonesia' },
  { imgUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=700&fit=crop', alt: 'Amsterdam, Netherlands' },
  { imgUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=700&fit=crop', alt: 'New York, USA' },
  { imgUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=700&fit=crop', alt: 'Kyoto, Japan' },
];

const stats = [
  { icon: <GlobeIcon />,   num: '22+',   label: 'Destinations',      color: 'text-primary-300'  },
  { icon: <StarIcon />,    num: '4.8',   label: 'Average Rating',    color: 'text-amber-400'    },
  { icon: <UsersIcon />,   num: '10k+',  label: 'Happy Travelers',   color: 'text-emerald-300'  },
  { icon: <SparkleIcon />, num: 'AI',    label: 'Powered Planning',  color: 'text-violet-300'   },
];

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };

const About: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const { t } = useTranslation();
  const [wordIdx, setWordIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setWordIdx(i => (i + 1) % CYCLING_WORDS.length), 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ════════════════════════════════════════
          HERO — immersive aurora background
          ════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden">

        {/* AI-generated hero photo background */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl('hero-home.jpg')}
            alt="Travel destinations hero"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75" />
          {/* Green aurora colour tint on top of photo */}
          <div className="absolute inset-0" style={{
            backgroundImage: [
              'radial-gradient(ellipse 70% 50% at 15% 45%, rgba(5,150,105,.45) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 40% at 85% 20%, rgba(47,127,51,.30) 0%, transparent 55%)',
              'radial-gradient(ellipse 50% 60% at 60% 90%, rgba(74,222,106,.20) 0%, transparent 55%)',
            ].join(', ')
          }} />
        </div>

        {/* Animated floating orbs — large, vivid */}
        <motion.div
          animate={{ y: [0, -28, 0], x: [0, 12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[8%] left-[5%] w-[500px] h-[500px] rounded-full bg-emerald-400/12 blur-[80px] pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 22, 0], x: [0, -10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[5%] right-[3%] w-[420px] h-[420px] rounded-full bg-emerald-400/18 blur-[70px] pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-[45%] right-[15%] w-[280px] h-[280px] rounded-full bg-violet-500/12 blur-[60px] pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 18, 0], x: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-[20%] right-[35%] w-[200px] h-[200px] rounded-full bg-primary-400/20 blur-[50px] pointer-events-none"
        />

        {/* ── BADGE — top ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative z-10 mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary-200 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
            <SparkleIcon />
            AI-Powered Travel Planning
          </span>
        </motion.div>

        {/* ── MAIN HEADLINE with cycling word ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-5xl"
        >
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-extrabold text-white leading-[1.04] tracking-tight mb-4 drop-shadow-2xl">
            {t('hero.title')}
          </h1>

          {/* Animated cycling destination word */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-6">
            <span className="font-display text-2xl sm:text-3xl font-bold text-white/60">Discover</span>
            <div className="relative overflow-hidden h-10 sm:h-12 min-w-[8rem] sm:min-w-[10rem]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="block font-display text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-300 to-primary-400 bg-clip-text text-transparent whitespace-nowrap"
                >
                  {CYCLING_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {t('hero.subtitle')}
          </p>

          {/* ── GLASSMORPHISM SEARCH BAR ── */}
          <div className="flex items-center gap-2 max-w-lg mx-auto mb-10 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 backdrop-blur-md shadow-2xl shadow-black/20">
            <SearchIcon />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Where do you want to go?"
              className="flex-1 bg-transparent text-white placeholder-white/50 text-sm font-medium outline-none"
            />
            <Link
              to={searchQuery ? `/vacations?search=${encodeURIComponent(searchQuery)}` : '/vacations'}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Search <ArrowRightIcon />
            </Link>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-4 flex-wrap justify-center">
            {user ? (
              <Link to="/vacations"
                className="group flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl text-base shadow-xl shadow-primary-900/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
              >
                {t('hero.browseVacations')} <ArrowRightIcon />
              </Link>
            ) : (
              <>
                <Link to="/register"
                  className="group flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl text-base shadow-xl shadow-primary-900/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  {t('hero.getStarted')} <ArrowRightIcon />
                </Link>
                <Link to="/login"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white font-semibold rounded-2xl text-base backdrop-blur-sm transition-all duration-200"
                >
                  {t('hero.signIn')}
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* ── TRUST STATS STRIP — below CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative z-10 mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
        >
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className={`${s.color} opacity-80`}>{s.icon}</div>
              <div className="text-start">
                <div className={`font-display font-extrabold text-xl leading-none ${s.color}`}>{s.num}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.label}</div>
              </div>
              {i < stats.length - 1 && <div className="hidden sm:block w-px h-8 bg-white/15 ms-4" />}
            </div>
          ))}
        </motion.div>


        {/* Wave divider — overlaps the section boundary by 2px so no hairline gap shows through */}
        <div className="absolute -bottom-0.5 inset-x-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 80L1440 80L1440 40C1100 75 840 15 720 40C600 65 300 12 0 40L0 80Z" className="fill-emerald-50 dark:fill-gray-950"/>
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════
          DESTINATIONS FAN CAROUSEL
          ════════════════════════════════════════ */}
      <section className="pt-4 md:pt-6 pb-[calc(1rem+75.6px)] md:pb-[calc(1.5rem+75.6px)] bg-emerald-50 dark:bg-gray-950 overflow-x-clip w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-0 px-4"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700/50 rounded-full mb-4">
            Popular Destinations
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-3">
            Explore the world's finest cities
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base">
            Hover to fan out, click the arrows to cycle through destinations.
          </p>
        </motion.div>
        <SocialCards cards={DESTINATION_CARDS} />
      </section>

      {/* ════════════════════════════════════════
          FEATURE CARDS — glassmorphism
          ════════════════════════════════════════ */}
      <section className="section py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700/50 rounded-full mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
            Everything you need for your next trip
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
            From AI-powered planning to real community reviews — we've got your adventure covered.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
        >
          {features.map(f => (
            <motion.div key={f.key} variants={fadeUp}>
              <div className="group h-full bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 cursor-default flex flex-col gap-4">
                <div className={`w-12 h-12 ${f.color} ${f.glow} rounded-2xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-900 dark:text-white text-base mb-2">
                    {t(`features.${f.key}.title`)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t(`features.${f.key}.desc`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          CTA BANNER
          ════════════════════════════════════════ */}
      <section className="mx-4 mb-20 rounded-3xl overflow-hidden">
        <div className="relative px-8 py-16 text-center overflow-hidden">
          {/* Nature photo background */}
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&h=600&fit=crop&q=80&auto=format"
            alt="Green forest nature"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Forest green overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/85 via-primary-800/75 to-primary-700/70" />
          {/* Soft light rays */}
          <div className="absolute inset-0" style={{
            backgroundImage: [
              'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.12) 0%, transparent 55%)',
              'radial-gradient(ellipse at 70% 85%, rgba(71,201,64,.18) 0%, transparent 50%)',
            ].join(', ')
          }} />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[-30%] right-[-10%] w-96 h-96 rounded-full bg-primary-400/10 blur-3xl pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-bold text-primary-100 bg-white/15 border border-white/20 rounded-full mb-5">
              Join Thousands of Travelers
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mb-4 leading-tight">
              Ready for your next<br />adventure?
            </h2>
            <p className="text-white/80 mb-10 max-w-md mx-auto text-base leading-relaxed">
              Plan, book, and explore the world with AI-powered recommendations and real community reviews.
            </p>
            {!user && (
              <Link to="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-700 font-bold rounded-2xl text-base shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                {t('hero.getStarted')} <ArrowRightIcon />
              </Link>
            )}
            {user && (
              <Link to="/vacations"
                className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-700 font-bold rounded-2xl text-base shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                {t('hero.browseVacations')} <ArrowRightIcon />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default About;
