import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../services/api.js';
import {
  CalendarDays,
  Plus,
  Printer,
  Filter,
  Coffee,
  AlertTriangle,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Modal from '../common/Modal.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DEPT_TONES = [
  { bar: 'border-l-brand-500', dot: 'bg-brand-500' },
  { bar: 'border-l-emerald-500', dot: 'bg-emerald-500' },
  { bar: 'border-l-blue-500', dot: 'bg-blue-500' },
  { bar: 'border-l-violet-500', dot: 'bg-violet-500' },
  { bar: 'border-l-amber-500', dot: 'bg-amber-500' },
  { bar: 'border-l-rose-500', dot: 'bg-rose-500' },
  { bar: 'border-l-cyan-500', dot: 'bg-cyan-500' }
];

function toMinutes(value) {
  if (!value) return 0;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function rangesOverlap(startA, endA, startB, endB) {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA);
}

function toneForDepartment(departmentId) {
  if (!departmentId) return DEPT_TONES[0];
  let hash = 0;
  for (let i = 0; i < departmentId.length; i += 1) {
    hash = (hash + departmentId.charCodeAt(i) * (i + 1)) % 9973;
  }
  return DEPT_TONES[hash % DEPT_TONES.length];
}

export default function Timetable() {
  const {
    schedules,
    timeSlots,
    lectureHalls,
    departments,
    courses,
    policies,
    refreshAll,
    showToast,
    isAdmin
  } = useApp();

  const [selectedHall, setSelectedHall] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedInstructor, setSelectedInstructor] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const EmptyCell = isAdmin ? 'button' : 'div';
  const LectureCard = isAdmin ? 'button' : 'div';

  const instructors = useMemo(
    () => Array.from(new Set(courses.map(c => c.instructor).filter(Boolean))).sort(),
    [courses]
  );

  // The grid rows are the union of configured time slots and any custom lecture times.
  const timeRanges = useMemo(() => {
    const ranges = new Map();
    timeSlots.forEach(slot => {
      ranges.set(`${slot.startTime}-${slot.endTime}`, {
        start: slot.startTime,
        end: slot.endTime
      });
    });
    schedules.forEach(schedule => {
      ranges.set(`${schedule.startTime}-${schedule.endTime}`, {
        start: schedule.startTime,
        end: schedule.endTime
      });
    });
    return Array.from(ranges.values()).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  }, [timeSlots, schedules]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      if (selectedDay !== 'all' && schedule.day !== selectedDay) return false;
      if (selectedHall !== 'all' && schedule.lectureHallId !== selectedHall) return false;

      const course = courses.find(c => c.id === schedule.courseId);
      if (selectedDept !== 'all' && course?.departmentId !== selectedDept) return false;
      if (selectedInstructor !== 'all' && course?.instructor !== selectedInstructor) return false;

      return true;
    });
  }, [schedules, courses, selectedDay, selectedHall, selectedDept, selectedInstructor]);

  const scheduledCourseIds = useMemo(
    () => new Set(schedules.map(schedule => schedule.courseId)),
    [schedules]
  );
  const unscheduledCourses = useMemo(
    () => courses.filter(course => !scheduledCourseIds.has(course.id)),
    [courses, scheduledCourseIds]
  );

  const hallsInUse = new Set(filteredSchedules.map(s => s.lectureHallId)).size;
  const conflictCount = filteredSchedules.filter(s => s.hasConflict).length;
  const totalCapacity = lectureHalls.length * timeSlots.length;
  const utilizationRate = totalCapacity > 0
    ? Math.min(100, Math.round((filteredSchedules.length / totalCapacity) * 100))
    : 0;

  const visibleDays = selectedDay === 'all' ? DAYS : [selectedDay];
  const filtersActive =
    selectedDay !== 'all' || selectedHall !== 'all' || selectedDept !== 'all' || selectedInstructor !== 'all';

  const resetFilters = () => {
    setSelectedDay('all');
    setSelectedHall('all');
    setSelectedDept('all');
    setSelectedInstructor('all');
  };

  const openCreate = (day, startTime, endTime) => {
    if (courses.length === 0 || lectureHalls.length === 0) {
      showToast('Add at least one course and one lecture hall before scheduling.', 'info');
      return;
    }

    const slot = timeSlots.find(
      s => s.day === day && s.startTime === startTime && s.endTime === endTime
    );

    if (!slot) {
      showToast(`No time slot is defined for ${day} at ${startTime}. Add one in Time Slots first.`, 'info');
      return;
    }

    setEditingId(null);
    setForm({
      courseId: '',
      lectureHallId: '',
      day,
      timeSlotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime
    });
    setConfirmDelete(false);
    setModalOpen(true);
  };

  const openEdit = schedule => {
    const slot =
      timeSlots.find(s => s.id === schedule.timeSlotId) ||
      timeSlots.find(
        s => s.day === schedule.day && s.startTime === schedule.startTime && s.endTime === schedule.endTime
      );

    setEditingId(schedule.id);
    setForm({
      courseId: schedule.courseId || '',
      lectureHallId: schedule.lectureHallId || '',
      day: schedule.day,
      timeSlotId: slot?.id || '',
      startTime: schedule.startTime,
      endTime: schedule.endTime
    });
    setConfirmDelete(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(null);
    setConfirmDelete(false);
  };

  const handleDayChange = day => {
    const firstSlot = timeSlots
      .filter(s => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

    setForm(prev => ({
      ...prev,
      day,
      timeSlotId: firstSlot?.id || '',
      startTime: firstSlot?.startTime || prev.startTime,
      endTime: firstSlot?.endTime || prev.endTime
    }));
  };

  const handleSlotChange = timeSlotId => {
    const slot = timeSlots.find(s => s.id === timeSlotId);
    setForm(prev => ({
      ...prev,
      timeSlotId,
      startTime: slot?.startTime || prev.startTime,
      endTime: slot?.endTime || prev.endTime
    }));
  };

  const handleSave = async event => {
    event.preventDefault();
    if (confirmDelete) return;
    if (!form?.courseId || !form?.lectureHallId || !form?.startTime || !form?.endTime) return;

    if (toMinutes(form.endTime) <= toMinutes(form.startTime)) {
      showToast('End time must be later than start time', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        courseId: form.courseId,
        lectureHallId: form.lectureHallId,
        timeSlotId: form.timeSlotId || null,
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime
      };

      if (editingId) {
        await api.updateSchedule(editingId, payload);
        showToast('Lecture updated');
      } else {
        await api.createSchedule(payload);
        showToast('Lecture added to the timetable');
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(null);
      setConfirmDelete(false);
      await refreshAll();
    } catch (err) {
      showToast(err.message || 'Could not save the lecture', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;

    setSaving(true);
    try {
      await api.deleteSchedule(editingId);
      showToast('Lecture removed');
      setModalOpen(false);
      setEditingId(null);
      setForm(null);
      setConfirmDelete(false);
      await refreshAll();
    } catch (err) {
      showToast(err.message || 'Could not remove the lecture', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getCellSchedules = (day, startTime) =>
    filteredSchedules.filter(s => s.day === day && s.startTime === startTime);

  const formCourse = courses.find(c => c.id === form?.courseId);
  const formHall = lectureHalls.find(h => h.id === form?.lectureHallId);
  const overCapacity =
    Boolean(formCourse && formHall) &&
    (formCourse.studentCount || 0) > (formHall.capacity || 0);
  const daySlots = form
    ? timeSlots.filter(s => s.day === form.day).sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];
  const overlapsLunch =
    Boolean(form?.startTime && form?.endTime) &&
    rangesOverlap(form.startTime, form.endTime, policies.lunchBreakStart, policies.lunchBreakEnd);

  const summary = [
    { label: 'Scheduled', value: filteredSchedules.length, icon: CalendarDays, tone: 'text-brand-600' },
    { label: 'Halls in use', value: `${hallsInUse}/${lectureHalls.length}`, icon: MapPin, tone: 'text-emerald-600' },
    { label: 'Conflicts', value: conflictCount, icon: AlertTriangle, tone: conflictCount > 0 ? 'text-rose-600' : 'text-emerald-600' },
    { label: 'Utilization', value: `${utilizationRate}%`, icon: Sparkles, tone: 'text-violet-600' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Print-only heading */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold text-slate-900">Master University Timetable</h1>
        <p className="mt-1 text-xs text-slate-600">
          Lunch break {policies.lunchBreakStart} â€“ {policies.lunchBreakEnd} Â· {filteredSchedules.length} lectures
        </p>
      </div>

      {/* Header */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">
            <span className="icon-tile h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              <CalendarDays className="h-5 w-5" />
            </span>
            Class Timetable
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'A live weekly view of every lecture. Click a class to edit it, or an empty slot to add one.'
              : 'A live weekly view of every lecture. Use the filters to find a class, instructor or room.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={() => window.print()} className="btn-secondary">
            <Printer className="h-4 w-4 text-slate-500" />
            Print
          </button>

          {isAdmin ? (
            <button
              onClick={() => {
                const firstSlot = timeSlots[0];
                openCreate(firstSlot?.day || DAYS[0], firstSlot?.startTime, firstSlot?.endTime);
              }}
              className="btn-primary"
              disabled={timeSlots.length === 0 || courses.length === 0 || lectureHalls.length === 0}
            >
              <Plus className="h-4 w-4" />
              Add Lecture
            </button>
          ) : (
            <span className="chip chip-neutral">Read-only</span>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div className="surface grid grid-cols-2 gap-px overflow-hidden bg-slate-100 sm:grid-cols-4">
        {summary.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3 bg-white p-4">
              <span className="icon-tile h-9 w-9 bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                <Icon className={`h-4 w-4 ${stat.tone}`} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                <p className="text-lg font-bold leading-tight text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unscheduled courses notice */}
      {unscheduledCourses.length > 0 && (
        <div className="no-print flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="icon-tile h-9 w-9 shrink-0 bg-amber-100 text-amber-700 ring-1 ring-amber-200">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {unscheduledCourses.length} course{unscheduledCourses.length === 1 ? '' : 's'} not scheduled yet
              </p>
              <p className="mt-0.5 text-xs text-amber-800">
                {unscheduledCourses.slice(0, 4).map(c => c.code).join(', ')}
                {unscheduledCourses.length > 4 ? ` +${unscheduledCourses.length - 4} more` : ''}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Link
              to="/schedule-generator"
              className="btn-dark btn-sm shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Auto-schedule
            </Link>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="surface no-print space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Filter view
          </p>
          {filtersActive && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={selectedHall}
            onChange={e => setSelectedHall(e.target.value)}
            className="select text-xs"
            aria-label="Filter by lecture hall"
          >
            <option value="all">All lecture halls ({lectureHalls.length})</option>
            {lectureHalls.map(hall => (
              <option key={hall.id} value={hall.id}>
                Room {hall.roomNumber} Â· {hall.capacity} seats
              </option>
            ))}
          </select>

          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="select text-xs"
            aria-label="Filter by department"
          >
            <option value="all">All departments ({departments.length})</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>

          <select
            value={selectedInstructor}
            onChange={e => setSelectedInstructor(e.target.value)}
            className="select text-xs"
            aria-label="Filter by instructor"
          >
            <option value="all">All instructors ({instructors.length})</option>
            {instructors.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedDay}
            onChange={e => setSelectedDay(e.target.value)}
            className="select text-xs"
            aria-label="Filter by day"
          >
            <option value="all">Full week (Mon â€“ Fri)</option>
            {DAYS.map(day => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="no-print flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border-l-4 border-brand-500 bg-white" />
          Scheduled lecture
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border-l-4 border-rose-500 bg-rose-50" />
          Conflict
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-200" />
          Lunch window
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-slate-300" />
          Empty slot
        </span>
        <span className="ml-auto hidden items-center gap-1.5 sm:flex">
          {isAdmin ? (
            <>
              <Pencil className="h-3 w-3" />
              Click a lecture to edit
            </>
          ) : (
            <>
              <CalendarDays className="h-3 w-3" />
              Read-only timetable
            </>
          )}
        </span>
      </div>

      {/* Grid */}
      {timeRanges.length === 0 ? (
        <div className="surface flex flex-col items-center px-6 py-16 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <CalendarDays className="h-6 w-6" />
          </span>
          <h2 className="text-base font-bold text-slate-900">No time slots configured</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Define the daily lecture periods before scheduling classes.
          </p>
          <Link to="/time-slots" className="btn-primary btn-sm mt-4">
            Set up time slots
          </Link>
        </div>
      ) : (
        <div className="surface timetable-print-container overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="sticky left-0 z-20 w-32 border-r border-slate-200 bg-slate-50 px-4 py-3 font-bold">Day</th>
                  {timeRanges.map(range => {
                    const lunch = rangesOverlap(range.start, range.end, policies.lunchBreakStart, policies.lunchBreakEnd);
                    return <th key={`${range.start}-${range.end}`} className={`min-w-[190px] border-r border-slate-200 px-3 py-3 text-center font-bold last:border-r-0 ${lunch ? 'bg-amber-50 text-amber-800' : ''}`}>
                      <span className="block">{range.start} – {range.end}</span>
                      {lunch && <span className="mt-1 inline-flex items-center gap-1 text-[9px] normal-case"><Coffee className="h-3 w-3" />Lunch window</span>}
                    </th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleDays.map(day => <tr key={day} className="border-b border-slate-100 last:border-b-0">
                  <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-4 py-3 align-top"><span className="text-xs font-bold text-slate-800">{day}</span></td>
                  {timeRanges.map(range => {
                    const lunch = rangesOverlap(range.start, range.end, policies.lunchBreakStart, policies.lunchBreakEnd);
                    const cellSchedules = getCellSchedules(day, range.start);
                    const hasSlot = timeSlots.some(s => s.day === day && s.startTime === range.start && s.endTime === range.end);
                    return <td key={`${day}-${range.start}`} className={`border-r border-slate-200 p-2 align-top last:border-r-0 ${lunch ? 'bg-amber-50/40' : ''}`}>
                      {cellSchedules.length === 0 ? <EmptyCell
                        {...(isAdmin ? { type: 'button', onClick: () => openCreate(day, range.start, range.end) } : {})}
                        className={`group flex min-h-[64px] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-[10px] transition-colors ${lunch ? 'border-amber-200 text-amber-600' : isAdmin && hasSlot ? 'border-transparent text-slate-300 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-600' : 'border-transparent text-slate-300'}`}
                        title={isAdmin && hasSlot ? `Add lecture on ${day} at ${range.start}` : undefined}
                      >
                        {lunch ? <><Coffee className="h-3.5 w-3.5" /><span className="font-semibold">Lunch break</span></> : isAdmin && hasSlot ? <><Plus className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" /><span className="opacity-0 transition-opacity group-hover:opacity-100">Add</span></> : <span>—</span>}
                      </EmptyCell> : <div className="space-y-1.5">
                        {cellSchedules.map(schedule => {
                          const course = courses.find(c => c.id === schedule.courseId);
                          const hall = lectureHalls.find(h => h.id === schedule.lectureHallId);
                          const tone = toneForDepartment(course?.departmentId);
                          const overCapacity = (course?.studentCount || 0) > (hall?.capacity || 0);
                          return <LectureCard key={schedule.id} {...(isAdmin ? { type: 'button', onClick: () => openEdit(schedule) } : {})}
                            className={`group w-full rounded-lg border border-l-4 p-2 text-left shadow-xs ${isAdmin ? 'cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm' : ''} ${schedule.hasConflict ? 'border-rose-200 border-l-rose-500 bg-rose-50/60' : `${tone.bar} border-slate-200 bg-white ${isAdmin ? 'hover:border-brand-300' : ''}`}`}
                            title={isAdmin ? 'Click to edit lecture' : undefined}>
                            <div className="flex items-start justify-between gap-1"><span className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-500">{course?.code || '—'}</span>{schedule.hasConflict ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500" /> : isAdmin ? <Pencil className="h-3 w-3 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" /> : null}</div>
                            <p className="mt-0.5 truncate text-[11px] font-semibold leading-snug text-slate-900">{course?.name || 'Unknown course'}</p>
                            <p className="truncate text-[10px] text-slate-500">{course?.instructor || '—'}</p>
                            <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-slate-100 pt-1 text-[9px] text-slate-500"><span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{hall?.roomNumber || '—'}</span><span className={`inline-flex items-center gap-0.5 font-semibold ${overCapacity ? 'text-rose-600' : 'text-slate-600'}`}><Users className="h-2.5 w-2.5" />{course?.studentCount || 0}/{hall?.capacity || 0}</span></div>
                          </LectureCard>;
                        })}
                      </div>}
                    </td>;
                  })}
                </tr>)}
              </tbody>
            </table>
          </div>

          {filteredSchedules.length === 0 && schedules.length > 0 && (
            <div className="flex flex-col items-center gap-2 border-t border-slate-100 px-6 py-10 text-center">
              <CheckCircle2 className="h-6 w-6 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No lectures match the current filters.</p>
              <button onClick={resetFilters} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / edit lecture */}
      {form && (
        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title={editingId ? 'Edit lecture' : 'Schedule a lecture'}
          subtitle={editingId ? 'Update the course, room or time for this class.' : 'Assign a course to a room and time.'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label" htmlFor="course">
                Course
              </label>
              <select
                id="course"
                value={form.courseId}
                onChange={e => setForm(prev => ({ ...prev, courseId: e.target.value }))}
                className="select"
                required
              >
                <option value="">Select a courseâ€¦</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} â€” {course.name} ({course.studentCount} students)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="hall">
                Lecture hall
              </label>
              <select
                id="hall"
                value={form.lectureHallId}
                onChange={e => setForm(prev => ({ ...prev, lectureHallId: e.target.value }))}
                className="select"
                required
              >
                <option value="">Select a lecture hallâ€¦</option>
                {lectureHalls.map(hall => (
                  <option key={hall.id} value={hall.id} disabled={!hall.isAvailable}>
                    Room {hall.roomNumber} â€” {hall.location} ({hall.capacity} seats)
                    {!hall.isAvailable ? ' Â· unavailable' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="day">
                  Day
                </label>
                <select
                  id="day"
                  value={form.day}
                  onChange={e => handleDayChange(e.target.value)}
                  className="select"
                  required
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="slot">
                  Time slot
                </label>
                <select
                  id="slot"
                  value={form.timeSlotId}
                  onChange={e => handleSlotChange(e.target.value)}
                  className="select"
                  required
                >
                  <option value="">Select a timeâ€¦</option>
                  {daySlots.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {slot.startTime} â€“ {slot.endTime}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {daySlots.length === 0 && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                No time slots are defined for {form.day}. Add one in{' '}
                <Link to="/time-slots" className="font-semibold underline">
                  Time Slots
                </Link>
                .
              </p>
            )}

            {/* Summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">
                    {form.day} Â· {form.startTime || 'â€”'} â€“ {form.endTime || 'â€”'}
                  </span>
                </span>
                {formHall && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Room {formHall.roomNumber} Â· {formHall.capacity} seats
                  </span>
                )}
                {formCourse && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {formCourse.studentCount} enrolled
                  </span>
                )}
              </div>

              {overCapacity && (
                <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 font-medium text-rose-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  This class exceeds the room capacity by{' '}
                  {(formCourse.studentCount || 0) - (formHall.capacity || 0)} seats.
                </p>
              )}

              {overlapsLunch && (
                <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 font-medium text-amber-800">
                  <Coffee className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  This time overlaps the protected lunch window ({policies.lunchBreakStart} â€“{' '}
                  {policies.lunchBreakEnd}).
                </p>
              )}
            </div>

            {confirmDelete ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="icon-tile h-8 w-8 shrink-0 bg-rose-100 text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-rose-900">Remove this lecture?</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-rose-700">
                      It will be removed from the timetable. This cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="btn-secondary btn-sm"
                  >
                    Keep lecture
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="btn-danger btn-sm"
                  >
                    {saving ? 'Removingâ€¦' : 'Yes, remove'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                {editingId ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={saving}
                    className="btn-danger btn-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex gap-2.5 sm:justify-end">
                  <button type="button" onClick={closeModal} className="btn-secondary btn-sm flex-1 sm:flex-none">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !form.courseId || !form.lectureHallId}
                    className="btn-primary btn-sm flex-1 sm:flex-none"
                  >
                    {saving ? 'Savingâ€¦' : editingId ? 'Save changes' : 'Add lecture'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}