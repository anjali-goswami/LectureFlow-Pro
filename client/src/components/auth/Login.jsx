import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  Lock,
  User,
  Coffee,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Coffee,
    title: 'Lunch & break protection',
    text: 'Protected lunch windows and passing buffers enforced on every timetable.'
  },
  {
    icon: Sparkles,
    title: 'Constraint-aware solver',
    text: 'Capacity, faculty availability and room collisions resolved automatically.'
  },
  {
    icon: ShieldCheck,
    title: 'Live conflict monitoring',
    text: 'Real-time detection with one-click remediation across the campus.'
  }
];

export default function Login() {
  const { login, signup } = useApp();

  const [signupMode, setSignupMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (signupMode) await signup({ name, email, username, password });
      else await login(username, password);
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setSignupMode(false);
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate bg-grid opacity-60" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <img
              src="/logo-mark.svg"
              alt="LectureFlow Pro"
              className="h-11 w-11 rounded-xl shadow-lg ring-1 ring-white/10"
            />
            <div>
              <p className="text-lg font-extrabold tracking-tight">LectureFlow Pro</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand-300">
                Academic Scheduling Suite
              </p>
            </div>
          </div>

          <div className="mt-16 max-w-md xl:mt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-brand-200 backdrop-blur">
              <GraduationCap className="h-3.5 w-3.5" />
              Trusted by modern institutions
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight xl:text-[44px]">
              Conflict-free lecture halls.
              <span className="block bg-gradient-to-r from-brand-300 to-white bg-clip-text text-transparent">
                Breaks that actually happen.
              </span>
            </h1>

            <p className="mt-5 text-sm leading-relaxed text-slate-300">
              Eliminate double-booked rooms, faculty clashes and lunch-hour overruns with a
              constraint-aware planning engine built for academic operations.
            </p>
          </div>
        </div>

        <div className="relative mt-12 space-y-4">
          {HIGHLIGHTS.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-300">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-1/2 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src="/logo-mark.svg"
              alt="LectureFlow Pro"
              className="h-10 w-10 rounded-xl shadow-sm ring-1 ring-slate-900/5"
            />
            <div>
              <p className="text-base font-extrabold tracking-tight text-slate-900">LectureFlow Pro</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Academic Scheduling Suite
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {signupMode ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {signupMode ? 'Create a staff account to access schedules and room information.' : 'Sign in to access lecture halls, schedules and timetable tools.'}
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 animate-slide-down">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {signupMode && <>
              <div>
                <label className="label" htmlFor="full-name">Full name</label>
                <input id="full-name" type="text" value={name} onChange={e => setName(e.target.value)} className="input" autoComplete="name" required />
              </div>
              <div>
                <label className="label" htmlFor="email">Email (optional)</label>
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" autoComplete="email" />
              </div>
            </>}
            <div>
              <label className="label" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pl-10 font-medium"
                  placeholder="Choose a username"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 font-medium"
                  placeholder="••••••••"
                  autoComplete={signupMode ? 'new-password' : 'current-password'}
                  minLength={signupMode ? 8 : undefined}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-brand-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (signupMode ? 'Creating account…' : 'Signing in…') : (signupMode ? 'Create staff account' : 'Sign in to portal')}
              {!loading && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {signupMode ? 'Already have an account?' : 'New to LectureFlow?'}{' '}
            <button type="button" onClick={() => { setSignupMode(value => !value); setError(''); }} className="font-semibold text-brand-700 hover:text-brand-800">
              {signupMode ? 'Sign in' : 'Create an account'}
            </button>
          </p>

          {!signupMode && <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              One-click demo accounts
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="group rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-brand-300 hover:bg-brand-50/50"
              >
                <span className="block text-xs font-bold text-slate-900">Admin Role</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">Full system access</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff', 'staff123')}
                className="group rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-brand-300 hover:bg-brand-50/50"
              >
                <span className="block text-xs font-bold text-slate-900">Staff Role</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">Coordinator access</span>
              </button>
            </div>
          </div>}

          <p className="mt-8 text-center text-[11px] text-slate-400">
            Protected academic scheduling · Lunch &amp; break compliance built in
          </p>
        </div>
      </div>
    </div>
  );
}
