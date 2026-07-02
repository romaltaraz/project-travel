import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import { toggleTheme } from '../../store/uiSlice';

const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);
const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
);
const PlaneIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
);
const SearchIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const Navbar: React.FC = () => {
  const { user }  = useSelector((s: RootState) => s.auth);
  const { theme } = useSelector((s: RootState) => s.ui);
  const dispatch  = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const { t } = useTranslation();
  const [open,    setOpen]    = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const closeMenu = () => setOpen(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    navigate(`/search?q=${encodeURIComponent(value)}`, { replace: true });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`, { replace: true, state: { runSearch: true } });
      closeMenu();
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    closeMenu();
  };

  const userLinks = [
    { to: '/vacations',    label: t('nav.vacations')   },
    { to: '/my-bookings',  label: t('nav.myBookings')  },
    { to: '/trip-planner', label: t('nav.aiPlanner')   },
  ];
  const adminLinks = [
    { to: '/admin/vacations', label: t('nav.adminVacations') },
    { to: '/admin/bookings',  label: t('nav.adminBookings')  },
    { to: '/admin/analytics', label: t('nav.analytics')      },
  ];
  const publicLinks = [
    { to: '/',         label: t('nav.home')     },
    { to: '/login',    label: t('nav.login')    },
    { to: '/register', label: t('nav.register') },
  ];

  const links = user?.role === 'admin' ? adminLinks : user ? userLinks : publicLinks;

  return (
    <header className="sticky top-0 z-40">
      {/* ── MAIN BAR ── */}
      <div className={`transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 shadow-lg shadow-black/10 border-b border-gray-200/60 dark:border-gray-700/60'
          : 'bg-white/85 dark:bg-gray-900/85 border-b border-gray-200/40 dark:border-gray-700/40'
      } backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity flex-shrink-0"
            aria-label="Vacations home"
          >
            <motion.span
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="p-1.5 bg-gradient-to-br from-primary-400 to-primary-700 rounded-xl text-white shadow-md shadow-primary-500/30"
            >
              <PlaneIcon />
            </motion.span>
            <span className="hidden sm:inline font-display font-extrabold text-xl bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-300 dark:to-primary-500 bg-clip-text text-transparent tracking-tight">
              Vacations
            </span>
          </Link>

          {/* ── TUBELIGHT NAV — desktop ── */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-full px-2 py-1 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm" aria-label="Main navigation">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `relative text-sm font-semibold px-4 py-1.5 rounded-full cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
                    isActive
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Sliding background pill */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-sm"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    {/* Tubelight lamp glow — only on active */}
                    {isActive && (
                      <motion.span
                        layoutId="lamp"
                        className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      >
                        {/* Bar */}
                        <span className="block w-8 h-[3px] bg-primary-500 rounded-b-full mx-auto" />
                        {/* Glow halos */}
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 h-5 bg-primary-400/25 rounded-full blur-md" />
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-primary-400/30 rounded-full blur-sm" />
                      </motion.span>
                    )}
                    {l.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Search bar — navigates to /search?q= in real time */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100/80 dark:bg-gray-800/80 focus-within:bg-green-50 dark:focus-within:bg-green-900/20 rounded-full border border-gray-200/60 dark:border-gray-700/60 focus-within:border-green-200 transition-all min-w-[120px]">
              <SearchIcon />
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Smart Search..."
                className="bg-transparent text-xs text-gray-700 dark:text-gray-200 placeholder:text-gray-400 font-medium outline-none w-full"
              />
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Dark mode */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label={t('nav.toggleDark')}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {/* User info + logout */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 ms-1 pl-2 border-l border-gray-200 dark:border-gray-700">
                {/* Avatar circle */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold max-w-[100px] truncate">
                  {user.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors cursor-pointer border border-red-100 dark:border-red-800/40"
                >
                  <LogoutIcon />
                  {t('nav.logout')}
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => setOpen(o => !o)}
              aria-label={t('nav.openMenu')}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-b border-gray-200 dark:border-gray-700 bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg"
          >
            <nav className="px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {user && (
                <div className="flex items-center gap-1.5 px-4 py-2.5 mb-2 bg-gray-100/80 dark:bg-gray-800/80 focus-within:bg-green-50 dark:focus-within:bg-green-900/20 rounded-xl border border-gray-200/60 dark:border-gray-700/60 focus-within:border-green-200 transition-all">
                  <SearchIcon />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Smart Search..."
                    className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 font-medium outline-none w-full"
                  />
                </div>
              )}
              {links.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}

              <div className="flex items-center gap-2 pt-3 mt-2 border-t border-gray-100 dark:border-gray-800">
                {user && (
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogoutIcon />
                    {t('nav.logout')}
                  </button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
