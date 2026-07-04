import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { DollarSign, Ticket, Users, Star, Heart, ExternalLink, RefreshCw } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { AnalyticsOverview, RevenueByMonth, PopularVacation, BookingStatusBreakdown, RatingsByDestinationRow } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

/** Triggers a browser download for a blob without navigating away from the page. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const KpiCard: React.FC<{ label: string; value: string; icon: React.ReactNode; iconClassName: string; sub?: string }> = ({ label, value, icon, iconClassName, sub }) => (
  <motion.div variants={cardVariants}
    className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-3">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClassName}`}>{icon}</span>
      <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </motion.div>
);

const Panel: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, action, children, className }) => (
  <motion.div variants={cardVariants}
    className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700 ${className ?? ''}`}>
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h2 className="text-base font-display font-bold text-gray-900 dark:text-white">{title}</h2>
      {action}
    </div>
    {children}
  </motion.div>
);

// Deliberately kept to just two brand hues (primary green + accent amber) plus a
// neutral gray for "negative/other" states — avoids the page looking like a
// generic charting-library rainbow disconnected from the rest of the app.
const BOOKINGS_COLOR   = '#2f7f33'; // primary-600
const LIKES_COLOR      = '#86efac'; // primary-300 — same hue as bookings, lighter shade
const CONFIRMED_COLOR  = '#2f7f33'; // primary-600
const CANCELLED_COLOR  = '#b4b2a7'; // neutral gray
// Rating segments: user-specified green ramp (light → dark for 1★ → 5★).
const RATING_SHADES = ['#E3FFE5', '#86EFAC', '#40C05A', '#2F7F33', '#254F2A'];

interface TooltipPayloadEntry { name?: string; value?: number; color?: string; payload?: Record<string, unknown> }

/** Rich tooltip shared by the bar/pie charts — colored dot + label + value per series. */
const ChartTooltip: React.FC<{ active?: boolean; label?: string; payload?: TooltipPayloadEntry[] }> = ({ active, label, payload }) => {
  if (!active || !payload?.length) return null;
  const visible = payload.filter(entry => (entry.value ?? 0) !== 0);
  const extra = payload[0]?.payload as { Travelers?: number; totalReviews?: number } | undefined;
  return (
    <div className="rounded-lg p-3 shadow-card-hover ring-1 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-gray-800">
      {label && <div className="mb-1.5 text-xs font-bold text-gray-800 dark:text-gray-100">{label}</div>}
      <div className="space-y-1">
        {visible.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500 dark:text-gray-400">{entry.name}</span>
            <span className="font-bold text-gray-800 dark:text-gray-100">{entry.value}</span>
          </div>
        ))}
        {typeof extra?.Travelers === 'number' && (
          <div className="flex items-center gap-2 text-xs pt-1 mt-1 border-t border-gray-100 dark:border-gray-700">
            <span className="w-2 h-2 flex-shrink-0" />
            <span className="text-gray-500 dark:text-gray-400">Travelers</span>
            <span className="font-bold text-gray-800 dark:text-gray-100">{extra.Travelers}</span>
          </div>
        )}
        {typeof extra?.totalReviews === 'number' && (
          <div className="flex items-center gap-2 text-xs pt-1 mt-1 border-t border-gray-100 dark:border-gray-700">
            <span className="w-2 h-2 flex-shrink-0" />
            <span className="text-gray-500 dark:text-gray-400">Total reviews</span>
            <span className="font-bold text-gray-800 dark:text-gray-100">{extra.totalReviews}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Analytics: React.FC = () => {
  const [overview,      setOverview]      = useState<AnalyticsOverview | null>(null);
  const [revenue,       setRevenue]       = useState<RevenueByMonth[]>([]);
  const [popular,       setPopular]       = useState<PopularVacation[]>([]);
  const [bookingStatus, setBookingStatus] = useState<BookingStatusBreakdown[]>([]);
  const [ratingsByDest, setRatingsByDest] = useState<RatingsByDestinationRow[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [lastUpdated,   setLastUpdated]   = useState<Date | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const fetchAll = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [ov, rev, pop, status, ratings] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getRevenueByMonth(),
        analyticsService.getPopularVacations(),
        analyticsService.getBookingStatus(),
        analyticsService.getRatingsByDestination(),
      ]);
      setOverview(ov.data);
      setRevenue(rev.data);
      setPopular(pop.data);
      setBookingStatus(status.data);
      setRatingsByDest(ratings.data);
      setLastUpdated(new Date());
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePdfExport = async () => {
    setPdfLoading(true);
    setExportError(null);
    try {
      const res = await analyticsService.exportPdf();
      downloadBlob(res.data as Blob, 'vacations-report.pdf');
    } catch {
      setExportError('PDF export failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCsvExport = async () => {
    setCsvLoading(true);
    setExportError(null);
    try {
      const res = await analyticsService.exportDestinationsCsv();
      downloadBlob(res.data as Blob, 'destinations-report.csv');
    } catch {
      setExportError('CSV export failed. Please try again.');
    } finally {
      setCsvLoading(false);
    }
  };

  const handleViewJson = async () => {
    setExportError(null);
    try {
      const res = await analyticsService.getLikesReport();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setExportError('Could not load JSON. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="py-32" />;
  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={() => fetchAll()} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-bold text-sm cursor-pointer">Retry</button>
    </div>
  );

  // Top destinations by combined engagement — feeds the grouped bar chart below.
  const topDestinations = [...popular]
    .sort((a, b) => (b.bookingsCount + b.likesCount) - (a.bookingsCount + a.likesCount))
    .slice(0, 7)
    .map(v => ({
      destination: v.destination.split(',')[0],
      Bookings: v.bookingsCount,
      Travelers: v.travelersCount,
      Likes: v.likesCount,
      rating: v.averageRating,
    }));

  const totalBookingStatus = bookingStatus.reduce((sum, s) => sum + s.count, 0);
  const statusColor = (status: string) => (status === 'confirmed' ? CONFIRMED_COLOR : CANCELLED_COLOR);

  // Per-destination rating breakdown — how many people rated, and what they gave, per city.
  const destinationRatings = ratingsByDest
    .filter(r => r.totalReviews > 0)
    .sort((a, b) => b.totalReviews - a.totalReviews)
    .map(r => ({
      destination: r.destination.split(',')[0],
      '1 Star': r.rating1,
      '2 Stars': r.rating2,
      '3 Stars': r.rating3,
      '4 Stars': r.rating4,
      '5 Stars': r.rating5,
      totalReviews: r.totalReviews,
    }));

  return (
    <motion.div className="max-w-6xl mx-auto px-4 py-8 space-y-6" variants={containerVariants} initial="hidden" animate="show">
      {/* Page header */}
      <motion.div variants={cardVariants} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            {lastUpdated && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                · Live from database, updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCsvExport}
            disabled={csvLoading}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {csvLoading ? 'Exporting…' : 'CSV Export'}
          </button>
          <button
            onClick={handlePdfExport}
            disabled={pdfLoading}
            className="px-4 py-2 text-sm font-bold bg-accent-gradient text-white rounded-xl disabled:opacity-60 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            {pdfLoading ? 'Generating…' : 'PDF Export'}
          </button>
        </div>
      </motion.div>

      {exportError && <motion.p variants={cardVariants} className="text-sm text-red-500">{exportError}</motion.p>}

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="Revenue"    value={`$${overview.totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5" />} iconClassName="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" />
          <KpiCard label="Bookings"   value={String(overview.totalBookings)}
            sub={`${overview.totalTravelers} traveler${overview.totalTravelers !== 1 ? 's' : ''}`}
            icon={<Ticket className="w-5 h-5" />} iconClassName="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" />
          <KpiCard label="Users"      value={String(overview.totalUsers)}
            icon={<Users className="w-5 h-5" />} iconClassName="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" />
          <KpiCard label="Avg Rating" value={`${overview.averageRating} / 5`}
            icon={<Star className="w-5 h-5" />} iconClassName="bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400" />
          <KpiCard label="Likes"      value={String(overview.totalLikes)}
            icon={<Heart className="w-5 h-5" />} iconClassName="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" />
        </div>
      )}

      {/* Revenue chart */}
      <Panel title="Revenue by Month">
        {revenue.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No revenue data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2f7f33" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2f7f33" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ede9de" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#8a8880" />
              <YAxis tick={{ fontSize: 11 }} stroke="#8a8880" tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<ChartTooltip />} formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2f7f33" strokeWidth={2.5} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Panel>

      {/* Top destinations — grouped bar chart + booking status donut, side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel
          title="Top Destinations"
          className="lg:col-span-2"
          action={
            <button
              onClick={handleViewJson}
              className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
            >
              View JSON <ExternalLink className="w-3 h-3" />
            </button>
          }
        >
          {topDestinations.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">No booking or like data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDestinations} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede9de" vertical={false} />
                <XAxis dataKey="destination" tick={{ fontSize: 11 }} stroke="#8a8880" />
                <YAxis tick={{ fontSize: 11 }} stroke="#8a8880" allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#2f7f33', opacity: 0.06 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Bookings" fill={BOOKINGS_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Likes" fill={LIKES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {topDestinations.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {topDestinations.map(d => (
                <span key={d.destination}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                  <Users className="w-3 h-3" />
                  {d.destination}: {d.Travelers} traveler{d.Travelers !== 1 ? 's' : ''}
                </span>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Booking Status">
          {totalBookingStatus === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">No bookings yet.</p>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={bookingStatus}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {bookingStatus.map((s, i) => (
                      <Cell key={i} fill={statusColor(s.status)} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalBookingStatus}</span>
                <span className="text-xs text-gray-400">total</span>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                {bookingStatus.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor(s.status) }} />
                    <span className="text-gray-600 dark:text-gray-300 capitalize">{s.status}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Ratings by destination — how many people rated each place, and what they gave it */}
      <Panel title="Ratings by Destination" action={<Star className="w-4 h-4 text-accent-500" fill="currentColor" />}>
        {destinationRatings.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No reviews yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, destinationRatings.length * 34)}>
            <BarChart data={destinationRatings} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ede9de" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#8a8880" allowDecimals={false} />
              <YAxis type="category" dataKey="destination" tick={{ fontSize: 11 }} stroke="#8a8880" width={90} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: RATING_SHADES[4], opacity: 0.06 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {(['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'] as const).map((key, i) => (
                <Bar key={key} dataKey={key} stackId="ratings" fill={RATING_SHADES[i]} maxBarSize={22} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>
    </motion.div>
  );
};

export default Analytics;
