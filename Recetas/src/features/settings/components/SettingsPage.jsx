import React, { useState, useEffect } from "react";
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import { Loader, UserCircle2, User, Shield, Link2, Palette, AlertTriangle, Lock, Bell, Globe, ChevronDown } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';
import { AccountSection } from './sections/AccountSection';
import { SecuritySection } from './sections/SecuritySection';
import { LinkedAccountsSection } from './sections/LinkedAccountsSection';
import { AppearanceSection } from './sections/AppearanceSection';
import { DangerZoneSection } from './sections/DangerZoneSection';

import { PrivacySection } from './sections/PrivacySection';
import { NotificationsSection } from './sections/NotificationsSection';
import { LocaleSection } from './sections/LocaleSection';

const BRAND = "#b08968";

function SettingsLayout() {
  const { user, profile, loading: authLoading, linkGoogleToCurrentAccount, unlinkGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [hasVerifiedMfa, setHasVerifiedMfa] = useState(false);
  const [securityLoaded, setSecurityLoaded] = useState(false);
  const [showCompletenessBreakdown, setShowCompletenessBreakdown] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadMfaStatus = async () => {
      setSecurityLoaded(false);

      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;

        const hasTotp = Boolean(data?.totp?.some((factor) => factor.status === "verified"));
        if (mounted) setHasVerifiedMfa(hasTotp);
      } catch {
        if (mounted) setHasVerifiedMfa(false);
      } finally {
        if (mounted) setSecurityLoaded(true);
      }
    };

    if (user?.id) {
      loadMfaStatus();
    } else {
      setHasVerifiedMfa(false);
      setSecurityLoaded(false);
    }

    return () => {
      mounted = false;
    };
  }, [user?.id]);

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
        <a href="/auth/register" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: BRAND }}>
          Ir al Login
        </a>
      </div>
    );
  }

  const TABS = [
    { id: "account", label: "Cuenta", icon: User },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "privacy", label: "Privacidad", icon: Lock },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "linked", label: "Cuentas vinculadas", icon: Link2 },
    { id: "locale", label: "Idioma y Región", icon: Globe },
    { id: "appearance", label: "Apariencia", icon: Palette },
    { id: "danger", label: "Zona de peligro", icon: AlertTriangle, danger: true },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <AccountSection user={user} />;
      case "security":
        return <SecuritySection user={user} />;
      case "privacy":
        return <PrivacySection user={user} profile={profile} />;
      case "notifications":
        return <NotificationsSection user={user} profile={profile} />;
      case "linked":
        return <LinkedAccountsSection user={user} linkGoogleToCurrentAccount={linkGoogleToCurrentAccount} unlinkGoogle={unlinkGoogle} />;
      case "locale":
        return <LocaleSection user={user} profile={profile} />;
      case "appearance":
        return <AppearanceSection />;
      case "danger":
        return <DangerZoneSection user={user} />;
      default:
        return <AccountSection user={user} />;
    }
  };

  const calculateCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.profile_visibility) score += 20;
    if (profile.notification_preferences) score += 20;
    if (profile.locale) score += 20;
    if (user?.identities?.some((identity) => identity.provider === "google")) score += 20;
    if (securityLoaded && hasVerifiedMfa) score += 20;
    return score;
  };

  const completenessChecks = [
    {
      label: "Privacidad",
      done: Boolean(profile?.profile_visibility),
      detail: profile?.profile_visibility ? `Visibilidad: ${profile.profile_visibility}.` : "Falta definir la visibilidad del perfil.",
    },
    {
      label: "Notificaciones",
      done: Boolean(profile?.notification_preferences),
      detail: profile?.notification_preferences ? "Preferencias guardadas." : "Faltan preferencias de notificación.",
    },
    {
      label: "Idioma y región",
      done: Boolean(profile?.locale),
      detail: profile?.locale ? `Seleccionado: ${profile.locale}.` : "Falta elegir idioma/región.",
    },
    {
      label: "Google vinculado",
      done: Boolean(user?.identities?.some((identity) => identity.provider === "google")),
      detail: user?.identities?.some((identity) => identity.provider === "google")
        ? "Google está vinculado."
        : "Falta vincular Google.",
    },
    {
      label: "Autenticación en dos pasos",
      done: securityLoaded ? hasVerifiedMfa : false,
      detail: securityLoaded
        ? (hasVerifiedMfa ? "2FA activo." : "Falta activar 2FA.")
        : "Verificando estado de 2FA...",
    },
  ];

  const completeness = calculateCompleteness();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Page header */}
      <div className="mb-8">
        <a href="/profile" className="text-xs font-bold text-default-400 hover:text-default-600 transition-colors flex items-center gap-1 mb-3">
          ← Volver al Perfil
        </a>
        <h1 className="text-2xl font-black text-foreground">Ajustes de Cuenta</h1>
        <p className="text-sm text-default-500 mt-1">Gestiona tu cuenta, seguridad y conexiones.</p>
        
        {/* Barra de Estado de Configuración */}
        {profile && (
          <div className="mt-6 max-w-md relative z-20">
            <button
              type="button"
              onClick={() => setShowCompletenessBreakdown((value) => !value)}
              className="w-full text-left rounded-[1.5rem] border border-border/70 bg-white/5 dark:bg-white/[0.03] px-4 py-4 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#b08968]/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#b08968]/20"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="block text-[11px] font-black uppercase tracking-[0.22em] text-default-500">Completitud</span>
                  <span className="block mt-1 text-base font-extrabold text-foreground leading-tight">Configuración de cuenta</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-black" style={{ color: BRAND }}>{completeness}%</span>
                  <ChevronDown className={`w-4 h-4 text-default-400 transition-transform duration-200 ${showCompletenessBreakdown ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <div className="mt-3 w-full bg-default-200/70 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-1000 ease-out shadow-[0_0_18px_rgba(176,137,104,0.35)]"
                  style={{ width: `${completeness}%`, backgroundColor: BRAND }}
                ></div>
              </div>
            </button>

            {showCompletenessBreakdown && (
              <div className="absolute left-0 top-full mt-3 w-full max-h-[55vh] overflow-y-auto rounded-[1.5rem] border border-border/70 bg-white/95 dark:bg-[#0c0f16]/95 backdrop-blur-xl shadow-2xl shadow-black/20 p-4 space-y-3">
                {completenessChecks.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        item.done ? "bg-success text-white" : "bg-default-200 text-default-500"
                      }`}
                    >
                      {item.done ? "✓" : "•"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-default-500 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar / Tabs */}
        <div className="w-full md:w-64 shrink-0 flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-1 md:flex-none justify-center md:justify-start border ${
                activeTab === tab.id
                  ? (tab.danger
                    ? 'bg-danger-soft/70 text-danger border-danger/20 shadow-sm shadow-danger/5'
                    : 'bg-white/80 dark:bg-white/5 text-foreground border-border/70 shadow-sm shadow-black/5')
                  : 'text-default-500 border-transparent hover:bg-white/70 dark:hover:bg-white/5 hover:text-foreground hover:border-border/60 hover:shadow-sm hover:shadow-black/5 hover:-translate-y-0.5'
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-r-full transition-all duration-200 ${
                  activeTab === tab.id
                    ? (tab.danger ? 'bg-danger' : 'bg-[#b08968]')
                    : 'bg-transparent group-hover:bg-[#b08968]/50'
                }`}
              />
              <tab.icon className={`w-4 h-4 ${tab.danger ? (activeTab === tab.id ? 'text-danger' : 'text-danger/70') : ''}`} />
              <span className={tab.danger ? (activeTab === tab.id ? 'text-danger' : 'text-danger/80') : ''}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function ConfiguracionClient() {
  return (
    <AuthProvider>
      <SettingsLayout />
    </AuthProvider>
  );
}
