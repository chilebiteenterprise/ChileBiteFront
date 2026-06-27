import React, { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "@heroui/react";
import { supabase } from '@/lib/supabaseClient';
import { Section, InfoRow, Row, SubmitBtn, BRAND } from "./SettingsShared";

export function AccountSection({ user }) {
  const [emailForm, setEmailForm] = useState({ email: "" });
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.email.includes("@")) { toast.danger("Ingresa un email válido"); return; }
    setIsChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser(
        { email: emailForm.email },
        { emailRedirectTo: `${window.location.origin}/settings` }
      );
      if (error) throw error;
      toast.success("Te enviamos un enlace de confirmación al nuevo correo.");
      setEmailForm({ email: "" });
    } catch (err) {
      toast.danger(err.message || "Error al cambiar el email");
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
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
          <SubmitBtn loading={isChangingEmail} icon={Mail} label="Solicitar cambio" color="#6366f1" />
        </form>
      </Row>
    </Section>
  );
}
