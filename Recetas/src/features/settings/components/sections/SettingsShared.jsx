import React, { useState } from "react";
import { ChevronRight, Eye, EyeOff, Loader } from "lucide-react";

export const BRAND = "#7a461b";
export const BRAND_DARK = "#f0a262";

/* ─── Section wrapper ─── */
export function Section({ title, children }) {
  return (
    <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-xs font-black text-text-muted/80 dark:text-zinc-400 uppercase tracking-widest mb-3 px-1">{title}</h2>
      <div className="bg-white dark:bg-[#202026] border border-border-subtle dark:border-zinc-800 rounded-3xl overflow-hidden divide-y divide-border-subtle dark:divide-zinc-800/80 shadow-sm transition-colors duration-200">
        {children}
      </div>
    </div>
  );
}

/* ─── Expandable row ─── */
export function Row({ icon: Icon, label, sublabel, iconColor, children, badge }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-surface-muted/40 dark:hover:bg-zinc-800/40 transition-colors text-left"
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={iconColor ? { backgroundColor: iconColor + "18", color: iconColor } : undefined}
        >
          {iconColor ? (
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          ) : (
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-brand-primary/10 dark:bg-[#f0a262]/15 text-brand-primary dark:text-[#f0a262]">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-main dark:text-zinc-100">{label}</p>
          {sublabel && <p className="text-xs text-text-muted dark:text-zinc-400 mt-0.5 truncate">{sublabel}</p>}
        </div>
        {badge && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
            {badge}
          </span>
        )}
        <ChevronRight className={`w-4 h-4 text-text-muted/60 dark:text-zinc-500 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-6 pt-3 bg-surface-muted/30 dark:bg-[#18181d] border-t border-border-subtle dark:border-zinc-800/80 animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Static info row ─── */
export function InfoRow({ icon: Icon, label, value, iconColor }) {
  return (
    <div className="flex items-center gap-4 px-5 sm:px-6 py-4">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
        style={iconColor ? { backgroundColor: iconColor + "18", color: iconColor } : undefined}
      >
        {iconColor ? (
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        ) : (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-brand-primary/10 dark:bg-[#f0a262]/15 text-brand-primary dark:text-[#f0a262]">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted dark:text-zinc-400 mb-0.5 font-medium">{label}</p>
        <p className="text-sm font-bold text-text-main dark:text-zinc-100 break-all">{value}</p>
      </div>
    </div>
  );
}

/* ─── Submit button helper ─── */
export function SubmitBtn({ loading, icon: Icon, label, color }) {
  if (color) {
    return (
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all mt-3 hover:opacity-95 shadow-sm active:scale-95"
        style={{ backgroundColor: color }}
      >
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        {label}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-primary hover:bg-[#633612] text-white dark:bg-[#f0a262] dark:hover:bg-[#ffb87a] dark:text-[#171310] disabled:opacity-50 transition-all mt-3 shadow-sm active:scale-95"
    >
      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}
