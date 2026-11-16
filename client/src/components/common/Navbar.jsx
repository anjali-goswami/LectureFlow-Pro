import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { currentUser, logout } = useApp();

  return <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md no-print">
    <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="icon-btn lg:hidden" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span className="text-sm font-semibold text-slate-500">Academic Scheduling</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-[13px] font-semibold leading-tight text-slate-800">{currentUser?.name || currentUser?.username}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600">{currentUser?.role === 'admin' ? 'Administrator' : 'Staff'}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white ring-2 ring-white">
          {(currentUser?.username?.[0] || currentUser?.name?.[0] || 'U').toUpperCase()}
        </div>
        <button onClick={logout} className="icon-btn hover:bg-rose-50 hover:text-rose-600" title="Sign out" aria-label="Sign out"><LogOut className="h-5 w-5" /></button>
      </div>
    </div>
  </header>;
}
