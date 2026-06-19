import React, { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Section, Row } from "./SettingsShared";

export function AppearanceSection() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return typeof window !== "undefined" && window.localStorage.getItem("theme") === "dark";
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <Section title="Apariencia">
      <Row icon={isDarkMode ? Moon : Sun} label="Tema visual" sublabel="Cambiar entre modo claro y oscuro" iconColor="#f59e0b">
        <div className="flex items-center justify-between mt-3 px-2">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">Modo Oscuro</p>
            <p className="text-xs text-default-500 mt-1">Activar para cambiar toda la aplicación al modo oscuro</p>
          </div>
          <button type="button" onClick={toggleDarkMode} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b08968] focus-visible:ring-opacity-75 ${isDarkMode ? 'bg-[#b08968]' : 'bg-black/20'}`}>
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </Row>
    </Section>
  );
}
