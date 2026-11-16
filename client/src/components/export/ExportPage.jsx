import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../services/api.js';
import {
  FileDown,
  Printer,
  Table,
  AlertTriangle,
  Download,
  CalendarCheck2,
  Building,
  CheckCircle2
} from 'lucide-react';

export default function ExportPage() {
  const { schedules, courses, lectureHalls, departments, conflicts, showToast } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const handleExportMasterCSV = () => {
    if (schedules.length === 0) {
      showToast('No schedules available to export', 'error');
      return;
    }

    const headers = ['Course Code', 'Course Title', 'Instructor', 'Department', 'Lecture Hall', 'Location', 'Day', 'Start Time', 'End Time', 'Enrollment', 'Hall Capacity'];
    const rows = schedules.map(sch => {
      const course = courses.find(c => c.id === sch.courseId);
      const hall = lectureHalls.find(h => h.id === sch.lectureHallId);
      const dept = course ? departments.find(d => d.id === course.departmentId) : null;

      return [
        `"${course?.code || ''}"`,
        `"${(course?.name || '').replace(/"/g, '""')}"`,
        `"${(course?.instructor || '').replace(/"/g, '""')}"`,
        `"${dept?.name || ''}"`,
        `"${hall?.roomNumber || ''}"`,
        `"${hall?.location || ''}"`,
        `"${sch.day}"`,
        `"${sch.startTime}"`,
        `"${sch.endTime}"`,
        course?.studentCount || 0,
        hall?.capacity || 0
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `university_master_timetable_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Master timetable CSV downloaded successfully');
  };

  const handleExportConflictsCSV = async () => {
    try {
      const blob = await api.exportConflictsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lecture_conflicts_audit_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('Conflicts report downloaded');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">
            <span className="icon-tile h-9 w-9 bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              <FileDown className="h-5 w-5" />
            </span>
            Export &amp; Print Center
          </h1>
          <p className="page-subtitle">
            Export official academic schedules in CSV formats or generate clean, printer-friendly reports.
          </p>
        </div>

        <button onClick={handlePrint} className="btn-dark">
          <Printer className="h-4 w-4" />
          Print Timetable
        </button>
      </div>

      {/* Export Options Cards */}
      <div className="no-print grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Card 1: Master Timetable */}
        <div className="surface flex flex-col justify-between space-y-4 p-6">
          <div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 w-fit mb-3">
              <Table className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Master Schedule CSV</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete data sheet with all course allocations, room assignments, timings, and instructor details.
            </p>
          </div>
          <button
            onClick={handleExportMasterCSV}
            className="btn-primary w-full text-xs"
          >
            <Download className="w-4 h-4" />
            Download Master CSV
          </button>
        </div>

        {/* Card 2: Print Timetable */}
        <div className="surface flex flex-col justify-between space-y-4 p-6">
          <div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 w-fit mb-3">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Printable Layout</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Formatted for standard A4 landscape printing or saving as PDF directly from your browser.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="btn-dark w-full text-xs"
          >
            <Printer className="w-4 h-4" />
            Launch Print Dialog
          </button>
        </div>

        {/* Card 3: Conflicts Audit */}
        <div className="surface flex flex-col justify-between space-y-4 p-6">
          <div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 w-fit mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Conflicts Audit CSV</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Audit log detailing active collisions, room shortages, and lunch break violation minutes.
            </p>
          </div>
          <button
            onClick={handleExportConflictsCSV}
            className="btn-secondary w-full text-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Audit CSV ({conflicts.length})
          </button>
        </div>
      </div>

      {/* Schedule Preview Table */}
      <div className="surface overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Schedule Preview (Top {Math.min(10, schedules.length)} of {schedules.length} Classes)
          </h2>
          <span className="text-xs text-slate-500">{courses.length} courses total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Hall</th>
                <th className="py-3 px-4">Day &amp; Time</th>
                <th className="py-3 px-4">Enrolled / Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.slice(0, 10).map(sch => {
                const course = courses.find(c => c.id === sch.courseId);
                const hall = lectureHalls.find(h => h.id === sch.lectureHallId);

                return (
                  <tr key={sch.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {course?.code} - {course?.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {course?.instructor}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-bold">
                      Room {hall?.roomNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {sch.day} {sch.startTime} - {sch.endTime}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {course?.studentCount} / {hall?.capacity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
