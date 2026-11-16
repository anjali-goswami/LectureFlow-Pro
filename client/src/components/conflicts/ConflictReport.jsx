import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../services/api.js';
import {
  AlertOctagon,
  Wrench,
  FileDown,
  CheckCircle2,
  Filter,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Landmark,
  User,
  Coffee
} from 'lucide-react';
import { SeverityBadge, ConflictTypeBadge } from '../common/Badge.jsx';

export default function ConflictReport() {
  const { conflicts, conflictsMeta, refreshAll, showToast, isAdmin } = useApp();

  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [autoResolving, setAutoResolving] = useState(false);

  const filteredConflicts = conflicts.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'lunch') return c.type === 'lunch_break';
    if (activeFilter === 'break') return c.type === 'insufficient_break';
    if (activeFilter === 'hall') return c.type === 'hall';
    if (activeFilter === 'instructor') return c.type === 'instructor';
    if (activeFilter === 'capacity') return c.type === 'capacity';
    return true;
  });

  const handleApplyResolution = async (resolution) => {
    setResolvingId(resolution.id);
    try {
      const res = await api.resolveConflict(resolution);
      showToast(`Applied: ${resolution.title}`);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const handleAutoResolveAll = async () => {
    setAutoResolving(true);
    try {
      const res = await api.autoResolveAll();
      showToast(`Successfully auto-resolved ${res.resolvedCount} conflict(s)!`);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAutoResolving(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await api.exportConflictsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lecture_conflicts_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('Conflicts report exported to CSV');
    } catch (err) {
      showToast('Failed to export conflicts CSV', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="icon-tile h-9 w-9 bg-rose-50 text-rose-600 ring-1 ring-rose-100">
              <AlertOctagon className="h-5 w-5" />
            </span>
            Conflict Detection &amp; Resolution
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'Detect schedule collisions, room overcapacities, and lunch / passing buffer infringements with 1-click automatic resolution.'
              : 'Review schedule collisions, room overcapacities, and lunch / passing buffer infringements. Resolutions are applied by an administrator.'}
          </p>
        </div>

        <div className="flex w-full items-center gap-2.5 sm:w-auto">
          {isAdmin && conflicts.length > 0 && (
            <button
              onClick={handleAutoResolveAll}
              disabled={autoResolving}
              className="btn-primary flex-1 sm:flex-none"
            >
              <Sparkles className="h-4 w-4" />
              {autoResolving ? 'Resolving…' : 'Auto-resolve all'}
            </button>
          )}

          {!isAdmin && <span className="chip chip-neutral">View only</span>}

          <button onClick={handleExportCSV} className="btn-secondary">
            <FileDown className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: `All Conflicts (${conflicts.length})` },
          { key: 'lunch', label: `Lunch Violations (${conflicts.filter(c => c.type === 'lunch_break').length})` },
          { key: 'break', label: `Insufficient Buffers (${conflicts.filter(c => c.type === 'insufficient_break').length})` },
          { key: 'hall', label: `Room Clashes (${conflicts.filter(c => c.type === 'hall').length})` },
          { key: 'instructor', label: `Faculty Clashes (${conflicts.filter(c => c.type === 'instructor').length})` },
          { key: 'capacity', label: `Capacity Overflows (${conflicts.filter(c => c.type === 'capacity').length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === tab.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {filteredConflicts.length === 0 ? (
        <div className="surface p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Zero Conflicts Detected!</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            All course allocations are conflict-free, honoring lecture hall capacities, faculty availability, and designated lunch / passing break windows.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConflicts.map(conflict => {
            const isExpanded = expandedId === conflict.id;

            return (
              <div
                key={conflict.id}
                className="surface overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header */}
                <div
                  className="p-5 cursor-pointer flex items-start justify-between gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : conflict.id)}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ConflictTypeBadge type={conflict.type} />
                      <SeverityBadge severity={conflict.severity} />
                      <span className="text-xs text-slate-400">ID: {conflict.id}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {conflict.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {conflict.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors mt-1"
                    aria-label="Expand details"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Affected Schedules Details */}
                {conflict.affectedDetails && conflict.affectedDetails.length > 0 && (
                  <div className="px-5 pb-4 pt-1 border-t border-slate-100 bg-slate-50/40">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Affected Class Details:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {conflict.affectedDetails.map((det, dIdx) => (
                        <div key={dIdx} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                          <p className="font-bold text-slate-900">{det.courseCode} - {det.courseName}</p>
                          <div className="flex items-center gap-3 text-slate-600">
                            <span className="flex items-center gap-1">
                              <Landmark className="w-3.5 h-3.5 text-slate-400" />
                              Room {det.roomNumber} ({det.capacity} seats)
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {det.day} {det.time}
                            </span>
                          </div>
                          <p className="text-slate-500">
                            Instructor: <span className="font-medium text-slate-700">{det.instructor}</span> • Enrolled: <span className="font-medium text-slate-700">{det.studentCount} students</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proposed Solutions (Resolutions) */}
                <div className="p-5 border-t border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-brand-600" />
                      Suggested Automatic Solutions ({conflict.resolutions?.length || 0})
                    </h4>
                  </div>

                  {(!conflict.resolutions || conflict.resolutions.length === 0) ? (
                    <p className="text-xs text-slate-500 italic">
                      No automated discrete solution found. Try running the full Auto Scheduler with break enforcement.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {conflict.resolutions.map(resolution => (
                        <div
                          key={resolution.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            resolution.isRecommended
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              {resolution.isRecommended && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white">
                                  Recommended
                                </span>
                              )}
                              <span className="font-bold text-sm">{resolution.title}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200/60 text-slate-700 font-semibold">
                                {resolution.impact} impact
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {resolution.description}
                            </p>
                          </div>

                          {isAdmin && (
                            <button
                              onClick={() => handleApplyResolution(resolution)}
                              disabled={resolvingId === resolution.id}
                              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex-shrink-0 ${
                                resolution.isRecommended
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                              } disabled:opacity-50`}
                            >
                              {resolvingId === resolution.id ? 'Applying...' : 'Apply Solution'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
