import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../services/api.js';
import {
  Building2,
  BookOpen,
  Landmark,
  CalendarCheck2,
  AlertTriangle,
  Coffee,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Wrench
} from 'lucide-react';
import { SeverityBadge, ConflictTypeBadge } from '../common/Badge.jsx';

export default function Dashboard() {
  const {
    courses,
    lectureHalls,
    timeSlots,
    schedules,
    conflicts,
    policies,
    refreshAll,
    showToast,
    isAdmin
  } = useApp();

  const [resolving, setResolving] = React.useState(false);

  const totalSeats = lectureHalls.reduce((sum, h) => sum + (h.capacity || 0), 0);
  const totalStudents = courses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const totalCapacitySlots = (lectureHalls.length * timeSlots.length) || 1;
  const utilizationRate = Math.min(100, Math.round((schedules.length / totalCapacitySlots) * 100));

  const breakViolations = conflicts.filter(
    c => c.type === 'lunch_break' || c.type === 'insufficient_break'
  );
  const breakComplianceRate =
    schedules.length > 0
      ? Math.max(0, Math.round(((schedules.length - breakViolations.length) / schedules.length) * 100))
      : 100;

  const handleAutoResolve = async () => {
    setResolving(true);
    try {
      const res = await api.autoResolveAll();
      showToast(`Applied solutions to ${res.resolvedCount} conflict(s)`);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setResolving(false);
    }
  };

  const kpis = [
    {
      label: 'Total Courses',
      value: courses.length,
      meta: `${totalStudents.toLocaleString()} enrolled students`,
      icon: BookOpen,
      tone: 'blue',
      to: '/courses'
    },
    {
      label: 'Lecture Halls',
      value: lectureHalls.length,
      meta: `${totalSeats.toLocaleString()} total seats`,
      icon: Landmark,
      tone: 'emerald',
      to: '/lecture-halls'
    },
    {
      label: 'Scheduled Classes',
      value: schedules.length,
      meta: `${utilizationRate}% hall utilization`,
      icon: CalendarCheck2,
      tone: 'brand',
      to: '/timetable'
    },
    {
      label: 'Break Compliance',
      value: `${breakComplianceRate}%`,
      meta: `${conflicts.length} active conflict${conflicts.length === 1 ? '' : 's'}`,
      icon: Coffee,
      tone: breakComplianceRate >= 90 ? 'emerald' : 'rose',
      to: '/conflicts'
    }
  ];

  const toneStyles = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    brand: 'bg-brand-50 text-brand-600 ring-brand-100',
    rose: 'bg-rose-50 text-rose-600 ring-rose-100'
  };

  return (
    <div className="space-y-6 pb-12 sm:space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grid-slate bg-grid opacity-50" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-brand-200 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            Institutional scheduling engine active
          </span>

          <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
            Lecture hall assignment &amp;
            <span className="block bg-gradient-to-r from-brand-300 to-white bg-clip-text text-transparent">
              break protection.
            </span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            Eliminate double-booked halls, resolve faculty clashes, and enforce mandatory lunch
            breaks and transition buffers across every lecture.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {isAdmin && <Link
              to="/schedule-generator"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/20 transition-all hover:-translate-y-0.5 hover:bg-brand-50"
            >
              <Sparkles className="h-4 w-4 text-brand-600" />
              Generate conflict-free schedule
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>}
            <Link
              to="/timetable"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              <CalendarCheck2 className="h-4 w-4 text-brand-300" />
              View timetable
            </Link>
          </div>
        </div>

        {/* Hero mini stats */}
        <div className="relative z-10 mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 xl:absolute xl:bottom-8 xl:right-8 xl:mt-0 xl:w-72 xl:grid-cols-1 xl:gap-2.5 xl:border-0 xl:pt-0">
          {[
            { label: 'Compliance', value: `${breakComplianceRate}%` },
            { label: 'Utilization', value: `${utilizationRate}%` },
            { label: 'Conflicts', value: conflicts.length }
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Break policy status */}
      <section
        className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
          breakViolations.length > 0
            ? 'border-amber-200 bg-amber-50/70'
            : 'border-emerald-200 bg-emerald-50/70'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <span
            className={`icon-tile h-11 w-11 shrink-0 ${
              breakViolations.length > 0
                ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
            }`}
          >
            <Coffee className="h-5 w-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={`text-[15px] font-bold ${
                  breakViolations.length > 0 ? 'text-amber-900' : 'text-emerald-900'
                }`}
              >
                Lunch Break Protection · {policies.lunchBreakStart} – {policies.lunchBreakEnd}
              </h2>
              <span
                className={`chip ${
                  policies.lunchBreakEnforced
                    ? 'border-emerald-200 bg-white text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {policies.lunchBreakEnforced ? 'Policy active' : 'Policy paused'}
              </span>
            </div>
            <p
              className={`mt-1 text-xs leading-relaxed sm:text-[13px] ${
                breakViolations.length > 0 ? 'text-amber-800' : 'text-emerald-800'
              }`}
            >
              {breakViolations.length > 0
                ? `${breakViolations.length} class(es) infringe the lunch window or lack the required passing buffer.`
                : 'Every scheduled class honors the lunch window and transition buffers.'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isAdmin && conflicts.length > 0 && (
            <button
              onClick={handleAutoResolve}
              disabled={resolving}
              className="btn-dark btn-sm"
            >
              <Wrench className="h-3.5 w-3.5" />
              {resolving ? 'Resolving…' : 'Auto-resolve'}
            </button>
          )}
          {isAdmin && <Link
            to="/policies"
            className="text-xs font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
          >
            Configure
          </Link>}
        </div>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              to={kpi.to}
              className="card-interactive group p-5"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {kpi.label}
                </span>
                <span
                  className={`icon-tile h-10 w-10 ring-1 transition-transform duration-200 group-hover:scale-105 ${toneStyles[kpi.tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="stat-value mt-2">{kpi.value}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">{kpi.meta}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Quick actions */}
          <section className="surface p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <h2 className="section-title">Quick actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(isAdmin
                ? [
                    { to: '/departments', label: 'Manage departments', icon: Building2 },
                    { to: '/courses', label: 'Manage courses', icon: BookOpen },
                    { to: '/lecture-halls', label: 'Manage rooms', icon: Landmark },
                    { to: '/schedule-generator', label: 'Run scheduler', icon: Sparkles, accent: true }
                  ]
                : [
                    { to: '/departments', label: 'View departments', icon: Building2 },
                    { to: '/courses', label: 'View courses', icon: BookOpen },
                    { to: '/lecture-halls', label: 'Hall availability', icon: Landmark },
                    { to: '/timetable', label: 'View timetable', icon: CalendarCheck2, accent: true }
                  ]
              ).map(action => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className={`group flex flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-all ${
                      action.accent
                        ? 'border-brand-200 bg-brand-50/60 hover:border-brand-300 hover:bg-brand-50'
                        : 'border-slate-200 bg-slate-50/60 hover:border-brand-200 hover:bg-brand-50/40'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                        action.accent ? 'text-brand-600' : 'text-slate-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        action.accent ? 'text-brand-800' : 'text-slate-700'
                      }`}
                    >
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Hall utilization */}
          <section className="surface p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="section-title">Lecture hall utilization</h2>
                <p className="section-subtitle">Occupancy across active campus halls</p>
              </div>
              <Link
                to="/lecture-halls"
                className="shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-3.5">
              {lectureHalls.slice(0, 5).map(hall => {
                const hallSchedules = schedules.filter(s => s.lectureHallId === hall.id);
                const rate =
                  timeSlots.length > 0
                    ? Math.min(100, Math.round((hallSchedules.length / timeSlots.length) * 100))
                    : 0;

                return (
                  <div
                    key={hall.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="font-bold text-slate-900">{hall.roomNumber}</span>
                        <span className="truncate text-slate-500">· {hall.location}</span>
                        <span className="chip chip-neutral shrink-0">{hall.capacity} seats</span>
                      </div>
                      <span className="shrink-0 font-bold text-slate-800">{rate}% used</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rate > 80 ? 'bg-amber-500' : rate > 40 ? 'bg-brand-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(4, rate)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {lectureHalls.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  No lecture halls configured yet.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Conflict monitor */}
        <section className="surface flex flex-col p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`h-4 w-4 ${conflicts.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}
              />
              <h2 className="section-title">Conflict monitor</h2>
            </div>
            <span
              className={`chip ${
                conflicts.length > 0 ? 'chip-danger' : 'chip-success'
              }`}
            >
              {conflicts.length} detected
            </span>
          </div>

          {conflicts.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Timetable conflict-free</h3>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                All lectures conform to hall capacity, faculty availability, lunch hours and travel
                buffers.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conflicts.slice(0, 4).map(conflict => (
                <div
                  key={conflict.id}
                  className="rounded-xl border border-rose-100 bg-rose-50/40 p-3.5"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <ConflictTypeBadge type={conflict.type} />
                    <SeverityBadge severity={conflict.severity} />
                  </div>
                  <p className="text-[13px] font-bold text-slate-800">{conflict.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {conflict.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
            {isAdmin && conflicts.length > 0 && (
              <button
                onClick={handleAutoResolve}
                disabled={resolving}
                className="btn-primary w-full text-xs"
              >
                <Wrench className="h-3.5 w-3.5" />
                {resolving ? 'Applying solutions…' : '1-click auto-resolve all'}
              </button>
            )}
            <Link
              to="/conflicts"
              className="btn-secondary w-full text-xs"
            >
              View full report ({conflicts.length})
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
