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
      toast.error("Error al eliminar la cuenta");
      setIsDeleting(false);
    }
  };

  return (
    <Section title="Zona de peligro">
      <Row icon={Trash2} label="Eliminar cuenta" sublabel="Acción permanente e irreversible" iconColor="#ef4444">
        <div className="mt-2 p-4 bg-danger-soft rounded-xl border border-danger-soft">
          <p className="text-xs text-danger leading-relaxed mb-4">
            Al eliminar tu cuenta, todos tus datos, recetas guardadas y configuraciones serán borrados permanentemente. Esta acción no se puede deshacer.
          </p>
          {!showDeleteConfirm ? (
            <button onClick={handleInitiateDelete} disabled={isInitiatingDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-danger border border-danger hover:bg-danger-hover disabled:opacity-50 transition-colors">
              {isInitiatingDelete ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Eliminar mi cuenta
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-danger-700">
                {(!isGoogleLinked || identities.length > 1) ? 
                  "¿Ya verificaste tu identidad en el correo? ¿Estás completamente seguro/a?" : 
                  "¿Estás completamente seguro/a?"}
              </p>
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
  );
}
