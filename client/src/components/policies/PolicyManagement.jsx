import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../services/api.js';
import {
  Coffee,
  ShieldCheck,
  Clock,
  MapPin,
  Flame,
  CheckCircle2,
  AlertCircle,
  Save,
  HelpCircle
} from 'lucide-react';

export default function PolicyManagement() {
  const { policies, setPolicies, showToast, refreshConflicts, conflicts } = useApp();

  const [formData, setFormData] = useState({
    lunchBreakStart: policies.lunchBreakStart || '12:00',
    lunchBreakEnd: policies.lunchBreakEnd || '13:00',
    lunchBreakEnforced: policies.lunchBreakEnforced !== false,
    minTransitionMinutes: policies.minTransitionMinutes || 15,
    maxConsecutiveHours: policies.maxConsecutiveHours || 3,
    buildingChangeBufferMinutes: policies.buildingChangeBufferMinutes || 20
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updatePolicies(formData);
      setPolicies(res.policies);
      await refreshConflicts();
      showToast('Institutional Break & Lunch Policies updated successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const lunchConflictsCount = conflicts.filter(c => c.type === 'lunch_break').length;
  const transitionConflictsCount = conflicts.filter(c => c.type === 'insufficient_break').length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="page-title">
          <span className="icon-tile h-9 w-9 bg-amber-50 text-amber-600 ring-1 ring-amber-100">
            <Coffee className="h-5 w-5" />
          </span>
          Break &amp; Lunch Policy Configuration
        </h1>
        <p className="page-subtitle">
          Define institutional lunch break hours, mandatory student passing periods, and faculty fatigue thresholds.
        </p>
      </div>

      {/* Real-time Status Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-2xl border ${
          lunchConflictsCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${lunchConflictsCount > 0 ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'}`}>
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Lunch Break Protection</p>
              <p className="text-xs opacity-90">
                {lunchConflictsCount > 0
                  ? `${lunchConflictsCount} class(es) currently collide with lunch hours.`
                  : 'Zero lunch break violations in current schedule.'}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${
          transitionConflictsCount > 0 ? 'bg-orange-50 border-orange-200 text-orange-900' : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${transitionConflictsCount > 0 ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Passing Period &amp; Buffer</p>
              <p className="text-xs opacity-90">
                {transitionConflictsCount > 0
                  ? `${transitionConflictsCount} schedule(s) lack required ${formData.minTransitionMinutes}-min transition buffer.`
                  : `All consecutive classes have ≥ ${formData.minTransitionMinutes} min passing buffer.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Lunch Break Window */}
        <div className="surface space-y-6 p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Protected Lunch Break Window</h2>
                <p className="text-xs text-slate-500">
                  Classes scheduled within this period will be flagged as conflicts and avoided during auto-generation.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lunchBreakEnforced}
                onChange={(e) => setFormData({ ...formData, lunchBreakEnforced: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="ml-3 text-xs font-bold text-slate-700">
                {formData.lunchBreakEnforced ? 'Enforced' : 'Disabled'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Lunch Window Starts At
              </label>
              <input
                type="time"
                value={formData.lunchBreakStart}
                onChange={(e) => setFormData({ ...formData, lunchBreakStart: e.target.value })}
                className="input font-semibold"
                required
              />
              <span className="text-xs text-slate-400 mt-1 block">Standard university default: 12:00</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Lunch Window Ends At
              </label>
              <input
                type="time"
                value={formData.lunchBreakEnd}
                onChange={(e) => setFormData({ ...formData, lunchBreakEnd: e.target.value })}
                className="input font-semibold"
                required
              />
              <span className="text-xs text-slate-400 mt-1 block">Standard university default: 13:00</span>
            </div>
          </div>
        </div>

        {/* Section 2: Transition & Buffer Times */}
        <div className="surface space-y-6 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Passing Periods &amp; Campus Travel Buffers</h2>
              <p className="text-xs text-slate-500">
                Ensures students and instructors have enough travel time between consecutive lectures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Minimum Passing Period (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                step="5"
                value={formData.minTransitionMinutes}
                onChange={(e) => setFormData({ ...formData, minTransitionMinutes: parseInt(e.target.value) || 0 })}
                className="input font-semibold"
                required
              />
              <span className="text-xs text-slate-400 mt-1 block">
                Recommended: 10 - 15 minutes between back-to-back classes.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Cross-Building Travel Buffer (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="90"
                step="5"
                value={formData.buildingChangeBufferMinutes}
                onChange={(e) => setFormData({ ...formData, buildingChangeBufferMinutes: parseInt(e.target.value) || 0 })}
                className="input font-semibold"
                required
              />
              <span className="text-xs text-slate-400 mt-1 block">
                Buffer required when consecutive classes are in different campus buildings.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Faculty Fatigue Prevention */}
        <div className="surface space-y-6 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Faculty Workload &amp; Fatigue Threshold</h2>
              <p className="text-xs text-slate-500">
                Prevents back-to-back teaching overload without adequate cognitive rest.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Maximum Continuous Teaching Hours
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="5"
                step="0.5"
                value={formData.maxConsecutiveHours}
                onChange={(e) => setFormData({ ...formData, maxConsecutiveHours: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <span className="text-sm font-extrabold text-slate-900 w-24 text-right">
                {formData.maxConsecutiveHours} Hours
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-2 block">
              Flag conflict if a faculty member is scheduled for more than {formData.maxConsecutiveHours} consecutive hours without at least a 30-min break.
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Policies...' : 'Save & Enforce Policies'}
          </button>
        </div>
      </form>
    </div>
  );
}
