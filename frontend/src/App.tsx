import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { RootState } from './store';

import Navbar         from './components/Layout/Navbar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AdminRoute     from './components/Layout/AdminRoute';
import ToastContainer from './components/Common/Toast';
import ChatWidget     from './components/Chat/ChatWidget';
import BackToTop      from './components/Common/BackToTop';

import About           from './pages/About';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Vacations       from './pages/Vacations';
import VacationDetail  from './pages/VacationDetail';
import MyBookings      from './pages/MyBookings';
import TripPlanner     from './pages/TripPlanner';
import SmartSearch     from './pages/SmartSearch';
import AdminVacations  from './pages/admin/AdminVacations';
import AddEditVacation from './pages/admin/AddEditVacation';
import AdminBookings   from './pages/admin/AdminBookings';
import Analytics       from './pages/admin/Analytics';

// Page transition variants — subtle fade + slide up
const pageVariants = {
  initial:   { opacity: 0, y: 14 },
  animate:   { opacity: 1, y: 0,  transition: { duration: 0.22, ease: 'easeOut' } },
  exit:      { opacity: 0, y: -8, transition: { duration: 0.16, ease: 'easeIn'  } },
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

// AnimatePresence needs access to location — lives inside BrowserRouter
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/"         element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/login"    element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

        {/* User-protected */}
        <Route path="/vacations"     element={<ProtectedRoute><PageWrapper><Vacations /></PageWrapper></ProtectedRoute>} />
        <Route path="/vacations/:id" element={<ProtectedRoute><PageWrapper><VacationDetail /></PageWrapper></ProtectedRoute>} />
        <Route path="/my-bookings"   element={<ProtectedRoute><PageWrapper><MyBookings /></PageWrapper></ProtectedRoute>} />
        <Route path="/trip-planner"  element={<ProtectedRoute><PageWrapper><TripPlanner /></PageWrapper></ProtectedRoute>} />
        <Route path="/search"        element={<ProtectedRoute><PageWrapper><SmartSearch /></PageWrapper></ProtectedRoute>} />

        {/* Admin-only */}
        <Route path="/admin/vacations"          element={<AdminRoute><PageWrapper><AdminVacations /></PageWrapper></AdminRoute>} />
        <Route path="/admin/vacations/new"      element={<AdminRoute><PageWrapper><AddEditVacation /></PageWrapper></AdminRoute>} />
        <Route path="/admin/vacations/:id/edit" element={<AdminRoute><PageWrapper><AddEditVacation /></PageWrapper></AdminRoute>} />
        <Route path="/admin/bookings"           element={<AdminRoute><PageWrapper><AdminBookings /></PageWrapper></AdminRoute>} />
        <Route path="/admin/analytics"          element={<AdminRoute><PageWrapper><Analytics /></PageWrapper></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const { theme } = useSelector((s: RootState) => s.ui);

  // Apply dark-mode class on root element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', 'en');
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Skip-to-content link for keyboard / screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
        <Navbar />
        <main id="main-content" role="main" tabIndex={-1} className="outline-none">
          <AnimatedRoutes />
        </main>

        {/* Floating chat widget (visible to logged-in users on all pages) */}
        <ChatWidget />

        {/* Back-to-top button — appears once scrolled down, on all screen sizes */}
        <BackToTop />

        {/* Toast notifications — aria-live region */}
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
};

export default App;
