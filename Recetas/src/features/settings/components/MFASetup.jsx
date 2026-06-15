import { useState, useEffect } from "react";
import {
  ShieldCheck, Smartphone, KeyRound, Copy, CheckCircle2,
  Loader, X, AlertCircle, ShieldOff, ChevronRight, RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@heroui/react";

const BRAND = "#b08968";

/**
 * MFASetup — Wizard de 3 pasos para activar/desactivar TOTP 2FA con Supabase.
 *
 * Pasos de activación:
 *   1. Introducción — explica qué es 2FA y qué app usar
 *   2. QR + Verificación — muestra QR y pide código de 6 dígitos
 *   3. Éxito — confirma activación
 *
 * Desactivación: pide código TOTP para confirmar antes de unenroll.
 */
export default function MFASetup() {
  // "idle" | "enrolling-step1" | "enrolling-step2" | "enrolling-step3" | "unenrolling"
  const [mode, setMode] = useState("idle");
  const [isLoading, setIsLoading] = useState(true);

  // Estado de enrollment
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledFactorId, setEnrolledFactorId] = useState(null);

  // Datos del QR
  const [factorId, setFactorId] = useState(null);
  const [qrCode, setQrCode] = useState(null);   // SVG string
  const [secret, setSecret] = useState(null);    // código manual

  // Input del usuario
  const [totpCode, setTotpCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── Chequear si ya está enrolled ─────────────────────────────────────────
  useEffect(() => {
    checkEnrollment();
  }, []);

  const checkEnrollment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totp = data?.totp?.find((f) => f.status === "verified");
      if (totp) {
        setIsEnrolled(true);
        setEnrolledFactorId(totp.id);
      } else {
        setIsEnrolled(false);
        setEnrolledFactorId(null);
      }
    } catch (err) {
      console.error("[MFA] Error al verificar estado:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Paso 1→2: Iniciar enrollment y obtener QR ────────────────────────────
  const handleStartEnroll = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "ChileBite Authenticator",
      });
      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);   // SVG URI (data:image/svg+xml;...)
      setSecret(data.totp.secret);
      setMode("enrolling-step2");
    } catch (err) {
      setError(err.message || "Error al iniciar la configuración de 2FA.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Paso 2→3: Verificar código TOTP ──────────────────────────────────────
  const handleVerifyEnroll = async () => {
    if (totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
      setError("El código debe tener exactamente 6 dígitos.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId });
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: totpCode,
      });
      if (error) throw error;

      setIsEnrolled(true);
      setEnrolledFactorId(factorId);
      setMode("enrolling-step3");
      toast.success("¡Autenticación en dos pasos activada!");
    } catch (err) {
      setError("Código incorrecto. Asegúrate de que la app esté sincronizada y vuelve a intentarlo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Desactivar MFA ────────────────────────────────────────────────────────
  const handleUnenroll = async () => {
    if (totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
      setError("Ingresa el código de 6 dígitos para confirmar.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      // Primero verificar con el código actual para reconfirmar identidad
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.find((f) => f.status === "verified");
      if (!totp) throw new Error("No se encontró el factor activo.");

      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.id,
        code: totpCode,
      });
      if (verifyError) throw new Error("Código incorrecto.");

      // Ahora sí unenroll
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: totp.id });
      if (unenrollError) throw unenrollError;

      setIsEnrolled(false);
      setEnrolledFactorId(null);
      setMode("idle");
      setTotpCode("");
      toast.success("Autenticación en dos pasos desactivada.");
    } catch (err) {
      setError(err.message || "Error al desactivar 2FA.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Copiar secreto al portapapeles ────────────────────────────────────────
  const handleCopySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const resetFlow = () => {
    setMode("idle");
    setTotpCode("");
    setError("");
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    checkEnrollment();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <Loader className="w-4 h-4 animate-spin" style={{ color: BRAND }} />
        <span className="text-sm text-default-500">Verificando estado del 2FA...</span>
      </div>
    );
  }

  // Estado IDLE — muestra estado actual y botón de acción
  if (mode === "idle") {
    return (
      <div className="mt-2 space-y-4">
        {isEnrolled ? (
          <>
            <div className="flex items-center gap-2 p-3 bg-success-soft rounded-xl border border-success-soft">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <p className="text-xs text-foreground font-medium">
                Autenticación en dos pasos <strong>activa</strong>. Tu cuenta está protegida.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setMode("unenrolling"); setTotpCode(""); setError(""); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <ShieldOff className="w-4 h-4" />
              Desactivar 2FA
            </button>
          </>
        ) : (
          <>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>Recomendado:</strong> El 2FA agrega una capa de seguridad extra. Necesitarás una app autenticadora (Google Authenticator, Authy, etc.).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMode("enrolling-step1")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              <ShieldCheck className="w-4 h-4" />
              Activar 2FA
            </button>
          </>
        )}
      </div>
    );
  }

  // Paso 1 — Introducción
  if (mode === "enrolling-step1") {
    return (
      <div className="mt-2 space-y-4">
        <StepIndicator current={1} />
        <p className="text-sm font-semibold text-foreground">Necesitarás una app autenticadora</p>
        <div className="space-y-2">
          {["Google Authenticator", "Authy", "Microsoft Authenticator", "1Password"].map((app) => (
            <div key={app} className="flex items-center gap-2 text-xs text-default-500">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: BRAND }} />
              {app}
            </div>
          ))}
        </div>
        <p className="text-xs text-default-400 leading-relaxed">
          Después de instalada la app, haremos clic en "Continuar" para escanear el código QR.
        </p>
        {error && <ErrorBox message={error} />}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleStartEnroll}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
            style={{ backgroundColor: BRAND }}
          >
            {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            Continuar
          </button>
          <CancelButton onClick={resetFlow} />
        </div>
      </div>
    );
  }

  // Paso 2 — QR + Código
  if (mode === "enrolling-step2") {
    return (
      <div className="mt-2 space-y-4">
        <StepIndicator current={2} />
        <p className="text-sm font-semibold text-foreground">Escanea este código QR</p>
        <p className="text-xs text-default-500 leading-relaxed">
          Abre tu app autenticadora, toca "Agregar cuenta" y escanea el código.
        </p>

        {/* QR Code */}
        {qrCode && (
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-2xl border border-border shadow-sm">
              <img src={qrCode} alt="Código QR para 2FA" className="w-44 h-44" />
            </div>
          </div>
        )}

        {/* Clave manual */}
        {secret && (
          <div className="space-y-1">
            <p className="text-xs text-default-400">¿No puedes escanear? Ingresa esta clave manualmente:</p>
            <div className="flex items-center gap-2 p-2.5 bg-field rounded-xl border border-field-border">
              <code className="text-xs font-mono text-foreground flex-1 break-all">{secret}</code>
              <button
                type="button"
                onClick={handleCopySecret}
                className="shrink-0 p-1.5 rounded-lg hover:bg-default-hover transition-colors text-default-500 hover:text-foreground"
                title="Copiar clave"
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Input código */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-default-600 uppercase tracking-widest">
            Código de verificación (6 dígitos)
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={totpCode}
            onChange={(e) => { setTotpCode(e.target.value.replace(/\D/g, "")); setError(""); }}
            placeholder="000000"
            className="w-full px-4 py-3 rounded-xl text-center text-xl font-mono tracking-[0.4em] border border-field-border bg-field text-foreground placeholder-field-placeholder focus:outline-none focus:border-[#b08968] focus:ring-2 focus:ring-[#b08968]/20 transition-all"
          />
        </div>

        {error && <ErrorBox message={error} />}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleVerifyEnroll}
            disabled={isSubmitting || totpCode.length !== 6}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
            style={{ backgroundColor: BRAND }}
          >
            {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Verificar y activar
          </button>
          <CancelButton onClick={resetFlow} />
        </div>
      </div>
    );
  }

  // Paso 3 — Éxito
  if (mode === "enrolling-step3") {
    return (
      <div className="mt-2 space-y-4">
        <div className="flex flex-col items-center text-center py-4 space-y-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#22c55e18" }}>
            <CheckCircle2 className="w-7 h-7" style={{ color: "#22c55e" }} />
          </div>
          <p className="text-base font-extrabold text-foreground">¡2FA Activado!</p>
          <p className="text-xs text-default-500 leading-relaxed max-w-xs">
            Cada vez que inicies sesión, necesitarás ingresar el código de 6 dígitos de tu app autenticadora.
          </p>
        </div>
        <button
          type="button"
          onClick={resetFlow}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border border-border text-default-600 hover:bg-default-hover transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Listo
        </button>
      </div>
    );
  }

  // Modo unenrolling — Confirmación con código
  if (mode === "unenrolling") {
    return (
      <div className="mt-2 space-y-4">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
            Para desactivar el 2FA, ingresa el código actual de tu app autenticadora. Esta acción reducirá la seguridad de tu cuenta.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-default-600 uppercase tracking-widest">
            Código actual de tu app (6 dígitos)
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={totpCode}
            onChange={(e) => { setTotpCode(e.target.value.replace(/\D/g, "")); setError(""); }}
            placeholder="000000"
            className="w-full px-4 py-3 rounded-xl text-center text-xl font-mono tracking-[0.4em] border border-field-border bg-field text-foreground placeholder-field-placeholder focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all"
          />
        </div>

        {error && <ErrorBox message={error} />}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUnenroll}
            disabled={isSubmitting || totpCode.length !== 6}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
            Desactivar 2FA
          </button>
          <CancelButton onClick={resetFlow} />
        </div>
      </div>
    );
  }

  return null;
}

// ── Sub-componentes ────────────────────────────────────────────────────────

function StepIndicator({ current }) {
  const steps = ["Preparar app", "Escanear QR", "Listo"];
  return (
    <div className="flex items-center gap-2 mb-1">
      {steps.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                done ? "bg-success text-white" : active ? "text-white" : "bg-default-200 text-default-500"
              }`}
              style={active ? { backgroundColor: BRAND } : {}}
            >
              {done ? "✓" : step}
            </div>
            <span className={`text-xs font-medium ${active ? "text-foreground" : "text-default-400"}`}>
              {label}
            </span>
            {i < steps.length - 1 && <span className="text-default-200 mx-0.5">›</span>}
          </div>
        );
      })}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">{message}</p>
    </div>
  );
}

function CancelButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-default-600 border border-border hover:bg-default-hover transition-colors"
    >
      <X className="w-4 h-4" /> Cancelar
    </button>
  );
}
