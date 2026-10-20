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
        <div className="flex flex-col gap-3 mt-3">
          <label className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-colors ${
            locale === 'es-CL'
              ? 'border-brand-primary/40 dark:border-[#f0a262]/40 bg-brand-primary/5 dark:bg-[#f0a262]/10'
              : 'border-border-subtle dark:border-zinc-800 bg-white dark:bg-[#18181d] hover:bg-surface-muted/50 dark:hover:bg-zinc-800/40'
          }`}>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-text-muted dark:text-zinc-400" />
              <div>
                <p className="text-sm font-bold text-text-main dark:text-zinc-100">Español (Chile)</p>
                <p className="text-xs text-text-muted dark:text-zinc-400">Formato predeterminado</p>
              </div>
            </div>
            <input 
              type="radio" 
              name="locale" 
              value="es-CL" 
              checked={locale === 'es-CL'} 
              onChange={handleLocaleChange}
              disabled={isSaving}
              className="w-4 h-4 accent-[#7a461b] dark:accent-[#f0a262]"
            />
          </label>
          <label className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-colors ${
            locale === 'es-ES'
              ? 'border-brand-primary/40 dark:border-[#f0a262]/40 bg-brand-primary/5 dark:bg-[#f0a262]/10'
              : 'border-border-subtle dark:border-zinc-800 bg-white dark:bg-[#18181d] hover:bg-surface-muted/50 dark:hover:bg-zinc-800/40'
          }`}>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-text-muted dark:text-zinc-400" />
              <div>
                <p className="text-sm font-bold text-text-main dark:text-zinc-100">Español (España)</p>
                <p className="text-xs text-text-muted dark:text-zinc-400">Formato europeo</p>
              </div>
            </div>
            <input 
              type="radio" 
              name="locale" 
              value="es-ES" 
              checked={locale === 'es-ES'} 
              onChange={handleLocaleChange}
              disabled={isSaving}
              className="w-4 h-4 accent-[#7a461b] dark:accent-[#f0a262]"
            />
          </label>
          <label className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-colors ${
            locale === 'en-US'
              ? 'border-brand-primary/40 dark:border-[#f0a262]/40 bg-brand-primary/5 dark:bg-[#f0a262]/10'
              : 'border-border-subtle dark:border-zinc-800 bg-white dark:bg-[#18181d] hover:bg-surface-muted/50 dark:hover:bg-zinc-800/40'
          }`}>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-text-muted dark:text-zinc-400" />
              <div>
                <p className="text-sm font-bold text-text-main dark:text-zinc-100">English (US)</p>
                <p className="text-xs text-text-muted dark:text-zinc-400">US format</p>
              </div>
            </div>
            <input 
              type="radio" 
              name="locale" 
              value="en-US" 
              checked={locale === 'en-US'} 
              onChange={handleLocaleChange}
              disabled={isSaving}
              className="w-4 h-4 accent-[#7a461b] dark:accent-[#f0a262]"
            />
          </label>
        </div>
      </Row>
    </Section>
  );
}
