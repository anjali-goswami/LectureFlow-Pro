import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../services/api.js';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  User,
  Users,
  Award,
  CalendarCheck,
  CalendarX
} from 'lucide-react';
import Modal from '../common/Modal.jsx';

export default function CourseManagement() {
  const { courses, departments, schedules, showToast, refreshAll, isAdmin } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    instructor: '',
    departmentId: '',
    studentCount: 50,
    credits: 3
  });

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.code.toLowerCase().includes(search.toLowerCase()) ||
                          c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'all' || c.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      name: '',
      instructor: '',
      departmentId: departments[0]?.id || '',
      studentCount: 60,
      credits: 3
    });
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      instructor: course.instructor,
      departmentId: course.departmentId || '',
      studentCount: course.studentCount || 0,
      credits: course.credits || 3
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, formData);
        showToast(`Course '${formData.code}' updated successfully`);
      } else {
        await api.createCourse(formData);
        showToast(`Course '${formData.code}' created successfully`);
      }
      setModalOpen(false);
      await refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete ${course.code} - ${course.name}?`)) return;
    try {
      await api.deleteCourse(course.id);
      showToast(`Course '${course.code}' deleted`);
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
              <BookOpen className="h-5 w-5" />
            </span>
            Course Curriculum
          </h1>
          <p className="page-subtitle">
            Register academic courses, student enrollments, faculty instructors, and scheduling requirements.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={openAddModal}
            disabled={departments.length === 0}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </button>
        ) : (
          <span className="chip chip-neutral">View only</span>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="surface flex flex-1 items-center gap-3 px-3.5 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, title, or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="surface flex items-center gap-2 px-3 py-2 sm:w-64">
          <Filter className="h-4 w-4 shrink-0 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold outline-none"
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map(course => {
          const dept = departments.find(d => d.id === course.departmentId);
          const isScheduled = schedules.some(s => s.courseId === course.id);

          return (
            <div
              key={course.id}
              className="card-interactive flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      {course.code}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {dept ? dept.code : 'No Dept'}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(course)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5 line-clamp-1">
                  {course.name}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Instructor: <strong className="text-slate-800">{course.instructor}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Enrollment: <strong className="text-slate-800">{course.studentCount} Students</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>Credits: <strong className="text-slate-800">{course.credits} Credits</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className={`inline-flex items-center gap-1 font-bold ${
                  isScheduled ? 'text-emerald-700' : 'text-slate-400'
                }`}>
                  {isScheduled ? (
                    <>
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Scheduled
                    </>
                  ) : (
                    <>
                      <CalendarX className="w-3.5 h-3.5 text-slate-400" />
                      Unscheduled
                    </>
                  )}
                </span>
                <span className="text-slate-400 text-[11px]">ID: {course.id.slice(0, 8)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? `Edit Course: ${editingCourse.code}` : 'Register New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                placeholder="e.g. CS101"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input font-semibold uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Department *
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="input font-medium"
                required
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Introduction to Computer Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Instructor Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Sarah Johnson"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Enrolled Students *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={formData.studentCount}
                onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Credit Hours *
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                className="input"
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
              {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
