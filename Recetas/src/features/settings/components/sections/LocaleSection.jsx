import React, { useState } from "react";
import { Globe, MapPin } from "lucide-react";
import { toast } from "@heroui/react";
import { supabase } from '@/lib/supabaseClient';
import { Section, Row } from "./SettingsShared";

export function LocaleSection({ user, profile }) {
  const [locale, setLocale] = useState(profile?.locale || 'es-CL');
  const [isSaving, setIsSaving] = useState(false);

  const handleLocaleChange = async (e) => {
    const newLocale = e.target.value;
    setLocale(newLocale);
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ locale: newLocale }).eq('id', user.id);
      if (error) throw error;
      toast.success("Idioma y región actualizados.");
    } catch (err) {
      toast.danger("Error al actualizar idioma y región.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Section title="Idioma y Región">
      <Row icon={Globe} label="Preferencia Regional" sublabel="Define cómo se muestran las fechas y números" iconColor="#0284c7">
        <div className="flex flex-col gap-3 mt-3 px-2">
          <label className="flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-default-50 transition-colors">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-default-500" />
              <div>
                <p className="text-sm font-semibold">Español (Chile)</p>
                <p className="text-xs text-default-500">Formato predeterminado</p>
              </div>
            </div>
            <input 
              type="radio" 
              name="locale" 
              value="es-CL" 
              checked={locale === 'es-CL'} 
              onChange={handleLocaleChange}
              disabled={isSaving}
              className="w-4 h-4 text-brand focus:ring-brand"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-default-50 transition-colors">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-default-500" />
              <div>
                <p className="text-sm font-semibold">Español (España)</p>
                <p className="text-xs text-default-500">Formato europeo</p>
              </div>
            </div>
            <input 
              type="radio" 
              name="locale" 
              value="es-ES" 
              checked={locale === 'es-ES'} 
              onChange={handleLocaleChange}
              disabled={isSaving}
              className="w-4 h-4 text-brand focus:ring-brand"
            />
          </label>
          <label className="flex items-center justify-between p-3 border border-border rounded-xl cursor-pointer hover:bg-default-50 transition-colors">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-default-500" />
              <div>
                <p className="text-sm font-semibold">English (US)</p>
                <p className="text-xs text-default-500">US format</p>
              </div>
            </div>
            <input 
              type="radio" 
              name="locale" 
              value="en-US" 
              checked={locale === 'en-US'} 
              onChange={handleLocaleChange}
              disabled={isSaving}
              className="w-4 h-4 text-brand focus:ring-brand"
            />
          </label>
        </div>
      </Row>
    </Section>
  );
}
