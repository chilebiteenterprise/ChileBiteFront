import React, { useState } from "react";
import { Link2, Unlink, CheckCircle2, AlertCircle, Loader, X } from "lucide-react";
import { toast } from "@heroui/react";
import { Section, Row } from "./SettingsShared";

export function LinkedAccountsSection({ user, linkGoogleToCurrentAccount, unlinkGoogle }) {
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const identities = user?.identities || [];
  const isGoogleLinked = identities.some(id => id.provider === "google");
  const canUnlinkGoogle = identities.length > 1;

  const handleUnlinkGoogle = async () => {
    setIsUnlinking(true);
    try {
      const { error } = await unlinkGoogle();
      if (error) throw error;
      toast.success("Google desvinculado correctamente.");
      setShowUnlinkConfirm(false);
    } catch (err) {
      toast.danger(err?.message || "No se pudo desvincular Google.");
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
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
          <div className="mt-2 space-y-3">
            <div className="flex items-center gap-2 p-3 bg-success-soft rounded-xl border border-success-soft">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <p className="text-xs text-foreground">Google está correctamente vinculado a esta cuenta.</p>
            </div>

            {!canUnlinkGoogle ? (
              <div className="flex flex-col gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Desvinculación no disponible (Falta Identidad de Correo)
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mt-1">
                      Aunque tengas una contraseña configurada y puedas usarla para iniciar sesión, Supabase aún registra tu cuenta internamente como <strong>únicamente de Google</strong>. Para desvincular Google de forma segura, debes sincronizar tu identidad de correo.
                    </p>
                  </div>
                </div>
                
                <div className="pl-6 border-t border-amber-200/50 dark:border-amber-800/30 pt-2.5">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1.5">Cómo solucionarlo en 2 pasos:</p>
                  <ol className="list-decimal pl-4 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                    <li>Cierra sesión en este dispositivo.</li>
                    <li>Ve a la pantalla de <strong>Crear Cuenta</strong> y regístrate ingresando el mismo correo y la misma contraseña. Supabase detectará tu cuenta y enlazará la identidad de correo automáticamente.</li>
                  </ol>
                </div>
              </div>
            ) : !showUnlinkConfirm ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowUnlinkConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Unlink className="w-4 h-4" />
                  Desvincular Google
                </button>
              </>
            ) : (
              <>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 space-y-3">
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">¿Confirmar desvinculación?</p>
                  <p className="text-xs text-red-600 dark:text-red-500 leading-relaxed">
                    Dejarás de poder iniciar sesión con Google. Usarás tu contraseña de aquí en adelante.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUnlinkGoogle}
                      disabled={isUnlinking}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {isUnlinking ? <Loader className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                      Sí, desvincular
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUnlinkConfirm(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-default-600 border border-border hover:bg-default-hover transition-colors"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                  </div>
                </div>
              </>
            )}
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
  );
}
