import { useState, useMemo, useEffect } from "react";
import { useAuth, AuthProvider } from "../../context/AuthContext";
import Filtros from "./Filtros";
import RecetaCard from "./RecetaCard";
import RecetarioToolBar from "./RecetarioToolBar";
import AdminFloatingMenu from "./Botones/AdminFloatingMenu";

const RecetarioContent = () => {
    const { profile } = useAuth();
    // === LÓGICA DE ADMINISTRADOR: ESTADOS INICIALES ===
    const [recipes, setRecipes] = useState([]); 
    const [loading, setLoading] = useState(true);

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

    // === LÓGICA DE ADMINISTRADOR: EFECTOS ===

    const usuarioEsAdmin = profile?.role === 'admin' || profile?.rol === 'admin';

    // === LÓGICA DE ELIMINACIÓN: FUNCIÓN DE CALLBACK ===
    // Esta función recibe el ID de la receta eliminada de RecetaCard y actualiza el estado
    const handleRecipeDelete = (deletedId) => {
        setRecipes(prevRecipes => prevRecipes.filter(r => r.id_receta !== deletedId));
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

        if (selectedCategories.length > 0)
            result = result.filter((r) => selectedCategories.includes(r.categoria));

        if (selectedPortions.length > 0)
            result = result.filter((r) =>
                selectedPortions.includes(String(r.numero_porcion))
            );

        if (selectedCountry)
            result = result.filter((r) => r.pais === selectedCountry);

        if (selectedDifficulty > 0)
            result = result.filter(
                (r) => dificultadToNivel(r.dificultad) <= selectedDifficulty
            );

        if (searchQuery.trim() !== "")
            result = result.filter((r) =>
                r.nombre.toLowerCase().includes(searchQuery.toLowerCase())
            );

        if (sortField) {
            result.sort((a, b) => {
                const aValue =
                    sortField === "dificultad"
                        ? dificultadToNivel(a.dificultad)
                        : a[sortField];
                const bValue =
                    sortField === "dificultad"
                        ? dificultadToNivel(b.dificultad)
                        : b[sortField];

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
    ]);
    // ---------------------------------------------------------------------------------------------------


    const totalPages = Math.ceil(filteredRecipes.length / perPage);
    const paginatedRecipes = filteredRecipes.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );


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
            
            <Filtros
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
                <RecetarioToolBar 
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
                            <div key={r.id_receta} className="receta-card-wrapper">
                                {/* PASAR LA FUNCIÓN DE CALLBACK PARA ELIMINACIÓN */}
                                <RecetaCard 
                                    receta={r} 
                                    usuarioEsAdmin={usuarioEsAdmin} 
                                    onDeleteSuccess={handleRecipeDelete}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-700 font-semibold py-20">
                        No se encontraron recetas.
                    </div>
                )}

                {/* Paginación */}
                {paginatedRecipes.length > 0 && (
                    <div className="mt-6 flex justify-center gap-2 flex-wrap mb-4">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                            <button
                                key={num}
                                className={`px-4 py-2 border rounded-xl font-medium transition-colors ${
                                    num === currentPage
                                        ? "bg-[#A0522D] text-white border-transparent"
                                        : "bg-white dark:bg-[#0f1115] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                }`}
                                onClick={() => setCurrentPage(num)}>
                                {num}
                            </button>
                        ))}
                    </div>
                )}
                
                {/* ADMIN DOCK */}
                {usuarioEsAdmin && <AdminFloatingMenu />}
            </main>
        </div>
    );
};

export default function Recetario() {
    return (
        <AuthProvider>
            <RecetarioContent />
        </AuthProvider>
    );
}