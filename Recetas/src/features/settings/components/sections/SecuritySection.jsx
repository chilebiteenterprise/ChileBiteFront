import React, { useState } from "react";
import { KeyRound, ShieldCheck, LogOut, Mail, Loader } from "lucide-react";
import { toast } from "@heroui/react";
import { supabase } from '@/lib/supabaseClient';
import { Section, Row, SubmitBtn, BRAND } from "./SettingsShared";
import MFASetup from '../MFASetup';

export function SecuritySection({ user }) {
  const [isSettingPw, setIsSettingPw] = useState(false);
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setIsSettingPw(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast.success("Te hemos enviado un correo con instrucciones para cambiar tu contraseña.");
    } catch (err) {
      toast.error(err.message || "Error al solicitar el cambio de contraseña");
    } finally {
      setIsSettingPw(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    setIsSigningOutAll(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Sesión cerrada en todos los dispositivos.");
      setTimeout(() => { window.location.href = "/"; }, 1200);
    } catch (err) {
      toast.error("Error al cerrar sesiones.");
      setIsSigningOutAll(false);
    }
  };

  return (
    <Section title="Seguridad">
      <Row
        icon={KeyRound}
        label="Cambiar contraseña"
        sublabel="Asegura tu cuenta actualizando tu contraseña"
        iconColor={BRAND}
      >
        <form onSubmit={handleSetPassword} className="space-y-3 mt-2">
          <p className="text-xs text-default-500 leading-relaxed">
            Por seguridad, te enviaremos un enlace a tu correo electrónico registrado. Al hacer clic, podrás configurar una nueva contraseña de forma segura.
          </p>
          <SubmitBtn loading={isSettingPw} icon={Mail} label="Enviar correo de recuperación" color={BRAND} />
        </form>
      </Row>

      <Row
        icon={ShieldCheck}
        label="Autenticación en dos pasos"
        sublabel="Protege tu cuenta con un código de una app autenticadora"
        iconColor="#22c55e"
      >
        <MFASetup />
      </Row>

      <Row
        icon={LogOut}
        label="Cerrar todas las sesiones"
        sublabel="Cierra tu sesión en todos los dispositivos simultáneamente"
        iconColor="#6366f1"
      >
        <div className="space-y-3 mt-2">
          <p className="text-xs text-default-500 leading-relaxed">
            Esto cerrará tu sesión en todos los navegadores y dispositivos donde hayas iniciado sesión. Tendrás que volver a ingresar con tu contraseña o Google.
          </p>
          <button
            type="button"
            onClick={handleSignOutAllDevices}
            disabled={isSigningOutAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all mt-1"
            style={{ backgroundColor: "#6366f1" }}
          >
            {isSigningOutAll ? <Loader className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Cerrar todas las sesiones
          </button>
        </div>
      </Row>
    </Section>
  );
}
