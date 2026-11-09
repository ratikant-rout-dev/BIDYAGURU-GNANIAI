import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../routes/routeConfig';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Navigate to intended destination
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo.student@bidyaguru.edu');
    setPassword('Student@123');
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 p-5 sm:p-8 md:p-10 text-slate-900 animate-fade-in">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl mx-auto shadow-md shadow-indigo-600/30 mb-3">
          🎓
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome to Bidya Guru
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Sign in to access your voice mentor and career dashboard
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rohan@bidyaguru.edu"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm font-medium transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm font-medium transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer link to Register & Demo Button */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
        <Link
          to={ROUTES.REGISTER}
          className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Need an account? Sign Up
        </Link>

        <button
          type="button"
          onClick={fillDemoAccount}
          className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
        >
          Fill Demo Account
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
