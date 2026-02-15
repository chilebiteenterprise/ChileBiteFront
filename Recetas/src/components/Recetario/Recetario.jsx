import { useState, useMemo, useEffect } from "react";
import Filtros from "./Filtros";
import RecetaCard from "./RecetaCard";

const Recetario = () => {
    // === LÓGICA DE ADMINISTRADOR: ESTADOS INICIALES ===
    const [usuario, setUsuario] = useState(null);
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
    const [showFilters, setShowFilters] = useState(false);
    const perPage = 12;

    // === LÓGICA DE ADMINISTRADOR: EFECTOS ===

    useEffect(() => {
        try {
            const userJson = localStorage.getItem('user');
            if (userJson) {
                const userData = JSON.parse(userJson);
                setUsuario(userData);
            }
        } catch (e) {
            console.error("Error al leer/parsear el usuario de localStorage:", e);
            setUsuario(null);
        }
    }, []);

    const usuarioEsAdmin = usuario && usuario.rol === 'admin';

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

    useEffect(() => {
        const handleClickOutside = (e) => {
            const drawer = document.getElementById("drawer-filtros");
            const button = document.getElementById("drawer-btn");
            if (
                showFilters &&
                drawer &&
                !drawer.contains(e.target) &&
                button &&
                !button.contains(e.target)
            ) {
                setShowFilters(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showFilters]);


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
        <div className="flex flex-col lg:flex-row gap-6 relative min-h-[calc(100vh-4rem)]">
            {/* ======================================================== */}
            <button
                id="drawer-btn"
                className="lg:hidden fixed top-1/2 left-0 z-50 bg-[#A0522D] text-white p-2 rounded-tr-lg rounded-br-lg
                            transform -translate-x-3 hover:-translate-x-0 transition-all duration-300 ease-in-out
                            flex items-center justify-center gap-1"
                onClick={() => setShowFilters(!showFilters)}>
                {showFilters ? "◀" : "▶"} Filtros
            </button>

            <aside
                id="drawer-filtros"
                className={`bg-gray-50 p-4 shadow-md rounded-xl
                            fixed top-0 left-0 z-40 w-[300px] h-screen transform ${
                                showFilters ? "translate-x-0" : "-translate-x-full"
                            } transition-transform duration-300 ease-in-out
                            lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:flex-shrink-0`}>
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
            </aside>

            <main className="flex-1 overflow-y-auto max-h-[200vh] px-4">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    
                    <div className="flex items-center flex-1 justify-center lg:justify-start gap-4">
                        <h1 className="text-3xl font-bold text-center text-indigo-800 tracking-wide">
                            Recetario
                        </h1>
                        
                        {/* === ETIQUETA VISUAL DE ADMINISTRADOR === */}
                        {usuarioEsAdmin && (
                            <span className="px-3 py-1 text-sm font-bold text-white bg-red-600 rounded-full shadow-md whitespace-nowrap">
                                ADMINISTRADOR
                            </span>
                        )}
                    </div>
                    
                    {/* === BOTÓN DE CREAR RECETA SOLO PARA ADMINS === */}
                    {usuarioEsAdmin && (
                        <button
                            onClick={() => {
                                window.location.href = '/admin/receta-form'; 
                            }}
                            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 transition-colors duration-300 flex-shrink-0 w-full lg:w-auto"
                            >
                                + Nueva Receta 👨‍🍳
                            </button>
                    )}
                    {/* ======================================================== */}

                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Buscar receta..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input w-full rounded-full px-10 py-3 border-2 border-transparent focus:outline-none focus:border-blue-500 placeholder-gray-400 transition-all duration-300 shadow-md"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full flex-wrap">
                        <span className="text-sm text-gray-700">Ordenar por:</span>
                        <select
                            className="input rounded-full px-4 py-2 border-2 border-transparent focus:outline-none focus:border-blue-500 transition-all duration-300 shadow-md appearance-none"
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value)}>
                            <option value="">Elija orden</option>
                            <option value="contador_likes">Popularidad</option>
                            <option value="dificultad">Dificultad</option>
                            <option value="numero_porcion">Porciones</option>
                        </select>
                        <button
                            className="px-4 py-2 border-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
                            onClick={() =>
                                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                            }>
                            ↑↓
                        </button>
                    </div>
                </div>

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
                    <div className="mt-2 flex justify-center gap-2 flex-wrap mb-4">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                            <button
                                key={num}
                                className={`px-3 py-1 border rounded ${
                                    num === currentPage
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-200 text-gray-800"
                                }`}
                                onClick={() => setCurrentPage(num)}>
                                {num}
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Recetario;