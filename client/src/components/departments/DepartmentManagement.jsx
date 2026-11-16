import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../services/api.js';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  Users,
  MapPin
} from 'lucide-react';
import Modal from '../common/Modal.jsx';

export default function DepartmentManagement() {
  const { departments, setDepartments, showToast, refreshAll, isAdmin } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    building: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '', building: '' });
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      building: dept.building || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDept) {
        const updated = await api.updateDepartment(editingDept.id, formData);
        showToast(`Department '${updated.name}' updated successfully`);
      } else {
        const created = await api.createDepartment(formData);
        showToast(`Department '${created.name}' created successfully`);
      }
      setModalOpen(false);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete ${dept.name}?`)) return;
    try {
      await api.deleteDepartment(dept.id);
      showToast(`Department '${dept.name}' deleted`);
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
              <Building2 className="h-5 w-5" />
            </span>
            Academic Departments
          </h1>
          <p className="page-subtitle">
            Manage academic faculties, codes, campus buildings, and course assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
            {isAdmin ? (
              <button onClick={openAddModal} className="btn-primary">
                <Plus className="h-4 w-4" />
                Add Department
              </button>
            ) : (
              <span className="chip chip-neutral">View only</span>
            )}
          </div>
      </div>

      {/* Search Bar */}
      <div className="surface flex max-w-md items-center gap-3 px-3.5 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder="Search by department name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepts.map(dept => (
          <div
            key={dept.id}
            className="card-interactive flex flex-col justify-between p-5"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-100 text-brand-800 border border-brand-200">
                    {dept.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{dept.name}</h3>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {dept.description || 'No description provided.'}
              </p>

              {dept.building && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dept.building}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                <span className="font-semibold">{dept.courseCount || 0} Courses</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">{dept.totalStudents || 0} Students</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.code}` : 'Add New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Department Code *
              </label>
              <input
                type="text"
                placeholder="e.g. CS"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input font-semibold uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Building / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Turing Hall"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows="3"
              placeholder="Academic scope and faculty information..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="textarea"
            />
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
              {submitting ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
