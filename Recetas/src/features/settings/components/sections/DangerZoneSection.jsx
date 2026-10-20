import React, { useState } from "react";
import { Trash2, Loader, X } from "lucide-react";
import { toast } from "@heroui/react";
import { supabase } from '@/lib/supabaseClient';
import { deleteAccount } from '@/lib/profileService';
import { Section, Row } from "./SettingsShared";

export function DangerZoneSection({ user }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitiatingDelete, setIsInitiatingDelete] = useState(false);

  const identities = user?.identities || [];
  const isGoogleLinked = identities.some(id => id.provider === "google");

  const handleInitiateDelete = async () => {
    if (isGoogleLinked && identities.length === 1) {
      setShowDeleteConfirm(true);
      return;
    }
    
    setIsInitiatingDelete(true);
    try {
      const { error } = await supabase.auth.reauthenticate();
      if (error) throw error;
      
      toast.success("Te enviamos un correo. Por favor confírmalo antes de proceder.", { duration: 5000 });
      setShowDeleteConfirm(true);
    } catch (err) {
      console.error(err);
      setShowDeleteConfirm(true);
    } finally {
      setIsInitiatingDelete(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      window.location.href = "/";
    } catch {
      toast.danger("Error al eliminar la cuenta");
      setIsDeleting(false);
    }
  };

  return (
    <Section title="Zona de peligro">
      <Row icon={Trash2} label="Eliminar cuenta" sublabel="Acción permanente e irreversible" iconColor="#ef4444">
        <div className="mt-2 p-4 sm:p-5 bg-red-50/60 dark:bg-red-950/20 rounded-2xl border border-red-200/80 dark:border-red-900/50">
          <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed mb-4">
            Al eliminar tu cuenta, todos tus datos, recetas guardadas y configuraciones serán borrados permanentemente. Esta acción no se puede deshacer.
          </p>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={handleInitiateDelete}
              disabled={isInitiatingDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 bg-white dark:bg-[#18181d] hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isInitiatingDelete ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Eliminar mi cuenta
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-red-700 dark:text-red-300">
                {(!isGoogleLinked || identities.length > 1) ? 
                  "¿Ya verificaste tu identidad en el correo? ¿Estás completamente seguro/a?" : 
                  "¿Estás completamente seguro/a?"}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-all shadow-sm"
                >
                  {isDeleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Sí, eliminar definitivamente
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-text-main dark:text-zinc-200 border border-border-subtle dark:border-zinc-700 hover:bg-surface-muted dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </Row>
    </Section>
  );
}
