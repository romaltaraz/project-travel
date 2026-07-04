import React, { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from 'recharts';
import { DollarSign, Ticket, Users, Star, Heart, ExternalLink } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { AnalyticsOverview, RevenueByMonth, PopularVacation } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import StarRating from '../../components/Common/StarRating';

type Tab = 'bookings' | 'likes' | 'rating';

/** Triggers a browser download for a blob without navigating away from the page. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const KpiCard: React.FC<{ label: string; value: string; icon: React.ReactNode; iconClassName: string; sub?: string }> = ({ label, value, icon, iconClassName, sub }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-3">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClassName}`}>{icon}</span>
      <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const CHART_COLORS = ['#0ea5e9', '#38bdf8', '#f97316', '#fb923c', '#0284c7'];

const Analytics: React.FC = () => {
  const [overview,  setOverview]  = useState<AnalyticsOverview | null>(null);
  const [revenue,   setRevenue]   = useState<RevenueByMonth[]>([]);
  const [popular,   setPopular]   = useState<PopularVacation[]>([]);
  const [likesData, setLikesData] = useState<{ destination: string; likesCount: number }[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [tab,       setTab]       = useState<Tab>('bookings');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, rev, pop, likes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getRevenueByMonth(),
        analyticsService.getPopularVacations(),
        analyticsService.getLikesReport(),
      ]);
      setOverview(ov.data);
      setRevenue(rev.data);
      setPopular(pop.data);
      setLikesData(likes.data);
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
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
      const res = await analyticsService.exportLikesCsv();
      downloadBlob(res.data as Blob, 'likes-report.csv');
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

  const sortedByTab = [...popular].sort((a, b) => {
    if (tab === 'bookings') return b.bookingsCount - a.bookingsCount;
    if (tab === 'likes')    return b.likesCount    - a.likesCount;
    return b.averageRating - a.averageRating;
  });

  if (loading) return <LoadingSpinner size="lg" className="py-32" />;
  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={fetchAll} className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-xl font-bold text-sm">Retry</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCsvExport}
            disabled={csvLoading}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 transition-colors"
          >
            {csvLoading ? 'Exporting…' : 'CSV Export'}
          </button>
          <button
            onClick={handlePdfExport}
            disabled={pdfLoading}
            className="px-4 py-2 text-sm font-bold bg-accent-500 hover:bg-accent-600 text-white rounded-xl disabled:opacity-60 transition-colors shadow-sm"
          >
            {pdfLoading ? 'Generating…' : 'PDF Export'}
          </button>
        </div>
      </div>

      {exportError && (
        <p className="text-sm text-red-500 -mt-4">{exportError}</p>
      )}

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="Revenue"    value={`$${overview.totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5" />} iconClassName="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" />
          <KpiCard label="Bookings"   value={String(overview.totalBookings)}
            icon={<Ticket className="w-5 h-5" />} iconClassName="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" />
          <KpiCard label="Users"      value={String(overview.totalUsers)}
            icon={<Users className="w-5 h-5" />} iconClassName="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
          <KpiCard label="Avg Rating" value={`${overview.averageRating} / 5`}
            icon={<Star className="w-5 h-5" />} iconClassName="bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400" />
          <KpiCard label="Likes"      value={String(overview.totalLikes)}
            icon={<Heart className="w-5 h-5" />} iconClassName="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
        </div>
      )}

      {/* Revenue chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Revenue by Month</h2>
        {revenue.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No revenue data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Popular vacations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Most Popular Vacations</h2>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-5 w-fit">
          {(['bookings', 'likes', 'rating'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg font-medium transition-colors capitalize ${
                tab === t
                  ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t === 'bookings' ? <><Ticket className="w-3.5 h-3.5" /> Bookings</> : t === 'likes' ? <><Heart className="w-3.5 h-3.5" /> Likes</> : <><Star className="w-3.5 h-3.5" /> Rating</>}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {sortedByTab.slice(0, 8).map((v, i) => (
            <div key={v.id} className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-400 w-5 text-center">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{v.destination}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1"><Ticket className="w-3.5 h-3.5" /> {v.bookingsCount}</span>
                    <span className="inline-flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-400" fill="currentColor" /> {v.likesCount}</span>
                    <StarRating value={v.averageRating} size="sm" />
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (tab === 'bookings' ? v.bookingsCount : tab === 'likes' ? v.likesCount : v.averageRating * 20) / (sortedByTab[0] ? (tab === 'bookings' ? sortedByTab[0].bookingsCount : tab === 'likes' ? sortedByTab[0].likesCount : sortedByTab[0].averageRating * 20) : 1) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Likes bar chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Likes per Destination</h2>
          <button
            onClick={handleViewJson}
            className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
          >
            View JSON <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        {likesData.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No likes data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={likesData.slice(0, 10)}
              margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="destination" tick={{ fontSize: 10 }} width={120} />
              <Tooltip />
              <Bar dataKey="likesCount" name="Likes" radius={[0, 4, 4, 0]}>
                {likesData.slice(0, 10).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Analytics;
