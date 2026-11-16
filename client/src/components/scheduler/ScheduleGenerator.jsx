import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../services/api.js';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Coffee,
  Trash2,
  CalendarCheck2,
  Landmark,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ScheduleGenerator() {
  const {
    courses,
    lectureHalls,
    timeSlots,
    schedules,
    policies,
    conflicts,
    refreshAll,
    showToast
  } = useApp();

  const [enforceLunchBreak, setEnforceLunchBreak] = useState(true);
  const [minBufferMinutes, setMinBufferMinutes] = useState(15);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);

  const canGenerate = courses.length > 0 && lectureHalls.length > 0 && timeSlots.length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setGenerationResult(null);

    try {
      const res = await api.generateSchedule({
        enforceLunchBreak,
        minBufferMinutes
      });
      setGenerationResult(res);
      showToast(`Generated conflict-free timetable with ${res.generatedCount} classes!`);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all active schedules?')) return;
    try {
      await api.clearSchedules();
      showToast('All schedules cleared successfully');
      setGenerationResult(null);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="icon-tile h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              <Sparkles className="h-5 w-5" />
            </span>
            Intelligent Schedule Generator
          </h1>
          <p className="page-subtitle">
            Automated multi-constraint solver that pairs courses with halls, avoids collisions, and enforces break windows.
          </p>
        </div>

        {schedules.length > 0 && (
          <button onClick={handleClear} className="btn-danger btn-sm">
            <Trash2 className="h-4 w-4" />
            Clear schedule ({schedules.length})
          </button>
        )}
      </div>

      {/* Pre-generation Checklist */}
      <div className="surface p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Scheduling Prerequisites</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            {courses.length > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            )}
            <div>
              <p className="font-bold text-xs text-slate-800">Courses</p>
              <p className="text-xs text-slate-500">{courses.length} available</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            {lectureHalls.length > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            )}
            <div>
              <p className="font-bold text-xs text-slate-800">Lecture Halls</p>
              <p className="text-xs text-slate-500">{lectureHalls.length} available</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            {timeSlots.length > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            )}
            <div>
              <p className="font-bold text-xs text-slate-800">Time Slots</p>
              <p className="text-xs text-slate-500">{timeSlots.length} available</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200/80">
            <Coffee className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-xs text-amber-900">Lunch Policy</p>
              <p className="text-xs text-amber-700">{policies.lunchBreakStart} - {policies.lunchBreakEnd}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="surface space-y-6 p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900">Optimization Parameters</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-600" />
                Enforce Protected Lunch Break
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Guarantee that no lecture is scheduled into the {policies.lunchBreakStart} - {policies.lunchBreakEnd} lunch window.
              </p>
            </div>
            <input
              type="checkbox"
              checked={enforceLunchBreak}
              onChange={(e) => setEnforceLunchBreak(e.target.checked)}
              className="w-5 h-5 mt-1 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Passing Buffer Between Classes
              </span>
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                {minBufferMinutes} Mins
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={minBufferMinutes}
              onChange={(e) => setMinBufferMinutes(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <p className="text-[11px] text-slate-400">
              Prevents scheduling back-to-back lectures for instructors without adequate transition.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleGenerate}
            disabled={generating || !canGenerate}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-extrabold text-base shadow-xl shadow-brand-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {generating ? 'Running Solver Algorithm...' : 'Generate Conflict-Free Schedule'}
          </button>
        </div>
      </div>

      {/* Generation Results */}
      {generationResult && (
        <div className="surface animate-fade-in space-y-6 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Timetable Generated Successfully
              </h3>
              <p className="text-xs text-slate-500">
                Algorithm optimized capacity fitness, break protections, and room utilizations.
              </p>
            </div>
            <Link
              to="/timetable"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
            >
              View Full Timetable <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase">Classes Scheduled</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{generationResult.generatedCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase">Break Compliance</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{generationResult.breakComplianceRate}%</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase">Hall Utilization</span>
              <p className="text-2xl font-extrabold text-brand-600 mt-1">{generationResult.utilizationRate}%</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase">Remaining Conflicts</span>
              <p className={`text-2xl font-extrabold mt-1 ${
                generationResult.conflictCount === 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {generationResult.conflictCount}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
