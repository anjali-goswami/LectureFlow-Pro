import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Navbar from './components/common/Navbar.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import DepartmentManagement from './components/departments/DepartmentManagement.jsx';
import CourseManagement from './components/courses/CourseManagement.jsx';
import LectureHallManagement from './components/halls/LectureHallManagement.jsx';
import TimeSlotManagement from './components/timeslots/TimeSlotManagement.jsx';
import PolicyManagement from './components/policies/PolicyManagement.jsx';
import ScheduleGenerator from './components/scheduler/ScheduleGenerator.jsx';
import ConflictReport from './components/conflicts/ConflictReport.jsx';
import Timetable from './components/timetable/Timetable.jsx';
import ExportPage from './components/export/ExportPage.jsx';
import Login from './components/auth/Login.jsx';
import { CheckCircle2, AlertCircle, Info, X, LockKeyhole } from 'lucide-react';

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    ring: 'text-emerald-600 bg-emerald-50 border-emerald-200'
  },
  error: {
    icon: AlertCircle,
    ring: 'text-rose-600 bg-rose-50 border-rose-200'
  },
  info: {
    icon: Info,
    ring: 'text-blue-600 bg-blue-50 border-blue-200'
  }
};

function Toast({ toast }) {
  const { dismissToast } = useApp();
  const config = TOAST_STYLES[toast.type] || TOAST_STYLES.success;
  const Icon = config.icon;

  return (
    <div
      key={toast.id}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-card-hover animate-toast-in"
      role="status"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${config.ring}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="flex-1 pt-1.5 text-[13px] font-medium leading-snug text-slate-700">
        {toast.message}
      </p>
      <button
        onClick={() => dismissToast(toast.id)}
        className="icon-btn -mr-1 -mt-1 shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function AdminRoute({ children }) {
  const { isAdmin } = useApp();

  if (isAdmin) return children;

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="surface max-w-md p-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <LockKeyhole className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Administrator access required
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          Your staff account has read-only access. Ask an administrator if you need to change
          departments, courses, rooms, policies or schedules.
        </p>
        <Link to="/dashboard" className="btn-primary btn-sm mt-5">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function AppLayout() {
  const { isAuthenticated, toast } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('lf_sidebar_collapsed') === 'true');
  const location = useLocation();

  const toggleSidebar = updater => setSidebarCollapsed(current => {
    const next = typeof updater === 'function' ? updater(current) : updater;
    localStorage.setItem('lf_sidebar_collapsed', String(next));
    return next;
  });

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} collapsed={sidebarCollapsed} setCollapsed={toggleSidebar} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="mx-auto w-full max-w-[1440px] min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div key={location.pathname} className="animate-fade-in">
            <Routes location={location}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/departments" element={<DepartmentManagement />} />
              <Route path="/courses" element={<CourseManagement />} />
              <Route path="/lecture-halls" element={<LectureHallManagement />} />
              <Route path="/time-slots" element={<AdminRoute><TimeSlotManagement /></AdminRoute>} />
              <Route path="/policies" element={<AdminRoute><PolicyManagement /></AdminRoute>} />
              <Route path="/schedule-generator" element={<AdminRoute><ScheduleGenerator /></AdminRoute>} />
              <Route path="/conflicts" element={<ConflictReport />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/export" element={<ExportPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-3 no-print">
        {toast && <Toast key={toast.id} toast={toast} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
