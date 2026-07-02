import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice';
import { AppDispatch, RootState } from '../store';

const PlaneIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
  </svg>
);

const Login: React.FC = () => {
  const dispatch  = useDispatch<AppDispatch>();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, loading, error } = useSelector((s: RootState) => s.auth);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/vacations';

  const [email,    setEmail]    = React.useState('');
  const [password, setPassword] = React.useState('');

  useEffect(() => {
    if (user) navigate(from, { replace: true });
    return () => { dispatch(clearError()); };
  }, [user, navigate, from, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-emerald-50 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3">
            <PlaneIcon />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-card p-8 border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                placeholder="••••••••" autoComplete="current-password" />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Orange accent CTA — highest-converting button color */}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl disabled:opacity-60 transition-colors shadow-sm hover:shadow-md mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            No account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Create one
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-5 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-4 space-y-1">
            <p className="font-semibold text-gray-500 dark:text-gray-400">Demo credentials</p>
            <p>Admin: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">admin@vacations.com</code> / <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">admin1234</code></p>
            <p>User: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">alice@example.com</code> / <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">user1234</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
