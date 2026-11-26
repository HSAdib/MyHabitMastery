import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function FilterDropdown({
  value,
  onChange,
  options = [], // [{ value, label }]
  theme = 'dark',
  maxWidthClass = 'max-w-[115px] md:max-w-[140px]',
  align = 'left', // 'left' | 'right'
  variant = 'emerald', // 'emerald' | 'subtle'
  placeholder = 'Overall',
  preserveCase = false,
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, minWidth: 150, openUp: false });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const dk = theme === 'dark';

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const menuWidth = Math.max(168, rect.width + 24);
    const estHeight = Math.min(240, options.length * 34 + 16);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estHeight + 12 && rect.top > estHeight + 12;

    let left = align === 'right' ? rect.right - menuWidth : rect.left;
    left = Math.max(8, Math.min(window.innerWidth - menuWidth - 8, left));

    setMenuPos({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left,
      minWidth: menuWidth,
      openUp,
    });
  }, [align, options.length]);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handlePointerDown = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    const handleReposition = () => updatePosition();

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updatePosition]);

  const triggerStyles = variant === 'subtle'
    ? (dk
      ? 'bg-slate-800/80 text-emerald-400 border-slate-700 hover:border-emerald-500/60 hover:bg-slate-800'
      : 'bg-slate-100 text-emerald-600 border-slate-200 hover:border-emerald-400 hover:bg-slate-50 shadow-sm')
    : (dk
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.18)] hover:bg-emerald-500/20 hover:border-emerald-400/60'
      : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-100/70 shadow-sm');

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={displayLabel}
        className={`h-6 inline-flex items-center justify-between gap-1.5 px-2.5 rounded-lg border text-[10px] font-black ${preserveCase ? '' : 'uppercase'} tracking-wider leading-none transition-all cursor-pointer focus:outline-none shrink-0 ${maxWidthClass} ${triggerStyles}`}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              role="listbox"
              initial={{ opacity: 0, y: menuPos.openUp ? 6 : -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: menuPos.openUp ? 6 : -6, scale: 0.96 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: menuPos.top,
                left: menuPos.left,
                minWidth: `${menuPos.minWidth}px`,
                transform: menuPos.openUp ? 'translateY(-100%)' : 'none',
                zIndex: 9999,
              }}
              className={`${dk ? 'dark bg-slate-900/95 border-slate-700/80 text-slate-200 shadow-[0_14px_35px_rgba(0,0,0,0.65)]' : 'bg-white/95 border-slate-200 text-slate-800 shadow-xl'} border rounded-2xl p-1.5 backdrop-blur-xl max-h-64 overflow-y-auto no-scrollbar`}
            >
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black ${preserveCase ? '' : 'uppercase'} tracking-wider text-left transition-all ${
                      isSelected
                        ? (dk
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                        : (dk
                          ? 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent')
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

