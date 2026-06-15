import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

/**
 * AuthErrorHandler
 *
 * Landing component for Supabase auth redirect URLs.
 * Supabase appends auth results as URL hash fragments, e.g.:
 *
 *   SUCCESS (email change confirmed):
 *   /settings#access_token=...&type=email_change
 *
 *   ERROR (expired OTP / invalid link):
 *   /settings#error=access_denied&error_code=otp_expired&error_description=...
 *
 * This component parses the hash, shows the user a clear message,
 * and redirects to the correct page when appropriate.
 */
export default function AuthErrorHandler() {
  const [state, setState] = useState("loading"); // "loading" | "error" | "success" | "redirect"
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDescription, setErrorDescription] = useState("");

  useEffect(() => {
    const hash = window.location.hash.slice(1); // strip leading #
    const params = new URLSearchParams(hash);

    const error = params.get("error");
    const errorCode = params.get("error_code");
    const errorDesc = params.get("error_description");
    const type = params.get("type");
    const accessToken = params.get("access_token");

    if (error) {
      // Supabase error redirect — show friendly message
      const titleMap = {
        otp_expired: "Enlace Expirado",
        access_denied: "Acceso Denegado",
        email_not_confirmed: "Email No Confirmado",
      };

      const descMap = {
        otp_expired:
          "El enlace de verificación que usaste ya expiró. Los links de seguridad tienen una validez de 1 hora. Por favor, solicita uno nuevo.",
        access_denied:
          "El enlace de correo es inválido o ya fue usado. Solicita un nuevo enlace desde tu cuenta.",
      };

      setErrorTitle(titleMap[errorCode] || titleMap[error] || "Error de Autenticación");
      setErrorDescription(
        errorDesc
          ? decodeURIComponent(errorDesc.replace(/\+/g, " "))
          : descMap[errorCode] || "Hubo un problema al procesar tu solicitud."
      );
      setState("error");
      return;
    }

    if (accessToken && type === "email_change") {
      // Email change confirmed — show success briefly then redirect
      setState("success");
      setTimeout(() => {
        window.location.href = "/profile/settings";
      }, 2500);
      return;
    }

    if (accessToken) {
      // Generic token — redirect to settings
      setState("redirect");
      setTimeout(() => {
        window.location.href = "/profile/settings";
      }, 1000);
      return;
    }

    // No hash params at all — just redirect to the real settings page
    window.location.href = "/profile/settings";
  }, []);

  const BRAND = "#b08968";

  if (state === "loading" || state === "redirect") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: BRAND }} />
        <p className="text-default-500 font-medium">Redirigiendo a ajustes...</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 border border-gray-100 dark:border-gray-700 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "#22c55e18" }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: "#22c55e" }} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          ¡Correo Actualizado!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          Tu dirección de correo electrónico ha sido confirmada y actualizada correctamente.
          Serás redirigido a tus ajustes en un momento.
        </p>
        <div className="mt-6">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: BRAND }} />
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 border border-gray-100 dark:border-gray-700 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          {errorTitle}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
          {errorDescription}
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/profile/settings"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
            style={{ backgroundColor: BRAND }}
          >
            <RefreshCw className="w-4 h-4" />
            Solicitar nuevo enlace
          </a>
          <a
            href="/"
            className="w-full py-3 rounded-2xl font-semibold text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return null;
}
