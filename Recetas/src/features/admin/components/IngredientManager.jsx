import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const categoryStyles = {
    'vegetal': { icon: 'eco', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    'verdur': { icon: 'eco', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    'fruta': { icon: 'eco', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    'carne': { icon: 'kebab_dining', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
    'pollo': { icon: 'kebab_dining', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
    'lacteo': { icon: 'water_drop', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    'lácteo': { icon: 'water_drop', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    'queso': { icon: 'water_drop', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
    'leche': { icon: 'water_drop', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    'cereal': { icon: 'bakery_dining', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    'grano': { icon: 'grain', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    'pasta': { icon: 'restaurant', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    'pan': { icon: 'bakery_dining', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    'grasa': { icon: 'opacity', bg: 'bg-yellow-200 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-500' },
    'aceite': { icon: 'opacity', bg: 'bg-yellow-200 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-500' },
    'pescado': { icon: 'set_meal', bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
    'marisco': { icon: 'set_meal', bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
    'especia': { icon: 'local_dining', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500 dark:text-red-300' },
    'condimento': { icon: 'local_dining', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500 dark:text-red-300' }
};

const getCategoryStyle = (cat) => {
    if (!cat) return { icon: 'kitchen', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
    const lowered = cat.toLowerCase();
    for (const key in categoryStyles) {
        if (lowered.includes(key)) return categoryStyles[key];
    }
    const colors = [
        { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
        { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
        { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
        { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' }
    ];
    const hash = colors[(lowered.charCodeAt(0) || 0) % colors.length];
    return { icon: 'shopping_basket', ...hash };
};


function IngredientesAdminContent() {
    const { session, profile, loading } = useAuth();
    const [ingredientes, setIngredientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [formData, setFormData] = useState({ 
        id: null, 
        nombre: '', 
        categoria: '',
        calorias_por_100g: 0,
        proteinas_por_100g: 0,
        grasas_por_100g: 0,
        carbohidratos_por_100g: 0,
        fibra_por_100g: 0,
        azucares_por_100g: 0,
        sodio_mg_por_100g: 0,
        peso_por_unidad_gramos: '',
        peso_por_taza_gramos: '',
        peso_por_cucharada_gramos: '',
        es_vegano: false,
        es_libre_de_gluten: false
    });

    useEffect(() => {
        if (!loading && profile) {
            if (profile.role !== 'admin' && profile.rol !== 'admin') window.location.href = '/';
        } else if (!loading && !session) {
            window.location.href = '/auth/login';
        }
        fetchData();
    }, [profile, session, loading]);

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('core_ingrediente')
                .select('id, nombre, categoria, calorias_por_100g, proteinas_por_100g, grasas_por_100g, carbohidratos_por_100g, fibra_por_100g, azucares_por_100g, sodio_mg_por_100g, peso_por_unidad_gramos, peso_por_taza_gramos, peso_por_cucharada_gramos, es_vegano, es_libre_de_gluten')
                .order('nombre')
                .limit(2000);
            if (error) throw error;
            setIngredientes(data || []);
        } catch (error) {
            console.error("Error al cargar ingredientes", error);
        }
    };

    const handleSave = async () => {
        if (!formData.nombre.trim()) return;
        const payload = { ...formData };
        delete payload.id; // Don't include id in upsert payload key
        try {
            if (formData.id) {
                const { error } = await supabase.from('core_ingrediente').update(payload).eq('id', formData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('core_ingrediente').insert(payload);
                if (error) throw error;
            }
            fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error guardando ingrediente", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este ingrediente?')) return;
        try {
            const { error } = await supabase.from('core_ingrediente').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error("Error eliminando ingrediente", error);
        }
    };

    const openModal = (item = null, viewOnly = false) => {
        setIsViewMode(viewOnly);
        setFormData(item ? { ...item } : { 
            id: null, 
            nombre: '', 
            categoria: '',
            calorias_por_100g: 0,
            proteinas_por_100g: 0,
            grasas_por_100g: 0,
            carbohidratos_por_100g: 0,
            fibra_por_100g: 0,
            azucares_por_100g: 0,
            sodio_mg_por_100g: 0,
            peso_por_unidad_gramos: '',
            peso_por_taza_gramos: '',
            peso_por_cucharada_gramos: '',
            es_vegano: false,
            es_libre_de_gluten: false
        });
        setIsModalOpen(true);
    };

    const uniqueCategories = useMemo(() => {
        const cats = new Set(ingredientes.map(i => i.categoria).filter(Boolean));
        return Array.from(cats).sort((a, b) => a.localeCompare(b));
    }, [ingredientes]);

    const filteredAndSortedIngredientes = useMemo(() => {
        let result = ingredientes;
        
        if (selectedCategory) {
            result = result.filter(ing => ing.categoria === selectedCategory);
        }

        if (searchTerm) {
            result = result.filter(ing => ing.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (ing.categoria && ing.categoria.toLowerCase().includes(searchTerm.toLowerCase())));
        }

        result = [...result].sort((a, b) => {
            if (sortOrder === 'asc') return a.nombre.localeCompare(b.nombre);
            return b.nombre.localeCompare(a.nombre);
        });

        return result;
    }, [ingredientes, searchTerm, selectedCategory, sortOrder]);

    // Reset page to 1 on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, sortOrder]);

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredAndSortedIngredientes.length / itemsPerPage));
    const paginatedIngredientes = filteredAndSortedIngredientes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return <div className="p-10 text-center font-bold text-slate-600">Verificando sesión...</div>;

    return (
        <div className="max-w-[1240px] mx-auto w-full px-4 md:px-8 py-8 md:py-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => window.location.href="/recipes"} 
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#b08969] transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95">
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Ingredientes</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1">Panel Administrador - Base de Alimentos</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 gap-8 mb-8">
                <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    
                    {/* Toolbar */}
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative w-full max-w-sm">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Buscar por nombre o categoría..." 
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all text-slate-800 dark:text-slate-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="hidden sm:block px-4 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all text-slate-800 dark:text-slate-200"
                            >
                                <option value="">Ver Todas</option>
                                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <button 
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} 
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#b08969] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">sort_by_alpha</span>
                                <span className="hidden sm:inline">{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
                            </button>
                        </div>
                        <button onClick={() => openModal(null)} className="text-sm font-bold text-white px-5 py-2.5 rounded-xl bg-[#b08969] hover:bg-[#9c785c] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 shrink-0">
                            <span className="material-symbols-outlined text-[20px]">add</span> Nuevo Ingrediente
                        </button>
                    </div>

                    {/* Table Header Wrapper */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <div className="col-span-1"></div>
                        <div className="col-span-4">Nombre</div>
                        <div className="col-span-3">Categoría</div>
                        <div className="col-span-2 text-right">Kcal / 100g</div>
                        <div className="col-span-2 text-center">Acciones</div>
                    </div>

                    {/* Content List */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 min-h-[500px]">
                        {filteredAndSortedIngredientes.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                                <span className="material-symbols-outlined text-[48px] opacity-50">search_off</span>
                                <p>No se encontraron ingredientes.</p>
                            </div>
                        ) : paginatedIngredientes.map(item => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                <div className="col-span-1 flex justify-center hidden md:flex">
                                    {(() => {
                                        const style = getCategoryStyle(item.categoria);
                                        return (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}>
                                                <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="col-span-4 flex flex-col">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{item.nombre}</span>
                                </div>
                                <div className="col-span-3">
                                    {item.categoria ? (
                                        <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700">
                                            {item.categoria}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-xs italic">Sin categoría</span>
                                    )}
                                </div>
                                <div className="col-span-2 md:text-right font-medium text-[#b08969]">
                                    {item.calorias_por_100g !== undefined && item.calorias_por_100g !== null 
                                        ? `${item.calorias_por_100g} kcal` 
                                        : '-'}
                                </div>
                                <div className="col-span-2 flex justify-end md:justify-center gap-2">
                                    <button onClick={() => openModal(item, true)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all" title="Ver Detalles">
                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    </button>
                                    <button onClick={() => openModal(item, false)} className="p-2 text-slate-400 hover:text-[#b08969] hover:bg-[#b08969]/10 rounded-xl transition-all" title="Editar">
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all" title="Eliminar">
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/50">
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Mostrando página <span className="font-bold text-slate-700 dark:text-slate-200">{currentPage}</span> de <span className="font-bold text-slate-700 dark:text-slate-200">{totalPages}</span>
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Anterior
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* General Modal (Edit/View/Create) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform scale-100 transition-all my-8">
                        
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/30">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#b08969]/10 text-[#b08969] flex items-center justify-center">
                                    <span className="material-symbols-outlined">{isViewMode ? 'visibility' : formData.id ? 'edit_square' : 'add_box'}</span>
                                </div>
                                {isViewMode ? 'Detalle de Ingrediente' : formData.id ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nombre</label>
                                <input 
                                    type="text"
                                    autoFocus={!isViewMode}
                                    readOnly={isViewMode}
                                    className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`}
                                    placeholder="Ej. Cebolla blanca"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Categoría</label>
                                <input 
                                    list="categorias-list"
                                    type="text"
                                    readOnly={isViewMode}
                                    className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`}
                                    placeholder="Selecciona o escribe una categoría nueva..."
                                    value={formData.categoria || ''}
                                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                                />
                                <datalist id="categorias-list">
                                    {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </datalist>
                            </div>

                            {/* Macros/Nutrientes Principales */}
                            <div className="col-span-1 md:col-span-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-[#b08969]">nutrition</span> Nutrición por 100g
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Calorías (kcal)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-orange-400 text-[20px]">local_fire_department</span>
                                            <input type="number" readOnly={isViewMode} className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`} value={formData.calorias_por_100g || ''} onChange={(e) => setFormData({...formData, calorias_por_100g: parseFloat(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Proteínas (g)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-red-500 text-[20px]">fitness_center</span>
                                            <input type="number" readOnly={isViewMode} className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`} value={formData.proteinas_por_100g || ''} onChange={(e) => setFormData({...formData, proteinas_por_100g: parseFloat(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Grasas Totales (g)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-yellow-500 text-[20px]">water_drop</span>
                                            <input type="number" readOnly={isViewMode} className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`} value={formData.grasas_por_100g || ''} onChange={(e) => setFormData({...formData, grasas_por_100g: parseFloat(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Carbohidratos (g)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-blue-400 text-[20px]">grain</span>
                                            <input type="number" readOnly={isViewMode} className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`} value={formData.carbohidratos_por_100g || ''} onChange={(e) => setFormData({...formData, carbohidratos_por_100g: parseFloat(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Fibra (g)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-green-500 text-[20px]">grass</span>
                                            <input type="number" readOnly={isViewMode} className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`} value={formData.fibra_por_100g || ''} onChange={(e) => setFormData({...formData, fibra_por_100g: parseFloat(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Azúcares (g)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-pink-400 text-[20px]">icecream</span>
                                            <input type="number" readOnly={isViewMode} className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`} value={formData.azucares_por_100g || ''} onChange={(e) => setFormData({...formData, azucares_por_100g: parseFloat(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Sodio (mg)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">science</span>
                                            <input type="number" readOnly={isViewMode} className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`} value={formData.sodio_mg_por_100g || ''} onChange={(e) => setFormData({...formData, sodio_mg_por_100g: parseFloat(e.target.value)})} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Conversiones Típicas */}
                            <div className="col-span-1 md:col-span-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-[#b08969]">sync_alt</span> Equivalencias de Peso
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide" title="Peso de 1 unidad típica (ej. 1 huevo = 50g)">1 Unidad (g)</label>
                                        <input type="number" readOnly={isViewMode} placeholder="Opcional" className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`} value={formData.peso_por_unidad_gramos || ''} onChange={(e) => setFormData({...formData, peso_por_unidad_gramos: parseFloat(e.target.value) || null})} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">1 Taza (g)</label>
                                        <input type="number" readOnly={isViewMode} placeholder="Opcional" className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`} value={formData.peso_por_taza_gramos || ''} onChange={(e) => setFormData({...formData, peso_por_taza_gramos: parseFloat(e.target.value) || null})} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">1 Cucharada (g)</label>
                                        <input type="number" readOnly={isViewMode} placeholder="Opcional" className={`w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all ${isViewMode ? 'opacity-80' : ''}`} value={formData.peso_por_cucharada_gramos || ''} onChange={(e) => setFormData({...formData, peso_por_cucharada_gramos: parseFloat(e.target.value) || null})} />
                                    </div>
                                </div>
                            </div>

                            {/* Atributos Dietéticos */}
                            <div className="col-span-1 md:col-span-2 mt-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-[#b08969]">health_and_safety</span> Atributos
                                </h4>
                                <div className="flex gap-6">
                                    <label className={`flex items-center gap-2 cursor-pointer ${isViewMode ? 'pointer-events-none opacity-80' : ''}`}>
                                        <input type="checkbox" checked={formData.es_vegano} onChange={(e) => setFormData({...formData, es_vegano: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-green-500 focus:ring-green-500 bg-slate-50 dark:bg-[#1a1c23]" />
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Es Vegano</span>
                                    </label>
                                    <label className={`flex items-center gap-2 cursor-pointer ${isViewMode ? 'pointer-events-none opacity-80' : ''}`}>
                                        <input type="checkbox" checked={formData.es_libre_de_gluten} onChange={(e) => setFormData({...formData, es_libre_de_gluten: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-yellow-500 focus:ring-yellow-500 bg-slate-50 dark:bg-[#1a1c23]" />
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Libre de Gluten</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-6 md:px-8 py-5 border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                            <button 
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => setIsModalOpen(false)}>
                                {isViewMode ? 'Cerrar' : 'Cancelar'}
                            </button>
                            {!isViewMode && (
                                <button 
                                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#b08969] hover:bg-[#9c785c] hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#b08969]/30 transition-all flex items-center gap-2"
                                    onClick={() => handleSave()}>
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    Guardar Cambios
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function IngredientManager() {
    return (
        <AuthProvider>
            <IngredientesAdminContent />
        </AuthProvider>
    );
}
