import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import {
  LayoutDashboard, Building2, BookOpen, Landmark, Clock, Coffee,
  Sparkles, AlertOctagon, CalendarDays, FileDown, ChevronsLeft, ChevronsRight
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/lecture-halls', label: 'Lecture halls', icon: Landmark },
  { to: '/time-slots', label: 'Time slots', icon: Clock, adminOnly: true },
  { to: '/policies', label: 'Policies', icon: Coffee, adminOnly: true },
  { to: '/schedule-generator', label: 'Auto scheduler', icon: Sparkles, adminOnly: true },
  { to: '/conflicts', label: 'Conflicts', icon: AlertOctagon, badge: true },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/export', label: 'Export & print', icon: FileDown }
];

function NavItems({ collapsed, conflicts, isAdmin, onNavigate }) {
  return NAV_LINKS.filter(item => !item.adminOnly || isAdmin).map(item => {
    const Icon = item.icon;
    return <NavLink key={item.to} to={item.to} onClick={onNavigate} title={collapsed ? item.label : undefined} aria-label={item.label}
      className={({ isActive }) => `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors ${collapsed ? 'justify-center' : ''} ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'}`}>
      {({ isActive }) => <>
        <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
        {!collapsed && <span className="min-w-0 flex-1">{item.label}</span>}
        {item.badge && conflicts.length > 0 && <span className={`rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white ${collapsed ? 'absolute right-1 top-1' : ''}`}>{conflicts.length}</span>}
      </>}
    </NavLink>;
  });
}

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen, collapsed, setCollapsed }) {
  const { conflicts, isAdmin } = useApp();
  const handleLinkClick = () => setMobileMenuOpen?.(false);
  const content = (isMobile = false) => <div className={`flex h-full flex-col bg-slate-950 text-slate-400 ${collapsed && !isMobile ? 'w-[76px]' : 'w-64'}`}>
    <div className={`flex h-16 shrink-0 items-center border-b border-white/10 ${collapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-4'}`}>
      <Link to="/dashboard" onClick={handleLinkClick} className="flex min-w-0 items-center gap-2.5" title="LectureFlow Pro">
        <img src="/logo-mark.svg" alt="LectureFlow Pro" className="h-9 w-9 shrink-0 rounded-xl" />
        {(!collapsed || isMobile) && <span className="truncate text-[16px] font-extrabold tracking-tight text-white">LectureFlow <span className="text-brand-400">Pro</span></span>}
      </Link>
      {!isMobile && <button onClick={() => setCollapsed(value => !value)} className={`icon-btn shrink-0 text-slate-400 hover:bg-white/10 hover:text-white ${collapsed ? 'absolute left-[52px] top-[18px] z-10 bg-slate-900 shadow' : ''}`} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </button>}
    </div>
    <nav className={`flex-1 space-y-1 overflow-y-auto py-4 ${collapsed && !isMobile ? 'px-2' : 'px-3'}`}>
      <NavItems collapsed={collapsed && !isMobile} conflicts={conflicts} isAdmin={isAdmin} onNavigate={handleLinkClick} />
    </nav>
    {!collapsed && !isMobile && <div className="border-t border-white/10 px-4 py-3 text-[11px] text-slate-500">{isAdmin ? 'Administrator' : 'Staff'} access</div>}
  </div>;

  return <>
    <aside className={`sticky top-0 hidden h-screen shrink-0 border-r border-slate-800 transition-[width] duration-200 lg:block no-print ${collapsed ? 'w-[76px]' : 'w-64'}`}>{content()}</aside>
    {mobileMenuOpen && <div className="fixed inset-0 z-50 flex lg:hidden no-print">
      <button className="fixed inset-0 bg-slate-950/60" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation" />
      <div className="relative z-10 h-full max-w-[85vw] shadow-2xl">{content(true)}</div>
    </div>}
  </>;
}
