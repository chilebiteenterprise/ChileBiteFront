import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Select, ListBox, Label } from "@heroui/react";

// ─────────────────────────────────────────────────────────────────────────────
// SearchIcon
// ─────────────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
    </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Autocomplete Search Box
// ─────────────────────────────────────────────────────────────────────────────
function SearchAutocomplete({ searchQuery, setSearchQuery, allRecipeNames }) {
    const [inputValue, setInputValue] = useState(searchQuery);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const containerRef = useRef(null);

    // Normalize for comparison
    const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Suggestions: filter by current input, max 8, deduplicated
    const suggestions = React.useMemo(() => {
        const q = normalize(inputValue.trim());
        if (!q || q.length < 1) return [];
        return [...new Set(
            allRecipeNames.filter(name => normalize(name).includes(q))
        )].slice(0, 8);
    }, [inputValue, allRecipeNames]);

    // Sync external searchQuery -> inputValue when cleared from outside (e.g., resetFilters)
    useEffect(() => {
        if (searchQuery === "") setInputValue("");
    }, [searchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        setSearchQuery(val);
        setIsOpen(true);
        setActiveIndex(-1);
    };

    const handleSelect = (name) => {
        setInputValue(name);
        setSearchQuery(name);
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
    };

    const handleClear = () => {
        setInputValue("");
        setSearchQuery("");
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (!isOpen || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === "Enter") {
            if (activeIndex >= 0) {
                e.preventDefault();
                handleSelect(suggestions[activeIndex]);
            } else {
                setIsOpen(false);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    // Highlight matching segment
    const highlight = (text, query) => {
        const normText = normalize(text);
        const normQuery = normalize(query.trim());
        const idx = normText.indexOf(normQuery);
        if (idx === -1 || !normQuery) return <span className="text-text-main">{text}</span>;
        return (
            <>
                <span className="text-text-main">{text.slice(0, idx)}</span>
                <span className="text-brand-primary font-bold">{text.slice(idx, idx + normQuery.length)}</span>
                <span className="text-text-main">{text.slice(idx + normQuery.length)}</span>
            </>
        );
    };

    const showDropdown = isOpen && suggestions.length > 0;

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            {/* Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-subtle">
                    <SearchIcon />
                </div>
                <input
                    ref={inputRef}
                    id="recipe-search-input"
                    type="text"
                    aria-label="Buscar recetas"
                    autoComplete="off"
                    spellCheck={false}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showDropdown}
                    aria-haspopup="listbox"
                    aria-controls={showDropdown ? "recipe-suggestions-list" : undefined}
                    aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
                    placeholder="Buscar recetas..."
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
                    onKeyDown={handleKeyDown}
                    className="w-full h-12 pl-11 pr-10 bg-surface-input border border-border-subtle rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-text-main placeholder:text-text-subtle transition-all font-medium text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                />
                {/* Clear button */}
                {inputValue && (
                    <button
                        onClick={handleClear}
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-subtle hover:text-text-main transition-colors"
                        aria-label="Limpiar búsqueda"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div
                    id="recipe-suggestions-list"
                    role="listbox"
                    ref={listRef}
                    className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-surface-elevated border border-border-subtle rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-top-1 duration-150"
                >
                    {/* Header */}
                    <div className="px-4 pt-3 pb-2 border-b border-border-subtle flex items-center gap-2 text-text-subtle">
                        <SearchIcon />
                        <span className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
                            {suggestions.length} sugerencia{suggestions.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <ul className="py-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border-subtle">
                        {suggestions.map((name, idx) => (
                            <li
                                key={name}
                                id={`suggestion-${idx}`}
                                role="option"
                                aria-selected={idx === activeIndex}
                                onMouseDown={(e) => { e.preventDefault(); handleSelect(name); }}
                                onMouseEnter={() => setActiveIndex(idx)}
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm ${
                                    idx === activeIndex
                                        ? "bg-brand-subtle text-brand-primary font-medium"
                                        : "text-text-main hover:bg-surface-muted"
                                }`}
                            >
                                {/* Icon */}
                                <span className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-lg ${
                                    idx === activeIndex ? "bg-brand-subtle" : "bg-surface-muted"
                                }`}>
                                    <svg className="w-3.5 h-3.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </span>
                                <span className="truncate">{highlight(name, inputValue)}</span>
                            </li>
                        ))}
                    </ul>
                    {/* Footer hint */}
                    <div className="px-4 py-2 border-t border-border-subtle flex items-center gap-3 text-[10px] text-text-subtle">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-surface-muted text-text-muted rounded text-[10px] font-mono">↑↓</kbd> navegar
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-surface-muted text-text-muted rounded text-[10px] font-mono">Enter</kbd> seleccionar
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-surface-muted text-text-muted rounded text-[10px] font-mono">Esc</kbd> cerrar
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Toolbar
// ─────────────────────────────────────────────────────────────────────────────
export default function RecipeToolbar({
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    allRecipeNames = [],
    filterSaved,
    setFilterSaved,
    hideFavoritesToggle = false,
}) {
    return (
        <div className="bg-surface-card w-full border border-border-subtle p-5 mt-2 mb-6 rounded-[1.5rem] shadow-sm flex flex-col lg:flex-row lg:items-center gap-6 transition-colors">
            {/* Left: Logo + Search */}
            <div className="flex flex-1 items-center gap-4">
                {/* Corporate icon */}
                <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/30 flex items-center justify-center shrink-0 transition-transform hover:scale-105">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>

                <SearchAutocomplete
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    allRecipeNames={allRecipeNames}
                />
            </div>

            {/* Right: Sort controls */}
            <div className="flex items-center gap-3 shrink-0">
                <Select
                    className="w-48 lg:w-56"
                    placeholder="Ordenar por..."
                    value={sortField || null}
                    onChange={(val) => {
                        if (val) setSortField(val);
                    }}
                    disallowEmptySelection
                >
                    <Label className="sr-only">Ordenar</Label>
                    <Select.Trigger className="h-12 w-full bg-surface-input border border-border-subtle hover:border-border-strong text-text-main rounded-2xl px-4 flex items-center justify-between transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary">
                        <Select.Value className="text-sm font-medium text-text-main truncate" />
                        <Select.Indicator className="text-text-muted shrink-0" />
                    </Select.Trigger>
                    <Select.Popover className="bg-surface-elevated text-text-main border border-border-subtle rounded-2xl p-1 shadow-xl">
                        <ListBox className="bg-surface-elevated text-text-main rounded-xl p-1">
                            <ListBox.Item id="contador_likes" key="contador_likes" textValue="Popularidad" className="hover:bg-surface-muted text-text-main rounded-xl px-3 py-2.5 cursor-pointer text-sm font-medium">Popularidad</ListBox.Item>
                            <ListBox.Item id="dificultad" key="dificultad" textValue="Dificultad" className="hover:bg-surface-muted text-text-main rounded-xl px-3 py-2.5 cursor-pointer text-sm font-medium">Dificultad</ListBox.Item>
                        </ListBox>
                    </Select.Popover>
                </Select>

                <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="h-12 w-12 flex items-center justify-center bg-surface-input border border-border-subtle rounded-2xl hover:bg-surface-muted transition-colors text-text-muted shadow-sm"
                    title={sortOrder === "asc" ? "Orden Ascendente" : "Orden Descendente"}
                    aria-label={sortOrder === "asc" ? "Cambiar a orden descendente" : "Cambiar a orden ascendente"}
                >
                    <svg
                        className={`w-5 h-5 transition-transform duration-300 ${sortOrder === "desc" ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                </button>

                {!hideFavoritesToggle && (
                    <button
                        onClick={() => setFilterSaved(!filterSaved)}
                        className={`h-12 w-12 flex items-center justify-center border rounded-2xl transition-all shadow-sm ${filterSaved ? 'bg-brand-subtle border-brand-primary text-brand-primary shadow-brand-primary/20' : 'bg-surface-input border-border-subtle text-text-subtle hover:text-text-main hover:bg-surface-muted'}`}
                        title={filterSaved ? "Mostrar Todas" : "Mis Favoritos"}
                        aria-label={filterSaved ? "Mostrar todas las recetas" : "Filtrar por mis recetas favoritas"}
                    >
                        <svg className={`w-5 h-5 ${filterSaved ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                )}

                {/* Acceso a Calculadora de Macros */}
                <a
                    href="/calculadora"
                    className="h-12 px-3.5 sm:px-4 flex items-center gap-2 bg-surface-input border border-border-subtle hover:border-brand-primary/50 hover:bg-surface-muted text-text-main rounded-2xl transition-all shadow-sm font-semibold text-sm group shrink-0"
                    title="Calculadora de Macronutrientes y Porciones"
                    aria-label="Ir a la Calculadora de Macronutrientes"
                >
                    <svg className="w-5 h-5 text-brand-primary transition-transform group-hover:scale-110 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="8" y1="6" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="14" x2="16" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="hidden sm:inline">Calculadora</span>
                </a>
            </div>
        </div>
    );
}
