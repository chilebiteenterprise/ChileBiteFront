import React, { useState } from "react";
import FireContainer from "./FireContainer";
import { Button, Select, ListBox, Label, Tooltip } from "@heroui/react";



// Iconos premium, sólidos y limpios para el Mini-Sidebar
const GlobeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LeafIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21.5V11m0-1c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6zM12 10c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6z" />
  </svg>
);

const ForkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4v5M15 4v5M7 4v5m4 5v7M11 14c-2.5 0-4-1.5-4-4V4h8v6c0 2.5-1.5 4-4 4z" />
  </svg>
);

const FireOutlineIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const RecipeFilters = ({
  selectedCategories,
  setSelectedCategories,
  selectedPortions, 
  setSelectedPortions, 
  selectedCountry,
  setSelectedCountry,
  selectedDifficulty,
  setSelectedDifficulty,
  resetFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [paises, setPaises] = useState([]);
  const [tiposPlato, setTiposPlato] = useState([]);
  const [dietas, setDietas] = useState([]);

  React.useEffect(() => {
    // Fetch initial data for filters
    const rawApiUrl = import.meta.env.PUBLIC_API_URL || "https://chilebiteback.onrender.com";
    const apiUrl = rawApiUrl?.startsWith("http") ? rawApiUrl : `https://${rawApiUrl}`;
    fetch(`${apiUrl}/api/paises/`).then(r => r.json()).then(data => setPaises(data.map(d => d.nombre)));
    fetch(`${apiUrl}/api/tipos-plato/`).then(r => r.json()).then(data => setTiposPlato(data.map(d => d.nombre)));
    fetch(`${apiUrl}/api/estilos-vida/`).then(r => r.json()).then(data => setDietas(data.map(d => d.nombre)));
  }, []);

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const getActiveFilterCount = () => {
    let count = selectedCategories.length;
    if (selectedCountry) count++;
    if (selectedDifficulty > 0) count++;
    return count;
  };

  return (
    <>
      {/* Wrapper dinámico para el DOM (Push Layout). Mantiene el rastro del componente. */}
      <div 
        className={`shrink-0 transition-all duration-300 ease-in-out z-40 relative 
          ${isOpen ? 'w-[80px] md:w-[280px] lg:w-[320px]' : 'w-[80px]'}`
        }
      >
        {/* Overlay Oscuro para móviles (< md) - Desenfoca el fondo pero no empuja */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/40 dark:bg-black/80 z-30 md:hidden transition-opacity backdrop-blur-sm"
            style={{ left: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar Físico: 'fixed' en móvil para el overlay (drawer), 'sticky' siempre para anclarse en desktop */}
        <aside className={`
          ${isOpen ? 'fixed md:sticky' : 'sticky'} 
          top-16 left-0 h-[calc(100vh-5rem)] bg-white dark:bg-[#0f1115] border-r border-gray-200 dark:border-gray-800/80 
          flex flex-col z-40 transition-all duration-300 ease-in-out
          rounded-r-3xl
          ${isOpen ? 'w-[85vw] max-w-[320px] shadow-2xl md:shadow-none md:w-[280px] lg:w-[320px] translate-x-0' : 'w-[80px] translate-x-0'}
        `}>
          
          {/* Header */}
          <div className={`shrink-0 rounded-tr-3xl border-b border-gray-100 dark:border-gray-800/80 transition-colors flex items-center ${isOpen ? 'justify-between px-6 py-5' : 'justify-center py-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'}`} onClick={() => !isOpen && setIsOpen(true)}>
            {isOpen ? (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
                  RecipeFilters
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-[#A0522D] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Refina tu búsqueda
                </p>
              </div>
            ) : (
              <div className="relative">
                <FilterIcon />
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-[#A0522D] border-2 border-white dark:border-[#0f1115]"></span>
                )}
              </div>
            )}
            
            {/* Click chevron to toggle desktop */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden md:block"
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Click X to close mobile */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
              className="md:hidden text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className={`flex flex-1 flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 ${isOpen ? 'p-6 gap-8' : 'p-3 py-6 items-center gap-6'}`}>
            
            {/* Origen / País */}
            <section className={`flex flex-col ${isOpen ? 'gap-3' : 'items-center gap-1 cursor-pointer'}`} onClick={() => !isOpen && setIsOpen(true)}>
              {isOpen ? (
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <GlobeIcon /> Origen
                </h3>
              ) : (
                <Tooltip content="Origen / País" placement="right">
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition opacity-80 hover:opacity-100">
                    <GlobeIcon />
                  </div>
                </Tooltip>
              )}
              
              {isOpen && (
                <Select 
                  className="w-full" 
                  placeholder="Todos los países"
                  selectedKeys={selectedCountry ? [selectedCountry] : []}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0];
                    setSelectedCountry(val || "");
                  }}
                  variant="bordered"
                  size="sm"
                  classNames={{
                    trigger: "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors",
                  }}
                >
                  <Label className="sr-only">País</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {paises.map(p => (
                        <ListBox.Item key={p} id={p} textValue={p}>
                          {p}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
            </section>

            {/* Separador */}
            <div className="h-px w-full bg-gray-100 dark:bg-gray-800/60 rounded-full shrink-0" />

            {/* Dificultad */}
            <section className={`flex flex-col ${isOpen ? 'gap-3' : 'items-center gap-1 cursor-pointer'}`} onClick={() => !isOpen && setIsOpen(true)}>
              {isOpen ? (
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <FireOutlineIcon /> Dificultad
                </h3>
              ) : (
                <Tooltip content="Dificultad" placement="right">
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition opacity-80 hover:opacity-100">
                    <FireOutlineIcon />
                  </div>
                </Tooltip>
              )}

              {isOpen && (
                <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/80 flex justify-center shadow-inner">
                  <FireContainer
                    selectedDifficulty={selectedDifficulty}
                    setSelectedDifficulty={setSelectedDifficulty}
                  />
                </div>
              )}
            </section>

            {/* Separador */}
            <div className="h-px w-full bg-gray-100 dark:bg-gray-800/60 rounded-full shrink-0" />

            {/* Dietas e Intolerancias */}
            <section className={`flex flex-col ${isOpen ? 'gap-3' : 'items-center gap-1 cursor-pointer'}`} onClick={() => !isOpen && setIsOpen(true)}>
              {isOpen ? (
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <LeafIcon /> Estilo de Vida
                </h3>
              ) : (
                <Tooltip content="Estilo de Vida (Categorías)" placement="right">
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition opacity-80 hover:opacity-100">
                    <LeafIcon />
                  </div>
                </Tooltip>
              )}
              
              {isOpen && (
                <div className="flex flex-wrap gap-2">
                  {dietas.map((c) => {
                    const isSelected = selectedCategories.includes(c);
                    return (
                      <Button
                        key={c}
                        size="sm"
                        onPress={() => toggleCategory(c)}
                        className={`rounded-full text-xs font-medium transition-all duration-200 ${
                          isSelected 
                          ? "bg-[#A0522D] text-white shadow-md border-transparent scale-105" 
                          : "bg-transparent text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                        }`}
                      >
                        {c}
                      </Button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Separador */}
            <div className="h-px w-full bg-gray-100 dark:bg-gray-800/60 rounded-full shrink-0" />

            {/* Tipo de Plato */}
            <section className={`flex flex-col ${isOpen ? 'gap-3' : 'items-center gap-1 cursor-pointer'}`} onClick={() => !isOpen && setIsOpen(true)}>
              {isOpen ? (
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <ForkIcon /> Tipo de Plato
                </h3>
              ) : (
                  <Tooltip content="Tipo de Plato" placement="right">
                    <div className="p-3 bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition opacity-80 hover:opacity-100">
                      <ForkIcon />
                    </div>
                  </Tooltip>
              )}
              {isOpen && (
                <div className="flex flex-wrap gap-2">
                  {tiposPlato.map((c) => {
                    const isSelected = selectedCategories.includes(c);
                    return (
                      <Button
                        key={c}
                        size="sm"
                        onPress={() => toggleCategory(c)}
                        className={`rounded-full text-xs font-medium transition-all duration-200 ${
                          isSelected 
                          ? "bg-[#A0522D] text-white shadow-md border-transparent scale-105" 
                          : "bg-transparent text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                        }`}
                      >
                        {c}
                      </Button>
                    );
                  })}
                </div>
              )}
            </section>

          </div>

          {/* Pie / Reset */}
          <div className={`shrink-0 rounded-br-3xl border-t border-gray-100 dark:border-gray-800/80 mt-auto transition-all overflow-hidden ${isOpen ? 'p-6' : 'p-4 flex items-center justify-center'}`}>
            {isOpen ? (
              <Button
                className="w-full font-bold shadow-md bg-red-600 text-white hover:bg-red-700"
                variant="solid"
                onPress={() => {
                  resetFilters();
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                radius="md"
              >
                Limpiar filtros
              </Button>
            ) : (
              <button 
                className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={(e) => { e.stopPropagation(); resetFilters(); }}
                title="Limpiar filtros"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default RecipeFilters;
