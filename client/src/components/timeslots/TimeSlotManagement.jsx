import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../services/api.js';
import {
  Clock,
  Plus,
  Coffee,
  Trash2,
  Edit2,
  CalendarDays,
  AlertTriangle
} from 'lucide-react';
import Modal from '../common/Modal.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimeSlotManagement() {
  const { timeSlots, schedules, policies, showToast, refreshAll } = useApp();

  const [activeDay, setActiveDay] = useState('Monday');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    day: 'Monday',
    startTime: '08:30',
    endTime: '09:45'
  });

  const slotsForDay = timeSlots
    .filter(s => s.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const openAddModal = () => {
    setEditingSlot(null);
    setFormData({
      day: activeDay,
      startTime: '10:00',
      endTime: '11:15'
    });
    setModalOpen(true);
  };

  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setFormData({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSlot) {
        await api.updateTimeSlot(editingSlot.id, formData);
        showToast('Time slot updated');
      } else {
        await api.createTimeSlot(formData);
        showToast('Time slot added successfully');
      }
      setModalOpen(false);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slot) => {
    if (!window.confirm(`Delete ${slot.day} ${slot.startTime} - ${slot.endTime}?`)) return;
    try {
      await api.deleteTimeSlot(slot.id);
      showToast('Time slot deleted');
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="icon-tile h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              <Clock className="h-5 w-5" />
            </span>
            Time Slot Definitions
          </h1>
          <p className="page-subtitle">
            Define daily academic lecture periods and view how they align with institutional lunch hours.
          </p>
        </div>

        <button onClick={openAddModal} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Time Slot
        </button>
      </div>

      {/* Day Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {DAYS.map(day => {
          const count = timeSlots.filter(s => s.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDay === day
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {day} ({count})
            </button>
          );
        })}
      </div>

      {/* Slots List */}
      <div className="space-y-3">
        {slotsForDay.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No time slots defined for {activeDay}. Click &quot;Add Time Slot&quot; to configure one.
          </div>
        ) : (
          slotsForDay.map(slot => {
            const scheduledCount = schedules.filter(s => s.timeSlotId === slot.id).length;
            const overlapsLunch = (slot.startTime >= policies.lunchBreakStart && slot.startTime < policies.lunchBreakEnd) ||
                                  (slot.endTime > policies.lunchBreakStart && slot.endTime <= policies.lunchBreakEnd);

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl bg-white border shadow-xs flex items-center justify-between gap-4 transition-all ${
                  overlapsLunch ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    overlapsLunch ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {overlapsLunch ? <Coffee className="w-5 h-5 text-amber-700" /> : <Clock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-extrabold text-slate-900">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      {overlapsLunch && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Overlaps Lunch Window ({policies.lunchBreakStart}-{policies.lunchBreakEnd})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {slot.day} • {scheduledCount} active lecture(s) assigned
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(slot)}
                    className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slot)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Day of Week *
            </label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              className="input font-semibold"
              required
            >
              {DAYS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input font-semibold"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary btn-sm"
            >
              {submitting ? 'Saving...' : editingSlot ? 'Update Time Slot' : 'Add Time Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
