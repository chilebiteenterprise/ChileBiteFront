import { useState, useMemo, useEffect } from "react";
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import RecipeFilters from "./RecipeFilters";
import RecipeCard from "./RecipeCard";
import RecipeToolbar from "./RecipeToolbar";
import AdminFloatingMenu from "./AdminFloatingMenu";
import { Toast } from "@heroui/react";

const RecetarioContent = () => {
    const { profile } = useAuth();
    // === LÓGICA DE ADMINISTRADOR: ESTADOS INICIALES ===
    const [recipes, setRecipes] = useState([]); 
    const [loading, setLoading] = useState(true);

    const [selectedRecipes, setSelectedRecipes] = useState([]);

    const handleToggleSelect = (id) => {
        setSelectedRecipes((prev) => 
            prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
        );
    };

    const handleClearSelection = () => setSelectedRecipes([]);

    const [error, setError] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedPortions, setSelectedPortions] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    // Reiniciar paginación al filtrar o ordenar
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategories, selectedPortions, selectedCountry, selectedDifficulty, searchQuery, sortField, sortOrder]);

    // === LÓGICA DE ADMINISTRADOR: EFECTOS ===

    const usuarioEsAdmin = profile?.role === 'admin' || profile?.rol === 'admin';

    // === LÓGICA DE ELIMINACIÓN: FUNCIÓN DE CALLBACK ===
    const handleRecipeDelete = (deletedIds) => {
        const idsArray = Array.isArray(deletedIds) ? deletedIds : [deletedIds];
        setRecipes(prevRecipes => prevRecipes.filter(r => !idsArray.includes(r.id)));
        handleClearSelection();
    };
    // =================================================

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://127.0.0.1:8000/api/recetas/");
                if (!res.ok) throw new Error("Error al obtener recetas");
                const data = await res.json();
                setRecipes(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);
    
    // ---------------------------------------------------------------------------------------------------
    // función dificultadToNivel...
    const dificultadToNivel = (dificultad) => {
        switch (dificultad) {
            case "Muy Fácil": return 1;
            case "Fácil": return 2;
            case "Media": return 3;
            case "Difícil": return 4;
            case "Muy Difícil": return 5;
            default: return 3;
        }
    };
    
    // función resetFilters ...
    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedPortions([]);
        setSelectedCountry("");
        setSelectedDifficulty(0);
        setSearchQuery("");
        setSortField("");
        setSortOrder("asc");
        setCurrentPage(1);
    };

    // useMemo filteredRecipes aquí...
    const filteredRecipes = useMemo(() => {
        let result = [...recipes];

        if (selectedCategories.length > 0) {
            result = result.filter((r) => {
                const isTipoPlato = selectedCategories.includes(r.tipo_plato_detalle?.nombre);
                const isEstiloVida = r.estilos_vida_detalle?.some(estilo => selectedCategories.includes(estilo.nombre));
                return isTipoPlato || isEstiloVida;
            });
        }

        if (selectedPortions.length > 0)
            result = result.filter((r) =>
                selectedPortions.includes(String(r.numero_porcion))
            );

        if (selectedCountry)
            result = result.filter((r) => r.pais_detalle?.nombre === selectedCountry);

        if (selectedDifficulty > 0)
            result = result.filter(
                (r) => dificultadToNivel(r.dificultad) <= selectedDifficulty
            );

        if (searchQuery.trim() !== "")
            result = result.filter((r) =>
                r.nombre.toLowerCase().includes(searchQuery.toLowerCase())
            );

        if (sortField) {
            console.log("Sorting activated. Field:", sortField, "Order:", sortOrder, "First item:", result[0]?.nombre, result[0]?.[sortField]);
            result.sort((a, b) => {
                const aValue =
                    sortField === "dificultad"
                        ? dificultadToNivel(a.dificultad)
                        : Number(a[sortField]) || 0;
                const bValue =
                    sortField === "dificultad"
                        ? dificultadToNivel(b.dificultad)
                        : Number(b[sortField]) || 0;

                return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            });
            console.log("Sorted result. First item now:", result[0]?.nombre, result[0]?.[sortField]);
        }

        return result;
    }, [
        recipes,
        selectedCategories,
        selectedPortions,
        selectedCountry,
        selectedDifficulty,
        searchQuery,
        sortField,
        sortOrder,
    ]);
    // ---------------------------------------------------------------------------------------------------


    const totalPages = Math.ceil(filteredRecipes.length / perPage);
    const paginatedRecipes = filteredRecipes.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    const getPaginationGroup = () => {
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 3 && totalPages >= 5) {
            end = 5;
        }
        if (currentPage >= totalPages - 2 && totalPages >= 5) {
            start = totalPages - 4;
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-600">
                Cargando recetas...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-600 font-semibold">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="flex flex-row gap-4 lg:gap-6 relative min-h-[calc(100vh-4rem)]">
            {/* ======================================================== */}
            
            <RecipeFilters
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedPortions={selectedPortions}
                setSelectedPortions={setSelectedPortions}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                selectedDifficulty={selectedDifficulty}
                setSelectedDifficulty={setSelectedDifficulty}
                resetFilters={resetFilters}
            />

            <main className="flex-1 overflow-y-auto px-4 lg:px-6 relative min-h-0 pb-6 rounded-l-2xl">
                <RecipeToolbar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortField={sortField}
                    setSortField={setSortField}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                />

                {/* Grid de recetas */}
                {paginatedRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                        {paginatedRecipes.map((r) => (
                            <div key={r.id} className="receta-card-wrapper">
                                {/* PASAR LA FUNCIÓN DE CALLBACK PARA ELIMINACIÓN */}
                                <RecipeCard 
                                    receta={r} 
                                    usuarioEsAdmin={usuarioEsAdmin} 
                                    isSelected={selectedRecipes.includes(r.id)}
                                    onToggleSelect={handleToggleSelect}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-700 font-semibold py-20">
                        No se encontraron recetas.
                    </div>
                )}

                {/* Paginación Moderna */}
                {totalPages > 1 && (
                    <div className="mt-10 flex justify-center items-center gap-2 mb-8 select-none">
                        {/* Prev Button */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-[#b08969] hover:border-[#b08969]/50 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        {/* First Page + Ellipsis */}
                        {getPaginationGroup()[0] > 1 && (
                            <>
                                <button onClick={() => setCurrentPage(1)} className="size-10 rounded-xl bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:text-[#b08969] hover:border-[#b08969]/50 transition-all">1</button>
                                {getPaginationGroup()[0] > 2 && <span className="text-slate-400 font-bold tracking-widest px-1">...</span>}
                            </>
                        )}

                        {/* Dynamic Pages */}
                        {getPaginationGroup().map(num => (
                            <button
                                key={num}
                                onClick={() => setCurrentPage(num)}
                                className={`size-10 rounded-xl font-bold transition-all shadow-sm ${num === currentPage ? 'bg-[#b08969] text-white border-transparent scale-110 shadow-md shadow-[#b08969]/30' : 'bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#b08969] hover:border-[#b08969]/50'}`}
                            >
                                {num}
                            </button>
                        ))}

                        {/* Last Page + Ellipsis */}
                        {getPaginationGroup()[getPaginationGroup().length - 1] < totalPages && (
                            <>
                                {getPaginationGroup()[getPaginationGroup().length - 1] < totalPages - 1 && <span className="text-slate-400 font-bold tracking-widest px-1">...</span>}
                                <button onClick={() => setCurrentPage(totalPages)} className="size-10 rounded-xl bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:text-[#b08969] hover:border-[#b08969]/50 transition-all">{totalPages}</button>
                            </>
                        )}

                        {/* Next Button */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-[#b08969] hover:border-[#b08969]/50 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}
                
                {/* ADMIN DOCK */}
                {usuarioEsAdmin && (
                    <AdminFloatingMenu 
                        selectedRecipes={selectedRecipes}
                        onDeleteSuccess={handleRecipeDelete}
                        onClearSelection={handleClearSelection}
                    />
                )}
            </main>
        </div>
    );
};

export default function RecipeGrid() {
    return (
        <AuthProvider>
            <RecetarioContent />
        </AuthProvider>
    );
}