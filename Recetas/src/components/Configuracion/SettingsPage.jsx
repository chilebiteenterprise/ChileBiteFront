import React, { useState } from "react";
import { useAuth, AuthProvider } from "../../context/AuthContext";
import {
  ShieldCheck, KeyRound, Mail, Trash2, Link2, ChevronRight,
  Loader, Eye, EyeOff, Lock, X, CheckCircle2, UserCircle2, Moon, Sun
} from "lucide-react";
import { toast } from "@heroui/react";
import { supabase } from "../../lib/supabaseClient";
import { deleteAccount } from "../../lib/profileService";

const BRAND = "#b08968";

/* ─── Section wrapper ─── */
function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xs font-black text-default-500 uppercase tracking-widest mb-3 px-1">{title}</h2>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
        {children}
      </div>
    </div>
  );
}

/* ─── Expandable row ─── */
function Row({ icon: Icon, label, sublabel, iconColor = BRAND, children, badge }) {
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
        <div className="px-5 pb-5 pt-1 bg-default border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Static info row ─── */
function InfoRow({ icon: Icon, label, value, iconColor = BRAND }) {
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

/* ─── Password input ─── */
function PwInput({ value, onChange, placeholder, show, onToggleShow }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 pr-10 rounded-xl text-sm border border-field-border bg-field text-field-foreground placeholder-field-placeholder focus:outline-none focus:border-[#b08968] focus:ring-2 focus:ring-[#b08968]/20 focus:bg-default transition-all"
      />
      <button type="button" onClick={onToggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN SETTINGS CONTENT
────────────────────────────────────────────────────────────── */
function SettingsContent() {
  const { user, profile, loading: authLoading, linkGoogleToCurrentAccount } = useAuth();

  const [showPw, setShowPw] = useState(false);
  /**
   * Detect identity providers.
   * After setting a password via updateUser, Supabase adds an 'email' identity.
   * We check identities array for this.
   */
  const identities = user?.identities || [];
  const isGoogleLinked = identities.some(id => id.provider === "google");

  // Set / change password form
  const [pwForm, setPwForm] = useState({ current: "", password: "", confirm: "" });
  const [isSettingPw, setIsSettingPw] = useState(false);

  // Change email form
  const [emailForm, setEmailForm] = useState({ email: "" });
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // App Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return typeof window !== "undefined" && window.localStorage.getItem("theme") === "dark";
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <UserCircle2 className="w-14 h-14 text-default-300" />
        <h2 className="text-xl font-bold text-foreground">Sesión Requerida</h2>
        <a href="/Register" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: BRAND }}>
          Ir al Login
        </a>
      </div>
    );
  }

  /* handlers */
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (pwForm.password.length < 6) { toast.error("Mínimo 6 caracteres"); return; }
    if (pwForm.password !== pwForm.confirm) { toast.error("Las contraseñas no coinciden"); return; }
    setIsSettingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.password });
      if (error) throw error;
      toast.success("¡Contraseña actualizada correctamente!");
      setPwForm({ current: "", password: "", confirm: "" });
    } catch (err) {
      toast.error(err.message || "Error al actualizar la contraseña");
    } finally {
      setIsSettingPw(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.email.includes("@")) { toast.error("Ingresa un email válido"); return; }
    setIsChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: emailForm.email });
      if (error) throw error;
      toast.success("Te enviamos un enlace de confirmación al nuevo correo.");
      setEmailForm({ email: "" });
    } catch (err) {
      toast.error(err.message || "Error al cambiar el email");
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      window.location.href = "/";
    } catch {
      toast.error("Error al eliminar la cuenta");
      setIsDeleting(false);
    }
  };

  const submitBtn = (loading, icon, label, color = BRAND) => (
    <button type="submit" disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all mt-3"
      style={{ backgroundColor: color }}>
      {loading ? <Loader className="w-4 h-4 animate-spin" /> : React.createElement(icon, { className: "w-4 h-4" })}
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

      {/* Page header */}
      <div className="mb-8">
        <a href="/Perfil" className="text-xs font-bold text-default-400 hover:text-default-600 transition-colors flex items-center gap-1 mb-3">
          ← Volver al Perfil
        </a>
        <h1 className="text-2xl font-black text-foreground">Ajustes de Cuenta</h1>
        <p className="text-sm text-default-500 mt-1">Gestiona tu cuenta, seguridad y conexiones.</p>
      </div>

      {/* ─── CUENTA ─── */}
      <Section title="Cuenta">
        <InfoRow icon={Mail} label="Correo electrónico actual" value={user.email} />

        <Row icon={Mail} label="Cambiar correo" sublabel="Recibirás un email de confirmación" iconColor="#6366f1">
          <form onSubmit={handleChangeEmail} className="space-y-3 mt-2">
            <input
              type="email"
              value={emailForm.email}
              onChange={e => setEmailForm({ email: e.target.value })}
              placeholder="nuevo@correo.com"
              className="w-full px-4 py-3 rounded-xl text-sm border border-field-border bg-field text-field-foreground placeholder-field-placeholder focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 focus:bg-default transition-all"
            />
            <p className="text-xs text-default-500 leading-relaxed">
              Te enviaremos un link de confirmación a tu nueva dirección. El cambio solo aplicará cuando confirmes el link.
            </p>
            {submitBtn(isChangingEmail, Mail, "Solicitar cambio", "#6366f1")}
          </form>
        </Row>
      </Section>

      {/* ─── SEGURIDAD ─── */}
      <Section title="Seguridad">
        <Row
          icon={KeyRound}
          label="Cambiar contraseña"
          sublabel="Asegura tu cuenta actualizando tu contraseña"
          iconColor={BRAND}
        >
          <form onSubmit={handleSetPassword} className="space-y-3 mt-2">
            <PwInput
              value={pwForm.password}
              onChange={e => setPwForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              show={showPw}
              onToggleShow={() => setShowPw(s => !s)}
            />
            <PwInput
              value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              placeholder="Confirmar nueva contraseña"
              show={showPw}
              onToggleShow={() => setShowPw(s => !s)}
            />
            {submitBtn(isSettingPw, Lock, "Cambiar contraseña")}
          </form>
        </Row>
      </Section>

      {/* ─── CUENTAS VINCULADAS ─── */}
      <Section title="Cuentas vinculadas">
        <Row
          icon={() => (
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          label="Google"
          sublabel={isGoogleLinked ? "Cuenta vinculada — puedes iniciar sesión con Google" : "No vinculada"}
          badge={isGoogleLinked ? "Activo" : undefined}
          iconColor="#4285F4"
        >
          {isGoogleLinked ? (
            <div className="flex items-center gap-2 mt-2 p-3 bg-success-soft rounded-xl border border-success-soft">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <p className="text-xs text-foreground">Google está correctamente vinculado a esta cuenta.</p>
            </div>
          ) : (
            <div className="mt-2 space-y-3">
              <p className="text-xs text-default-500 leading-relaxed">
                Vincula tu cuenta de Google para poder iniciar sesión de ambas formas.
              </p>
              <button
                onClick={linkGoogleToCurrentAccount}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#4285F4" }}>
                <Link2 className="w-4 h-4" />
                Vincular con Google
              </button>
            </div>
          )}
        </Row>
      </Section>

      {/* ─── APARIENCIA ─── */}
      <Section title="Apariencia">
        <Row icon={isDarkMode ? Moon : Sun} label="Tema visual" sublabel="Cambiar entre modo claro y oscuro" iconColor="#f59e0b">
          <div className="flex items-center justify-between mt-3 px-2">
             <div className="flex flex-col">
               <p className="text-sm font-semibold text-foreground">Modo Oscuro</p>
               <p className="text-xs text-default-500 mt-1">Activar para cambiar toda la aplicación al modo oscuro</p>
             </div>
             <button type="button" onClick={toggleDarkMode} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b08968] focus-visible:ring-opacity-75 ${isDarkMode ? 'bg-[#b08968]' : 'bg-black/20'}`}>
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
             </button>
          </div>
        </Row>
      </Section>

      {/* ─── ZONA DE PELIGRO ─── */}
      <Section title="Zona de peligro">
        <Row icon={Trash2} label="Eliminar cuenta" sublabel="Acción permanente e irreversible" iconColor="#ef4444">
          <div className="mt-2 p-4 bg-danger-soft rounded-xl border border-danger-soft">
            <p className="text-xs text-danger leading-relaxed mb-4">
              Al eliminar tu cuenta, todos tus datos, recetas guardadas y configuraciones serán borrados permanentemente. Esta acción no se puede deshacer.
            </p>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-danger border border-danger hover:bg-danger-hover transition-colors">
                <Trash2 className="w-4 h-4" />
                Eliminar mi cuenta
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-bold text-danger-700">¿Estás completamente seguro/a?</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleDeleteAccount} disabled={isDeleting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-danger hover:bg-danger-600 disabled:opacity-60 transition-all">
                    {isDeleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Sí, eliminar definitivamente
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-default-600 border border-border hover:bg-default-hover transition-colors">
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </Row>
      </Section>
    </div>
  );
}

export default function ConfiguracionClient() {
  return (
    <AuthProvider>
      <SettingsContent />
    </AuthProvider>
  );
}
