import React from 'react';
import { Select, ListBox, Label } from "@heroui/react";

export default function RecipeToolbar({
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder
}) {
    return (
        <div className="bg-white dark:bg-[#0f1115] w-full border-b border-gray-100 dark:border-gray-800/80 p-5 mt-2 mb-6 rounded-[1.5rem] shadow-sm flex flex-col lg:flex-row lg:items-center gap-6 transition-colors">
            {/* Lado Izquierdo: Logo + Buscador */}
            <div className="flex flex-1 items-center gap-4">
                {/* Icono corporativo en lugar de Titulo "ChileBite" como solicitaste */}
                <div className="w-12 h-12 bg-[#A0522D] text-white rounded-2xl shadow-lg shadow-[#A0522D]/30 flex items-center justify-center shrink-0 transition-transform hover:scale-105">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Buscar recetas..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Lado Derecho: Ordenamiento */}
            <div className="flex items-center gap-3 shrink-0">
                <Select 
                  className="w-48 lg:w-56"
                  placeholder="Ordenar por..."
                  value={sortField || null}
                  onChange={(val) => {
                    if (val) setSortField(val);
                  }}
                  variant="bordered"
                  size="md"
                  disallowEmptySelection
                  classNames={{
                      trigger: "bg-gray-50 dark:bg-[#1a1d24] border-gray-200 dark:border-gray-800 h-12 rounded-2xl hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                  }}
                >
                  <Label className="sr-only">Ordenar</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="contador_likes" key="contador_likes" textValue="Popularidad">Popularidad</ListBox.Item>
                      <ListBox.Item id="dificultad" key="dificultad" textValue="Dificultad">Dificultad</ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>

                <button 
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="h-12 w-12 flex items-center justify-center bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 shadow-sm"
                    title={sortOrder === "asc" ? "Orden Ascendente" : "Orden Descendente"}
                >
                    <svg className={`w-5 h-5 transition-transform duration-300 ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
