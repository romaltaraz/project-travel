import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/authSlice';
import { AppDispatch, RootState } from '../store';

const UserPlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/>
  </svg>
);

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s: RootState) => s.auth);

  const [firstName, setFirstName] = React.useState('');
  const [lastName,  setLastName]  = React.useState('');
  const [email,     setEmail]     = React.useState('');
  const [password,  setPassword]  = React.useState('');

  useEffect(() => {
    if (user) navigate('/vacations', { replace: true });
    return () => { dispatch(clearError()); };
  }, [user, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(register({ firstName, lastName, email, password }));
  };

  const inputCls = 'w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-emerald-50 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3">
            <UserPlusIcon />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">Create account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start your adventure today</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-card p-8 border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
                <input id="firstName" required value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} placeholder="Jane" autoComplete="given-name" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
                <input id="lastName" required value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} placeholder="Smith" autoComplete="family-name" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password <span className="text-gray-400 font-normal">(min 4 chars)</span></label>
              <input id="password" type="password" required minLength={4} value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" autoComplete="new-password" />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl disabled:opacity-60 transition-colors shadow-sm hover:shadow-md mt-1">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
