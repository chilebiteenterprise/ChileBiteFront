import React from "react";
import { toast } from "@heroui/react";

/**
 * Muestra una notificación cuando un usuario no autenticado intenta
 * realizar acciones exclusivas de usuarios (como dar me gusta o guardar).
 *
 * @param {'like' | 'save' | 'comment'} action - Tipo de acción intentada
 */
export function notifyAuthRequired(action = "like") {
  const isLike = action === "like";
  const isSave = action === "save";

  const title = isLike
    ? "Inicia sesión para dar me gusta"
    : isSave
    ? "Inicia sesión para guardar recetas"
    : "Inicia sesión para continuar";

  const description = isLike
    ? "Debes estar registrado e iniciar sesión para indicar que te gusta una receta."
    : isSave
    ? "Debes estar registrado e iniciar sesión para guardar recetas en tus colecciones."
    : "Debes iniciar sesión para realizar esta acción.";

  toast.warning(
    (
      <div className="flex flex-col gap-1 pr-1 text-left">
        <span className="font-bold text-sm text-foreground">{title}</span>
        <span className="text-xs text-text-muted leading-relaxed">{description}</span>
        <button
          type="button"
          onClick={(e) => {
            e?.stopPropagation?.();
            if (typeof window !== "undefined" && typeof window.abrirLoginNavbar === "function") {
              window.abrirLoginNavbar();
            }
          }}
          className="mt-1 text-xs font-bold text-brand-primary underline hover:opacity-80 transition-opacity self-start cursor-pointer"
        >
          Iniciar sesión ahora →
        </button>
      </div>
    ),
    {
      timeout: 5000,
    }
  );
}
