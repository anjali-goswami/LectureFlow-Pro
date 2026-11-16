import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../services/api.js';
import {
  Landmark,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import Modal from '../common/Modal.jsx';

const PRESET_FACILITIES = [
  'Projector',
  'Whiteboard',
  'Smart Board',
  'Audio System',
  'Air Conditioning',
  'Computer Lab',
  'Video Conferencing',
  'Lecture Recording',
  'Document Camera',
  'High-speed WiFi',
  'Wheelchair Accessible'
];

export default function LectureHallManagement() {
  const { lectureHalls, schedules, timeSlots, showToast, refreshAll, isAdmin } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    roomNumber: '',
    location: '',
    capacity: 60,
    facilities: ['Projector', 'Whiteboard'],
    isAvailable: true
  });

  const filteredHalls = lectureHalls.filter(h =>
    h.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingHall(null);
    setFormData({
      roomNumber: '',
      location: '',
      capacity: 80,
      facilities: ['Projector', 'Whiteboard', 'Audio System'],
      isAvailable: true
    });
    setModalOpen(true);
  };

  const openEditModal = (hall) => {
    setEditingHall(hall);
    setFormData({
      roomNumber: hall.roomNumber,
      location: hall.location,
      capacity: hall.capacity || 50,
      facilities: hall.facilities || [],
      isAvailable: hall.isAvailable !== false
    });
    setModalOpen(true);
  };

  const toggleFacility = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingHall) {
        await api.updateLectureHall(editingHall.id, formData);
        showToast(`Lecture Hall '${formData.roomNumber}' updated`);
      } else {
        await api.createLectureHall(formData);
        showToast(`Lecture Hall '${formData.roomNumber}' registered`);
      }
      setModalOpen(false);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (hall) => {
    try {
      await api.toggleHallStatus(hall.id);
      showToast(`Room ${hall.roomNumber} status toggled`);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (hall) => {
    if (!window.confirm(`Delete Room ${hall.roomNumber}?`)) return;
    try {
      await api.deleteLectureHall(hall.id);
      showToast(`Room ${hall.roomNumber} removed`);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="icon-tile h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              <Landmark className="h-5 w-5" />
            </span>
            Lecture Halls &amp; Facilities
          </h1>
          <p className="page-subtitle">
            Register university lecture halls, auditoriums, seating capacities, and multimedia equipment.
          </p>
        </div>

        {isAdmin ? (
          <button onClick={openAddModal} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Lecture Hall
          </button>
        ) : (
          <span className="chip chip-neutral">View only</span>
        )}
      </div>

      {/* Search */}
      <div className="surface flex max-w-md items-center gap-3 px-3.5 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder="Search by room number or building..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Hall Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredHalls.map(hall => {
          const hallSchedules = schedules.filter(s => s.lectureHallId === hall.id);
          const totalSlots = timeSlots.length || 1;
          const utilizationRate = Math.min(100, Math.round((hallSchedules.length / totalSlots) * 100));

          return (
            <div
              key={hall.id}
              className={`card-interactive flex flex-col justify-between p-5 ${
                !hall.isAvailable ? 'border-amber-200 bg-amber-50/30' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg text-slate-900">
                      Room {hall.roomNumber}
                    </span>
                    {isAdmin ? (
                      <button
                        onClick={() => handleToggleStatus(hall)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border cursor-pointer transition-colors ${
                          hall.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle availability"
                      >
                        {hall.isAvailable ? 'Available' : 'Maintenance'}
                      </button>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                          hall.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {hall.isAvailable ? 'Available' : 'Maintenance'}
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(hall)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hall)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{hall.location}</span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                  <Users className="w-3.5 h-3.5 text-brand-500" />
                  <span>Capacity: {hall.capacity} Seats</span>
                </div>

                {/* Facilities Badges */}
                <div className="mt-3.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    Equipment &amp; Facilities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(hall.facilities || []).map(f => (
                      <span key={f} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <span className="text-slate-500">{hallSchedules.length} Classes Assigned</span>
                  <span className="font-bold text-slate-800">{utilizationRate}% Utilized</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      utilizationRate > 80 ? 'bg-amber-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.max(4, utilizationRate)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingHall ? `Edit Room ${editingHall.roomNumber}` : 'Register New Lecture Hall'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                placeholder="e.g. A101"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="input font-semibold uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Seating Capacity *
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="input font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Building &amp; Floor Location *
            </label>
            <input
              type="text"
              placeholder="e.g. Turing Hall, 2nd Floor"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input"
              required
            />
          </div>

          {/* Facilities Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Available Facilities &amp; Equipment
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_FACILITIES.map(fac => {
                const isSelected = formData.facilities.includes(fac);
                return (
                  <button
                    key={fac}
                    type="button"
                    onClick={() => toggleFacility(fac)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-brand-50 border-brand-300 text-brand-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{fac}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-brand-600 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-4 h-4 text-brand-600 rounded"
            />
            <label htmlFor="isAvailable" className="text-xs font-bold text-slate-700 cursor-pointer">
              Room is currently available for class allocation
            </label>
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
              {submitting ? 'Saving...' : editingHall ? 'Update Room' : 'Register Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
