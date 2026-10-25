import { useState, useMemo, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import RecipeFilters from "./RecipeFilters";
import RecipeCard from "./RecipeCard";
import RecipeSkeleton from "./RecipeSkeleton";
import RecipeToolbar from "./RecipeToolbar";
import AdminFloatingMenu from "./AdminFloatingMenu";
import { supabase } from "../../../lib/supabaseClient";
import { buildUserProfile, rankRecipesForYou, getLocalViewHistory, getLocalDwellTimes } from "../services/recommendationEngine";

const RecetarioContent = ({ collectionId, collectionTitle }) => {
    const { profile, user } = useAuth();
    // === LÓGICA DE ADMINISTRADOR: ESTADOS INICIALES ===
    const [recipes, setRecipes] = useState([]); 
    const [loading, setLoading] = useState(true);

    const [filterSaved, setFilterSaved] = useState(false);
    const [savedRecipeIds, setSavedRecipeIds] = useState(new Set());
    const [likedRecipeIds, setLikedRecipeIds] = useState(new Set());

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
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    // Reiniciar paginación al filtrar o ordenar
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategories, selectedPortions, selectedCountry, selectedDifficulty, searchQuery, sortField, sortOrder, filterSaved]);

    useEffect(() => {
        if (!user?.id) {
             setSavedRecipeIds(new Set());
             setLikedRecipeIds(new Set());
             return;
        }
        const fetchUserInteractions = async () => {
             // 1. Colecciones guardadas
             const { data: cols } = await supabase.from('core_coleccion').select('id').eq('user_id', user.id);
             if (cols && cols.length > 0) {
                 const { data: recs } = await supabase.from('core_coleccion_receta').select('receta_id').in('coleccion_id', cols.map(c => c.id));
                 if (recs) setSavedRecipeIds(new Set(recs.map(r => r.receta_id)));
             }
             // 2. Likes del usuario para personalización escalable
             const { data: likes } = await supabase.from('core_recetalike').select('receta_id').eq('user_id', user.id);
             if (likes) {
                 setLikedRecipeIds(new Set(likes.map(l => l.receta_id)));
             }
        };
        fetchUserInteractions();
    }, [user?.id]);

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
                const { data, error } = await supabase
                    .from('core_receta')
                    .select(`
                        id, 
                        nombre, 
                        imagen_url, 
                        descripcion_corta, 
                        descripcion_larga, 
                        tiempo_preparacion, 
                        numero_porcion, 
                        dificultad, 
                        total_calorias, 
                        total_proteinas, 
                        total_carbohidratos, 
                        total_grasas, 
                        contador_likes,
                        fecha_creacion,
                        user_id,
                        pais_id,
                        core_tipoplato:tipo_plato_id ( nombre ),
                        core_pais:pais_id ( nombre ),
                        core_receta_estilos_vida ( core_estilovida ( nombre ) )
                    `);

                if (error) throw new Error(error.message);

                let filteredData = data;
                
                // Si estamos en modo Colección, filtramos las recetas usando core_coleccion_receta
                if (collectionId) {
                    const { data: cols } = await supabase
                        .from('core_coleccion_receta')
                        .select('receta_id')
                        .eq('coleccion_id', collectionId);
                        
                    if (!cols || cols.length === 0) {
                        setRecipes([]);
                        setLoading(false);
                        return;
                    }
                    const validIds = new Set(cols.map(c => c.receta_id));
                    filteredData = filteredData.filter(r => validIds.has(r.id) || validIds.has(Number(r.id)));
                }

                // Enrich with profiles
                const userIds = [...new Set(filteredData.map(r => r.user_id))].filter(Boolean);
                let profilesMap = {};
                if (userIds.length > 0) {
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, username')
                        .in('id', userIds);
                    if (profilesData) {
                        profilesData.forEach(p => { profilesMap[p.id] = p; });
                    }
                }
                
                // OBTENER CONTEO REAL DE LIKES PARA SALVAR EL CONTADOR ROTO DE LA BD
                let likesMap = {};
                const { data: likesData } = await supabase.from('core_recetalike').select('receta_id');
                if (likesData) {
                    likesData.forEach(l => {
                        likesMap[l.receta_id] = (likesMap[l.receta_id] || 0) + 1;
                    });
                }
                
                const formattedRecipes = filteredData.map(r => {
                    const profile = profilesMap[r.user_id] || {};
                    const trueLikes = likesMap[r.id] || 0;
                    
                    return {
                        ...r,
                        contador_likes: trueLikes, // OVERRIDE BROKEN DB COLUMN
                        portada: r.imagen_url,
                        descripcion: r.descripcion_larga,
                        descripcion_corta: r.descripcion_corta || r.descripcion_larga || '',
                        tiempo_coccion: 0,
                        porciones: r.numero_porcion,
                        calorias: r.total_calorias,
                        proteinas: r.total_proteinas,
                        carbohidratos: r.total_carbohidratos,
                        grasas: r.total_grasas,
                        vistas: 0,
                        likes: trueLikes,
                        creado_en: r.fecha_creacion,
                        pais_nombre: r.core_pais?.nombre || '',
                        tipo_plato_detalle: r.core_tipoplato ? { nombre: r.core_tipoplato.nombre } : null,
                        estilos_vida_detalle: r.core_receta_estilos_vida ? r.core_receta_estilos_vida.map(e => ({ nombre: e.core_estilovida?.nombre })) : [],
                        usuario_nombre: profile.username || 'Chef'
                    };
                });
                
                setRecipes(formattedRecipes);
            } catch (err) {
                console.error(err);
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
    
    // Memo del perfil de afinidad del usuario (Calculado en O(K) de forma pura y escalable)
    const userProfile = useMemo(() => {
        const viewedIds = getLocalViewHistory();
        const dwellTimes = getLocalDwellTimes();
        return buildUserProfile({
            likedRecipeIds,
            savedRecipeIds,
            viewedRecipeIds: viewedIds,
            dwellTimes,
            recipesCatalog: recipes
        });
    }, [likedRecipeIds, savedRecipeIds, recipes]);

    // función resetFilters ...
    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedPortions([]);
        setSelectedCountry("");
        setSelectedDifficulty(0);
        setSearchQuery("");
        setSortField("");
        setSortOrder("desc");
        setCurrentPage(1);
    };

    // useMemo filteredRecipes aquí...
    const filteredRecipes = useMemo(() => {
        let result = [...recipes];

        // Filtro Mis Favoritas
        if (filterSaved) {
            result = result.filter(r => savedRecipeIds.has(r.id) || savedRecipeIds.has(Number(r.id)));
        }

        // Filtro por Tipo de Plato y/o Estilo de Vida
        if (selectedCategories.length > 0) {
            result = result.filter((r) => {
                const isTipoPlato = selectedCategories.includes(r.tipo_plato_detalle?.nombre);
                const isEstiloVida = r.estilos_vida_detalle?.some(estilo => selectedCategories.includes(estilo.nombre));
                return isTipoPlato || isEstiloVida;
            });
        }

        // Filtro por País
        if (selectedCountry) {
            result = result.filter((r) => r.pais_nombre === selectedCountry);
        }

        // Filtro por Dificultad
        if (selectedDifficulty > 0) {
            result = result.filter((r) => dificultadToNivel(r.dificultad) <= selectedDifficulty);
        }

        // Filtro por búsqueda de texto
        if (searchQuery.trim() !== "")
            result = result.filter((r) =>
                r.nombre.toLowerCase().includes(searchQuery.toLowerCase())
            );

        // Algoritmo de Ordenamiento
        if (!sortField) {
            // Por defecto: Algoritmo Para Ti (Recomendaciones inteligentes de forma natural)
            result = rankRecipesForYou(result, userProfile);
            if (sortOrder === "asc") {
                result = [...result].reverse();
            }
        } else if (sortField === "creado_en" || sortField === "fecha_creacion") {
            result.sort((a, b) => {
                const dateA = new Date(a.creado_en || a.fecha_creacion || 0).getTime();
                const dateB = new Date(b.creado_en || b.fecha_creacion || 0).getTime();
                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            });
        } else if (sortField) {
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
        filterSaved,
        savedRecipeIds,
        userProfile
    ]);
    // ---------------------------------------------------------------------------------------------------


    const totalPages = Math.ceil(filteredRecipes.length / perPage);
    const paginatedRecipes = filteredRecipes.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    // Pre-fetching silencioso de imágenes de la siguiente página (Paginación instantánea)
    useEffect(() => {
        if (currentPage >= totalPages) return;
        const nextStart = currentPage * perPage;
        const nextPageRecipes = filteredRecipes.slice(nextStart, nextStart + perPage);

        nextPageRecipes.forEach((r) => {
            const imgUrl = r.portada || r.imagen_url;
            if (imgUrl && typeof window !== 'undefined') {
                const img = new Image();
                img.src = imgUrl;
            }
        });
    }, [currentPage, totalPages, filteredRecipes]);

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

            <section className="flex-1 px-4 lg:px-6 relative min-h-0 pb-6 rounded-l-2xl">
                {collectionTitle && (
                    <div className="mb-6 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#202026] border border-border-subtle dark:border-zinc-800 shadow-sm transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 dark:bg-[#f0a262]/15 text-brand-primary dark:text-[#f0a262] flex items-center justify-center shrink-0 shadow-inner">
                                    <Bookmark className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="inline-block text-[11px] font-black uppercase tracking-[0.2em] text-text-muted/80 dark:text-zinc-400">
                                        Colección de Recetas
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-black text-text-main dark:text-zinc-100 tracking-tight">
                                        {collectionTitle.replace("Tus Recetas de: ", "")}
                                    </h1>
                                    <p className="text-xs sm:text-sm text-text-muted dark:text-zinc-400 mt-0.5">
                                        Explorando tus recetas guardadas en esta colección
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-center">
                                <span className="px-4 py-2 rounded-2xl text-xs font-extrabold bg-surface-muted/60 dark:bg-[#18181d] text-text-main dark:text-zinc-200 border border-border-subtle dark:border-zinc-700/80 shadow-2xs">
                                    {filteredRecipes.length} {filteredRecipes.length === 1 ? "receta" : "recetas"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <RecipeToolbar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortField={sortField}
                    setSortField={setSortField}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    allRecipeNames={recipes.map(r => r.nombre)}
                    filterSaved={filterSaved}
                    setFilterSaved={setFilterSaved}
                    hideFavoritesToggle={!!collectionId}
                />

                {/* Grid de recetas */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 mt-4">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-full flex flex-col min-h-[440px]">
                                <RecipeSkeleton />
                            </div>
                        ))}
                    </div>
                ) : paginatedRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6 mt-4">
                        {paginatedRecipes.map((r, i) => (
                            <div key={r.id} className="h-full flex flex-col min-h-[440px]">
                                {/* PASAR LA FUNCIÓN DE CALLBACK PARA ELIMINACIÓN */}
                                <RecipeCard 
                                    receta={r} 
                                    index={i}
                                    usuarioEsAdmin={usuarioEsAdmin} 
                                    isSelected={selectedRecipes.includes(r.id)}
                                    onToggleSelect={handleToggleSelect}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-text-muted font-semibold py-20">
                        No se encontraron recetas.
                    </div>
                )}

                {/* Paginación Minimalista Editorial */}
                {!loading && totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-1 sm:gap-2 mb-10 select-none">
                        {/* Prev Button */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-brand-primary dark:hover:text-[#f0a262] hover:bg-brand-primary/15 dark:hover:bg-brand-primary/20 transition-all disabled:opacity-30 disabled:pointer-events-none group cursor-pointer"
                            aria-label="Página anterior"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition-transform group-hover:-translate-x-0.5 text-brand-primary dark:text-[#f0a262]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Anterior</span>
                        </button>

                        {/* First Page + Ellipsis */}
                        {getPaginationGroup()[0] > 1 && (
                            <>
                                <button 
                                    onClick={() => setCurrentPage(1)} 
                                    aria-label="Ir a la página 1"
                                    className="size-9 sm:size-10 flex items-center justify-center rounded-full text-zinc-700 dark:text-zinc-300 hover:text-brand-primary dark:hover:text-[#f0a262] hover:bg-brand-primary/15 dark:hover:bg-brand-primary/20 hover:scale-110 active:scale-95 font-semibold text-sm transition-all duration-200 cursor-pointer"
                                >
                                    1
                                </button>
                                {getPaginationGroup()[0] > 2 && <span className="text-zinc-400 dark:text-zinc-500 font-medium px-1">…</span>}
                            </>
                        )}

                        {/* Dynamic Pages */}
                        {getPaginationGroup().map(num => {
                            const isCurrent = num === currentPage;
                            return (
                                <button
                                    key={num}
                                    onClick={() => setCurrentPage(num)}
                                    aria-label={`Ir a la página ${num}`}
                                    className={`size-9 sm:size-10 flex items-center justify-center rounded-full text-sm transition-all duration-200 cursor-pointer ${
                                        isCurrent 
                                            ? 'bg-brand-primary text-white font-bold shadow-md shadow-brand-primary/30 ring-2 ring-brand-primary/40 scale-105' 
                                            : 'text-zinc-700 dark:text-zinc-300 hover:text-brand-primary dark:hover:text-[#f0a262] hover:bg-brand-primary/15 dark:hover:bg-brand-primary/20 hover:scale-110 active:scale-95 font-semibold'
                                    }`}
                                    aria-current={isCurrent ? "page" : undefined}
                                >
                                    {num}
                                </button>
                            );
                        })}

                        {/* Last Page + Ellipsis */}
                        {getPaginationGroup()[getPaginationGroup().length - 1] < totalPages && (
                            <>
                                {getPaginationGroup()[getPaginationGroup().length - 1] < totalPages - 1 && <span className="text-zinc-400 dark:text-zinc-500 font-medium px-1">…</span>}
                                <button 
                                    onClick={() => setCurrentPage(totalPages)} 
                                    aria-label={`Ir a la página ${totalPages}`}
                                    className="size-9 sm:size-10 flex items-center justify-center rounded-full text-zinc-700 dark:text-zinc-300 hover:text-brand-primary dark:hover:text-[#f0a262] hover:bg-brand-primary/15 dark:hover:bg-brand-primary/20 hover:scale-110 active:scale-95 font-semibold text-sm transition-all duration-200 cursor-pointer"
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}

                        {/* Next Button */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-brand-primary dark:hover:text-[#f0a262] hover:bg-brand-primary/15 dark:hover:bg-brand-primary/20 transition-all disabled:opacity-30 disabled:pointer-events-none group cursor-pointer"
                            aria-label="Página siguiente"
                        >
                            <span className="hidden sm:inline">Siguiente</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition-transform group-hover:translate-x-0.5 text-brand-primary dark:text-[#f0a262]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
                
                {/* ADMIN DOCK - Solo mostrar en el recetario global, no en colecciones */}
                {usuarioEsAdmin && !collectionId && (
                    <AdminFloatingMenu 
                        selectedRecipes={selectedRecipes}
                        onDeleteSuccess={handleRecipeDelete}
                        onClearSelection={handleClearSelection}
                    />
                )}
            </section>
        </div>
    );
};

export default function RecipeGrid({ collectionId, collectionTitle }) {
    return (
        <AuthProvider>
            <RecetarioContent collectionId={collectionId} collectionTitle={collectionTitle} />
        </AuthProvider>
    );
}