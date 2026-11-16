import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-xl' }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-scale-in`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold tracking-tight text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn -mr-1 -mt-1 shrink-0"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}