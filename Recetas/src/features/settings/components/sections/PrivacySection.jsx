import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Loader, Download } from "lucide-react";
import { toast } from "@heroui/react";
import { supabase } from '@/lib/supabaseClient';
import { Section, Row, BRAND } from "./SettingsShared";

export function PrivacySection({ user, profile }) {
  const [profileVisibility, setProfileVisibility] = useState(profile?.profile_visibility || 'public');
  const [isSaving, setIsSaving] = useState(false);
  
  // For collections visibility, we check if they have any public collections
  const [collectionsPublic, setCollectionsPublic] = useState(false);
  const [loadingCols, setLoadingCols] = useState(true);

  useEffect(() => {
    async function checkCollections() {
      if (!user) return;
      const { data } = await supabase.from('core_coleccion').select('is_public').eq('user_id', user.id);
      if (data) {
        setCollectionsPublic(data.some(c => c.is_public));
      }
      setLoadingCols(false);
    }
    checkCollections();
  }, [user]);

  const handleVisibilityChange = async (value) => {
    setProfileVisibility(value);
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ profile_visibility: value }).eq('id', user.id);
      if (error) throw error;
      toast.success("Visibilidad del perfil actualizada.");
    } catch (err) {
      toast.error("Error al actualizar la visibilidad.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCollectionsToggle = async () => {
    const newValue = !collectionsPublic;
    setCollectionsPublic(newValue);
    setIsSaving(true);
    try {
      const { error } = await supabase.from('core_coleccion').update({ is_public: newValue }).eq('user_id', user.id);
      if (error) throw error;
      toast.success(`Colecciones marcadas como ${newValue ? 'públicas' : 'privadas'}.`);
    } catch (err) {
      toast.error("Error al actualizar colecciones.");
      setCollectionsPublic(!newValue);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    toast.success("Generando exportación de datos...");
    // Future Edge Function implementation
    setTimeout(() => {
      toast.info("Esta función estará disponible pronto.");
    }, 1500);
  };

  return (
    <Section title="Privacidad">
      <Row icon={Lock} label="Visibilidad del Perfil" sublabel="Controla quién puede ver tu perfil público" iconColor="#8b5cf6">
        <div className="flex flex-col gap-3 mt-3 px-2">
          <label className="flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-default-50 transition-colors">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-default-500" />
              <div>
                <p className="text-sm font-semibold">Público</p>
                <p className="text-xs text-default-500">Cualquier persona puede ver tu perfil</p>
              </div>
            </div>
            <input 
              type="radio" 
              name="visibility" 
              value="public" 
              checked={profileVisibility === 'public'} 
              onChange={() => handleVisibilityChange('public')}
              className="w-4 h-4 text-brand focus:ring-brand"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-default-50 transition-colors">
            <div className="flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-default-500" />
              <div>
                <p className="text-sm font-semibold">Privado</p>
                <p className="text-xs text-default-500">Solo tú puedes ver tu perfil</p>
              </div>
            </div>
            <input 
              type="radio" 
              name="visibility" 
              value="private" 
              checked={profileVisibility === 'private'} 
              onChange={() => handleVisibilityChange('private')}
              className="w-4 h-4 text-brand focus:ring-brand"
            />
          </label>
        </div>
      </Row>

      <Row icon={Eye} label="Colecciones Guardadas" sublabel="Hacer que tus colecciones de recetas sean públicas" iconColor="#0ea5e9">
        <div className="flex items-center justify-between mt-3 px-2">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">Colecciones Públicas</p>
            <p className="text-xs text-default-500 mt-1">Permitir que otros vean tus recetas guardadas</p>
          </div>
          {loadingCols ? (
            <Loader className="w-5 h-5 animate-spin text-default-300" />
          ) : (
            <button type="button" onClick={handleCollectionsToggle} disabled={isSaving} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b08968] focus-visible:ring-opacity-75 ${collectionsPublic ? 'bg-[#b08968]' : 'bg-black/20'}`}>
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${collectionsPublic ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          )}
        </div>
      </Row>

      <Row icon={Download} label="Exportar mis datos" sublabel="Descarga una copia de toda tu información" iconColor="#10b981">
        <div className="mt-2 space-y-3">
          <p className="text-xs text-default-500 leading-relaxed">
            Obtén un archivo JSON con tu perfil, colecciones y recetas en cumplimiento con normativas de privacidad.
          </p>
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#10b981" }}
          >
            <Download className="w-4 h-4" />
            Descargar datos
          </button>
        </div>
      </Row>
    </Section>
  );
}
