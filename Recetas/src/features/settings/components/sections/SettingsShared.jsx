import React, { useState } from "react";
import { ChevronRight, Eye, EyeOff, Loader } from "lucide-react";

export const BRAND = "#b08968";

/* ─── Section wrapper ─── */
export function Section({ title, children }) {
  return (
    <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-xs font-black text-default-500 uppercase tracking-widest mb-3 px-1">{title}</h2>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
        {children}
      </div>
    </div>
  );
}

/* ─── Expandable row ─── */
export function Row({ icon: Icon, label, sublabel, iconColor = BRAND, children, badge }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-default-hover transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconColor + "18" }}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {sublabel && <p className="text-xs text-default-500 mt-0.5 truncate">{sublabel}</p>}
        </div>
        {badge && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400 shrink-0">{badge}</span>}
        <ChevronRight className={`w-4 h-4 text-default-400 shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 bg-default border-t border-border animate-in fade-in duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Static info row ─── */
export function InfoRow({ icon: Icon, label, value, iconColor = BRAND }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconColor + "18" }}>
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-default-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-foreground break-all">{value}</p>
      </div>
    </div>
  );
}

/* ─── Submit button helper ─── */
export function SubmitBtn({ loading, icon: Icon, label, color = BRAND }) {
  return (
    <button type="submit" disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all mt-3"
      style={{ backgroundColor: color }}>
      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}
