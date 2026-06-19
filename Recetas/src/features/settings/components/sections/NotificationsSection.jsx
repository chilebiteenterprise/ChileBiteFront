import React, { useEffect, useState } from "react";
import { Bell, Heart, Mail, Loader, ShieldAlert, X } from "lucide-react";
import { toast } from "@heroui/react";
import { supabase } from '@/lib/supabaseClient';
import { Section, Row } from "./SettingsShared";

export function NotificationsSection({ user, profile }) {
  const defaultPreferences = {
    recipe_liked: false,
    weekly_digest: true,
    security_alerts: true,
  };

  const [preferences, setPreferences] = useState(
    profile?.notification_preferences || defaultPreferences
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingSecurityValue, setPendingSecurityValue] = useState(true);

  useEffect(() => {
    setPreferences(profile?.notification_preferences || defaultPreferences);
  }, [profile?.notification_preferences]);

  const savePreferences = async (nextPrefs, successMessage) => {
    setPreferences(nextPrefs);
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: nextPrefs })
        .eq('id', user.id);

      if (error) throw error;
      toast.success(successMessage);
    } catch (err) {
      toast.danger("Error al actualizar preferencias.");
      setPreferences(preferences);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (key) => {
    if (key === 'security_alerts') {
      const nextValue = !Boolean(preferences[key]);
      if (!nextValue) {
        setPendingSecurityValue(false);
        setShowSecurityModal(true);
        return;
      }
      await savePreferences(
        { ...preferences, [key]: nextValue },
        "Alertas de seguridad activadas."
      );
      return;
    }

    const nextPrefs = { ...preferences, [key]: !Boolean(preferences[key]) };
    await savePreferences(nextPrefs, "Preferencias actualizadas.");
  };

  const confirmSecurityToggle = async () => {
    setShowSecurityModal(false);
    await savePreferences(
      { ...preferences, security_alerts: pendingSecurityValue },
      pendingSecurityValue
        ? "Alertas de seguridad activadas."
        : "Alertas de seguridad desactivadas."
    );
  };

  const ToggleItem = ({ icon: Icon, title, description, prefKey }) => {
    const isActive = Boolean(preferences[prefKey]);
    const isSecurity = prefKey === 'security_alerts';

    return (
      <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-50 text-primary' : 'bg-default-100 text-default-400'}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-default-500">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleToggle(prefKey)}
          disabled={isSaving}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b08968] focus-visible:ring-opacity-75 ${isActive ? 'bg-[#b08968]' : 'bg-black/20'} ${isSecurity ? 'ring-1 ring-[#b08968]/20' : ''} ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    );
  };

  return (
    <>
      <Section title="Notificaciones">
        <Row icon={Bell} label="Notificaciones por Correo" sublabel="Administra qué correos recibes de nosotros" iconColor="#f43f5e">
          <div className="flex flex-col mt-2 px-2">
            <ToggleItem
              icon={Heart}
              title="Me gusta en tus recetas"
              description="Pensada para el futuro, cuando publiquemos interacción social sobre recetas"
              prefKey="recipe_liked"
            />
            <ToggleItem
              icon={Mail}
              title="Resumen semanal"
              description="Pensada para el futuro: recetas populares y novedades cada semana"
              prefKey="weekly_digest"
            />
            <ToggleItem
              icon={ShieldAlert}
              title="Alertas de seguridad"
              description="Avisos sobre nuevos inicios de sesión o cambios en tu cuenta"
              prefKey="security_alerts"
            />
          </div>
        </Row>
      </Section>

      {showSecurityModal && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-foreground">Desactivar alertas de seguridad</h3>
                <p className="text-sm text-default-500 mt-2 leading-relaxed">
                  Estas alertas te avisan sobre inicios de sesión nuevos y cambios sensibles en tu cuenta. Si las desactivas, quedas sin ese aviso preventivo.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold border border-border text-default-600 hover:bg-default-hover transition-colors inline-flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmSecurityToggle}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#b08968] hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
