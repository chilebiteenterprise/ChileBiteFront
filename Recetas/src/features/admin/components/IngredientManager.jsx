import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast, Modal, Button, Select, ListBox, Label } from "@heroui/react";
import {
    ArrowLeft,
    Search,
    Plus,
    ArrowDownAZ,
    ArrowUpZA,
    Eye,
    Pencil,
    Trash2,
    X,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Apple,
    Carrot,
    Beef,
    Fish,
    Milk,
    Wheat,
    UtensilsCrossed,
    Utensils,
    Droplets,
    Flame,
    Dumbbell,
    Leaf,
    Candy,
    FlaskConical,
    Scale,
    ShieldCheck,
    SearchX,
    Sparkles,
    Loader2,
    TriangleAlert,
    Coffee,
    Wand2
} from 'lucide-react';

export const INGREDIENT_CATEGORIES = [
    { 
        name: 'Vegetales', 
        icon: Carrot, 
        bg: 'bg-emerald-500/10', 
        text: 'text-emerald-700 dark:text-emerald-400', 
        border: 'border-emerald-500/20',
        description: 'Verduras frescas, hortalizas, tubérculos y hojas verdes ricos en micronutrientes y fibra.',
        examples: 'Palta Hass, Lechuga, Tomate, Zanahoria, Cebolla, Espinaca.'
    },
    { 
        name: 'Frutas', 
        icon: Apple, 
        bg: 'bg-rose-500/10', 
        text: 'text-rose-700 dark:text-rose-400', 
        border: 'border-rose-500/20',
        description: 'Frutas frescas, cítricos y bayas con alto contenido de agua, fructosa natural y vitaminas.',
        examples: 'Manzana Fuji, Plátano, Naranja, Frutillas, Limón, Piña.'
    },
    { 
        name: 'Carnes y Aves', 
        icon: Beef, 
        bg: 'bg-red-500/10', 
        text: 'text-red-700 dark:text-red-400', 
        border: 'border-red-500/20',
        description: 'Cortes de vacuno, cerdo, pollo y pavo de alto valor biológico y contenido proteico.',
        examples: 'Pechuga de pollo, Posta negra, Chuleta de cerdo, Carne molida 4%.'
    },
    { 
        name: 'Pescados y Mariscos', 
        icon: Fish, 
        bg: 'bg-teal-500/10', 
        text: 'text-teal-700 dark:text-teal-400', 
        border: 'border-teal-500/20',
        description: 'Proteínas marinas y fluviales magras o grasas ricas en ácidos grasos Omega-3.',
        examples: 'Salmón fresco, Atún al agua, Merluza, Reineta, Camarones, Choritos.'
    },
    { 
        name: 'Lácteos y Huevos', 
        icon: Milk, 
        bg: 'bg-sky-500/10', 
        text: 'text-sky-700 dark:text-sky-400', 
        border: 'border-sky-500/20',
        description: 'Leches fluidas, quesos maduros/frescos, yogures fermentados y huevos de ave.',
        examples: 'Leche descremada, Queso Chanco, Yogurt griego, Huevos de campo.'
    },
    { 
        name: 'Legumbres', 
        icon: Leaf, 
        bg: 'bg-lime-500/10', 
        text: 'text-lime-700 dark:text-lime-400', 
        border: 'border-lime-500/20',
        description: 'Granos y semillas secas con alto contenido de almidón resistente, fibra y proteína vegetal.',
        examples: 'Lentejas 4mm, Porotos negros, Garbanzos secos/cocidos, Arvejas partidas.'
    },
    { 
        name: 'Cereales y Granos', 
        icon: Wheat, 
        bg: 'bg-amber-500/10', 
        text: 'text-amber-700 dark:text-amber-400', 
        border: 'border-amber-500/20',
        description: 'Carbohidratos complejos, arroces, avenas, harinas, masas, fideos y panificados.',
        examples: 'Arroz grado 1, Avena laminada, Fideos integrales, Quinoa, Harina de trigo.'
    },
    { 
        name: 'Frutos Secos y Semillas', 
        icon: Sparkles, 
        bg: 'bg-orange-500/10', 
        text: 'text-orange-700 dark:text-orange-400', 
        border: 'border-orange-500/20',
        description: 'Semillas oleaginosas ricas en grasas saludables, magnesio y antioxidantes.',
        examples: 'Nueces mariposa, Almendras enteras, Maní tostado, Semillas de chía, Linaza.'
    },
    { 
        name: 'Grasas y Aceites', 
        icon: Droplets, 
        bg: 'bg-yellow-500/10', 
        text: 'text-yellow-700 dark:text-yellow-400', 
        border: 'border-yellow-500/20',
        description: 'Aceites vegetales prensados, mantecas y grasas utilizadas para cocción o aliño.',
        examples: 'Aceite de oliva extra virgen, Aceite de maravilla, Mantequilla con sal.'
    },
    { 
        name: 'Especias y Hierbas', 
        icon: Flame, 
        bg: 'bg-purple-500/10', 
        text: 'text-purple-700 dark:text-purple-400', 
        border: 'border-purple-500/20',
        description: 'Condimentos, sazonadores, hojas aromáticas y sales para realzar el sabor.',
        examples: 'Orégano seco, Comino molido, Sal de mar, Ají de color, Pimienta negra.'
    },
    { 
        name: 'Dulces y Azúcares', 
        icon: Candy, 
        bg: 'bg-pink-500/10', 
        text: 'text-pink-700 dark:text-pink-400', 
        border: 'border-pink-500/20',
        description: 'Azúcares calóricos, mieles naturales, endulzantes y cacao para repostería.',
        examples: 'Miel de abeja pura, Azúcar rubia, Chocolate amargo 70%, Manjar casero.'
    },
    { 
        name: 'Bebidas', 
        icon: Coffee, 
        bg: 'bg-blue-500/10', 
        text: 'text-blue-700 dark:text-blue-400', 
        border: 'border-blue-500/20',
        description: 'Infusiones, cafés, caldos e ingredientes líquidos para preparación y consumo.',
        examples: 'Café de grano molido, Té negro, Caldo de verduras casero, Jugo de naranja.'
    },
    { 
        name: 'Otros', 
        icon: Utensils, 
        bg: 'bg-zinc-500/10', 
        text: 'text-zinc-700 dark:text-zinc-400', 
        border: 'border-zinc-500/20',
        description: 'Levaduras, polvos leudantes, vinagres y aditivos culinarios específicos.',
        examples: 'Polvos de hornear, Levadura seca activa, Vinagre de manzana, Esencia de vainilla.'
    },
];

export const normalizeCategory = (rawCat) => {
    if (!rawCat) return 'Otros';
    const clean = rawCat.trim();
    const lower = clean.toLowerCase();

    // Check direct matching or synonyms
    if (lower === 'vegetales' || lower.includes('vegetal') || lower.includes('verdur') || lower === 'hortalizas') return 'Vegetales';
    if (lower === 'frutas' || (lower.includes('frut') && !lower.includes('seco'))) return 'Frutas';
    if (lower.includes('carne') || lower.includes('ave') || lower.includes('pollo') || lower.includes('vacuno') || lower.includes('cerdo')) return 'Carnes y Aves';
    if (lower.includes('pescado') || lower.includes('marisco') || lower.includes('mar') || lower.includes('atun') || lower.includes('atún') || lower.includes('salm')) return 'Pescados y Mariscos';
    if (lower.includes('lacteo') || lower.includes('lácteo') || lower.includes('leche') || lower.includes('queso') || lower.includes('huevo') || lower.includes('yogur')) return 'Lácteos y Huevos';
    if (lower.includes('legumbre') || lower.includes('poroto') || lower.includes('lenteja') || lower.includes('garbanzo') || lower.includes('arveja')) return 'Legumbres';
    // Panadería maps to Cereales y Granos
    if (lower.includes('panader') || lower.includes('pan') || lower.includes('harina') || lower.includes('cereal') || lower.includes('grano') || lower.includes('pasta') || lower.includes('arroz') || lower.includes('avena')) return 'Cereales y Granos';
    if (lower.includes('seco') || lower.includes('semilla') || lower.includes('nuez') || lower.includes('almendra') || lower.includes('chia') || lower.includes('maní')) return 'Frutos Secos y Semillas';
    if (lower.includes('grasa') || lower.includes('aceite') || lower.includes('manteca') || lower.includes('oliva')) return 'Grasas y Aceites';
    if (lower.includes('especia') || lower.includes('hierba') || lower.includes('condimento') || lower.includes('sal') || lower.includes('pimienta') || lower.includes('oregano') || lower.includes('orégano')) return 'Especias y Hierbas';
    if (lower.includes('dulce') || lower.includes('azucar') || lower.includes('azúcar') || lower.includes('miel') || lower.includes('chocolate') || lower.includes('sirope')) return 'Dulces y Azúcares';
    if (lower.includes('bebida') || lower.includes('jugo') || lower.includes('infusion') || lower.includes('infusión') || lower.includes('cafe') || lower.includes('café') || lower.includes('vino')) return 'Bebidas';

    const match = INGREDIENT_CATEGORIES.find(c => c.name.toLowerCase() === lower);
    if (match) return match.name;

    return 'Otros';
};

export const getCategoryMeta = (cat) => {
    const normalized = normalizeCategory(cat);
    return INGREDIENT_CATEGORIES.find(c => c.name === normalized) || INGREDIENT_CATEGORIES[INGREDIENT_CATEGORIES.length - 1];
};

export const TIPO_MEDIDA_OPTIONS = [
    { 
        val: 'peso', 
        label: 'Sólido por Peso', 
        badge: 'Peso (g, kg)', 
        units: 'g, kg', 
        icon: Scale, 
        color: 'text-amber-700 dark:text-amber-400', 
        bg: 'bg-amber-500/10 border-amber-500/20',
        hint: 'Masa pesable: harinas, carnes, legumbres, arroces, azúcar, sales.'
    },
    { 
        val: 'volumen', 
        label: 'Líquido por Volumen', 
        badge: 'Líquido (ml, l)', 
        units: 'ml, l', 
        icon: Droplets, 
        color: 'text-sky-700 dark:text-sky-400', 
        bg: 'bg-sky-500/10 border-sky-500/20',
        hint: 'Fluidos y bebibles: leche, aceite, vinagre, jugos, caldos, agua.'
    },
    { 
        val: 'unidad', 
        label: 'Contable por Unidad', 
        badge: 'Unidad (ud)', 
        units: 'ud, pieza', 
        icon: Apple, 
        color: 'text-emerald-700 dark:text-emerald-400', 
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        hint: 'Piezas contables enteras: huevos, manzanas, paltas, limones.'
    }
];

export const getTipoMedida = (item) => {
    if (item?.tipo_medida && ['peso', 'volumen', 'unidad'].includes(item.tipo_medida)) {
        return item.tipo_medida;
    }
    const cat = item?.categoria || '';
    const nom = (item?.nombre || '').toLowerCase();
    
    // Inferencia de líquidos
    if (cat === 'Bebidas' || cat === 'Grasas y Aceites' || /aceite|leche|vinagre|jugo|agua|vino|caldo|salsa|infusión|infusion|licor|almíbar|almibar|néctar|nectar|yogurt|yogur|sopa/i.test(nom)) {
        return 'volumen';
    }
    // Inferencia de contables
    if ((item?.peso_por_unidad_gramos && Number(item.peso_por_unidad_gramos) > 0) || /huevo|manzana|plátano|platano|palta|aguacate|limón|limon|naranja|pera|durazno|zanahoria|cebolla|tomate|papa |diente de ajo|salchicha|hamburguesa|croqueta/i.test(nom)) {
        return 'unidad';
    }
    // Resto: sólidos por peso
    return 'peso';
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
    const [ingredientToDelete, setIngredientToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isNormalizing, setIsNormalizing] = useState(false);

    // Hover tooltip state for categories
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const allCategoriesMeta = useMemo(() => ({
        name: 'Todas las categorías',
        icon: Utensils,
        bg: 'bg-brand-primary/10',
        text: 'text-brand-primary',
        border: 'border-brand-primary/20',
        description: 'Muestra el inventario completo de alimentos sin filtrar por categoría.',
        examples: 'Todos los ingredientes y materias primas disponibles.'
    }), []);

    const handleItemHover = (e, cat) => {
        // Obtenemos el contenedor exterior del popover para posicionarlo claramente fuera de sus bordes y scrollbar
        const popoverEl = e.currentTarget.closest('[class*="Select_popover"], [class*="max-h-72"], .bg-surface-elevated') || e.currentTarget;
        const popoverRect = popoverEl.getBoundingClientRect();
        const itemRect = e.currentTarget.getBoundingClientRect();

        const tooltipWidth = 290;
        const spaceRight = window.innerWidth - popoverRect.right;
        
        // Más a la derecha del popover (20px de separación)
        let left = popoverRect.right + 20;
        if (spaceRight < tooltipWidth + 30) {
            // Si no hay suficiente espacio a la derecha, mostrar a la izquierda del popover
            left = Math.max(16, popoverRect.left - tooltipWidth - 20);
        }
        
        const tooltipHeight = 160;
        let top = itemRect.top - 8;
        if (top + tooltipHeight > window.innerHeight) {
            top = Math.max(16, window.innerHeight - tooltipHeight - 16);
        }

        setTooltipPosition({ top, left });
        setHoveredCategory(cat);
    };

    const handleItemLeave = () => {
        setHoveredCategory(null);
    };

    useEffect(() => {
        if (!hoveredCategory) return;
        const handleGlobalDismiss = () => setHoveredCategory(null);
        window.addEventListener('click', handleGlobalDismiss);
        window.addEventListener('scroll', handleGlobalDismiss, true);
        return () => {
            window.removeEventListener('click', handleGlobalDismiss);
            window.removeEventListener('scroll', handleGlobalDismiss, true);
        };
    }, [hoveredCategory]);

    const [formData, setFormData] = useState({ 
        id: null, 
        nombre: '', 
        categoria: 'Vegetales',
        tipo_medida: 'peso',
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
                .select('id, nombre, categoria, tipo_medida, calorias_por_100g, proteinas_por_100g, grasas_por_100g, carbohidratos_por_100g, fibra_por_100g, azucares_por_100g, sodio_mg_por_100g, peso_por_unidad_gramos, peso_por_taza_gramos, peso_por_cucharada_gramos, es_vegano, es_libre_de_gluten')
                .order('nombre')
                .limit(2000);
            if (error) throw error;
            setIngredientes(data || []);
        } catch (error) {
            console.error("Error al cargar ingredientes", error);
            toast.danger("Error al cargar los ingredientes.");
        }
    };

    const handleSave = async () => {
        if (!formData.nombre.trim()) {
            toast.danger("El nombre del ingrediente es obligatorio.");
            return;
        }
        setIsSaving(true);
        const payload = { 
            ...formData,
            categoria: normalizeCategory(formData.categoria),
            tipo_medida: formData.tipo_medida || 'peso'
        };
        delete payload.id;
        try {
            if (formData.id) {
                const { error } = await supabase.from('core_ingrediente').update(payload).eq('id', formData.id);
                if (error) throw error;
                toast.success("Ingrediente actualizado con éxito.");
            } else {
                const { error } = await supabase.from('core_ingrediente').insert(payload);
                if (error) throw error;
                toast.success("Ingrediente creado con éxito.");
            }
            fetchData();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error guardando ingrediente", error);
            toast.danger(error.message || "Error al guardar el ingrediente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSyncCategories = async () => {
        setIsNormalizing(true);
        try {
            const toUpdate = ingredientes.filter(i => 
                !i.categoria || 
                i.categoria !== normalizeCategory(i.categoria) ||
                !i.tipo_medida ||
                i.tipo_medida !== getTipoMedida(i)
            );
            if (toUpdate.length === 0) {
                toast.success("Todos los ingredientes ya se encuentran estandarizados.");
                return;
            }
            let updatedCount = 0;
            for (const item of toUpdate) {
                const normalized = normalizeCategory(item.categoria);
                const inferredTipo = getTipoMedida(item);
                const { error } = await supabase
                    .from('core_ingrediente')
                    .update({ 
                        categoria: normalized,
                        tipo_medida: inferredTipo
                    })
                    .eq('id', item.id);
                if (!error) updatedCount++;
            }
            toast.success(`Se estandarizaron ${updatedCount} ingredientes con éxito en la base de datos.`);
            await fetchData();
        } catch (err) {
            console.error("Error al estandarizar", err);
            toast.danger("Ocurrió un error al estandarizar los ingredientes.");
        } finally {
            setIsNormalizing(false);
        }
    };

    const confirmDelete = async () => {
        if (!ingredientToDelete) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase.from('core_ingrediente').delete().eq('id', ingredientToDelete.id);
            if (error) throw error;
            toast.success(`"${ingredientToDelete.nombre}" ha sido eliminado exitosamente.`);
            setIngredientToDelete(null);
            fetchData();
        } catch (error) {
            console.error("Error eliminando ingrediente", error);
            toast.danger(error.message || "Error al eliminar el ingrediente.");
        } finally {
            setIsDeleting(false);
        }
    };

    const openModal = (item = null, viewOnly = false) => {
        setIsViewMode(viewOnly);
        setFormData(item ? { 
            ...item,
            categoria: normalizeCategory(item.categoria),
            tipo_medida: item.tipo_medida || getTipoMedida(item) || 'peso'
        } : { 
            id: null, 
            nombre: '', 
            categoria: 'Vegetales',
            tipo_medida: 'peso',
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

    const unnormalizedCount = useMemo(() => {
        return ingredientes.filter(i => 
            !i.categoria || 
            i.categoria !== normalizeCategory(i.categoria) ||
            !i.tipo_medida ||
            i.tipo_medida !== getTipoMedida(i)
        ).length;
    }, [ingredientes]);

    const veganCount = useMemo(() => ingredientes.filter(i => i.es_vegano).length, [ingredientes]);
    const glutenFreeCount = useMemo(() => ingredientes.filter(i => i.es_libre_de_gluten).length, [ingredientes]);

    const filteredAndSortedIngredientes = useMemo(() => {
        let result = ingredientes;
        
        if (selectedCategory) {
            result = result.filter(ing => normalizeCategory(ing.categoria) === selectedCategory);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(ing => 
                ing.nombre.toLowerCase().includes(term) || 
                (ing.categoria && ing.categoria.toLowerCase().includes(term)) ||
                normalizeCategory(ing.categoria).toLowerCase().includes(term)
            );
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

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-3 text-zinc-500 dark:text-zinc-400 font-bold">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary dark:text-[#f0a262]" />
                <span>Verificando permisos y cargando ingredientes...</span>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-6 md:py-10">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => window.location.href = "/recipes"} 
                        className="flex items-center justify-center w-11 h-11 rounded-2xl bg-surface-card border border-border-subtle text-text-main hover:text-brand-primary hover:border-brand-primary/40 transition-all shadow-sm hover:scale-105 active:scale-95"
                        aria-label="Volver a recetas"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">
                            Gestión de Ingredientes
                        </h1>
                        <p className="text-text-muted text-xs md:text-sm mt-0.5">
                            Panel de Administración · Catálogo de Alimentos & Valores Nutricionales
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => openModal(null)} 
                    className="text-sm font-extrabold text-white px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 shrink-0"
                >
                    <Plus className="w-4 h-4" /> Nuevo Ingrediente
                </button>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-sm flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Apple className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider truncate">Total Alimentos</p>
                        <p className="text-xl font-black text-text-main">{ingredientes.length}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-sm flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                        <Utensils className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider truncate">Categorías Oficiales</p>
                        <p className="text-xl font-black text-text-main">{INGREDIENT_CATEGORIES.length}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-sm flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Leaf className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider truncate">Veganos</p>
                        <p className="text-xl font-black text-text-main">{veganCount}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-surface-card border border-border-subtle shadow-sm flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider truncate">Sin Gluten</p>
                        <p className="text-xl font-black text-text-main">{glutenFreeCount}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                {/* Banner de Sincronización / Estandarización */}
                {unnormalizedCount > 0 && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <Wand2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-main">
                                    Se detectaron {unnormalizedCount} ingredientes con categorías desactualizadas o espacios repetidos.
                                </p>
                                <p className="text-xs text-text-muted mt-0.5">
                                    Puedes homologarlos automáticamente a las 13 categorías oficiales en la base de datos con un clic.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={isNormalizing}
                            onClick={handleSyncCategories}
                            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
                        >
                            {isNormalizing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Estandarizando...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Estandarizar ({unnormalizedCount})</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                <section className="bg-surface-card rounded-3xl shadow-sm border border-border-subtle overflow-hidden">
                    
                    {/* Toolbar */}
                    <div className="px-6 py-5 border-b border-border-subtle bg-surface-muted/30 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por nombre o categoría..." 
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-input border border-border-subtle focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-sm text-text-main placeholder:text-text-subtle"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Select
                                value={selectedCategory || "ALL"}
                                onOpenChange={(isOpen) => { if (!isOpen) handleItemLeave(); }}
                                onChange={(val) => {
                                    handleItemLeave();
                                    setSelectedCategory(!val || val === "ALL" ? "" : val);
                                }}
                                aria-label="Filtrar por categoría"
                                className="w-60"
                            >
                                <Label className="sr-only">Categoría</Label>
                                <Select.Trigger className="h-[42px] w-full bg-surface-input border border-border-subtle hover:border-border-strong text-text-main rounded-xl px-4 flex items-center justify-between transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer">
                                    <Select.Value className="text-sm font-medium text-text-main truncate">
                                        {selectedCategory || "Todas las categorías"}
                                    </Select.Value>
                                    <Select.Indicator className="text-text-muted shrink-0 ml-2" />
                                </Select.Trigger>
                                <Select.Popover 
                                    onMouseLeave={handleItemLeave}
                                    className="bg-surface-elevated text-text-main border border-border-subtle shadow-2xl rounded-2xl p-1.5 max-h-72 overflow-y-auto z-[60] custom-scrollbar"
                                >
                                    <ListBox className="bg-surface-elevated text-text-main space-y-0.5">
                                        <ListBox.Item 
                                            id="ALL" 
                                            key="ALL" 
                                            textValue="Todas las categorías" 
                                            onMouseEnter={(e) => handleItemHover(e, allCategoriesMeta)}
                                            onMouseLeave={handleItemLeave}
                                            onClick={handleItemLeave}
                                            className="hover:bg-surface-muted text-text-main rounded-xl px-3 py-2 cursor-pointer text-sm font-medium transition-colors"
                                        >
                                            Todas las categorías
                                        </ListBox.Item>
                                        {INGREDIENT_CATEGORIES.map(cat => {
                                            const Icon = cat.icon;
                                            return (
                                                <ListBox.Item 
                                                    id={cat.name} 
                                                    key={cat.name} 
                                                    textValue={cat.name} 
                                                    onMouseEnter={(e) => handleItemHover(e, cat)}
                                                    onMouseLeave={handleItemLeave}
                                                    onClick={handleItemLeave}
                                                    className="hover:bg-surface-muted text-text-main rounded-xl px-3 py-2 cursor-pointer text-sm font-medium transition-colors flex items-center gap-2.5"
                                                >
                                                    <Icon className="w-4 h-4 text-text-muted shrink-0" />
                                                    <span>{cat.name}</span>
                                                </ListBox.Item>
                                            );
                                        })}
                                    </ListBox>
                                </Select.Popover>
                            </Select>

                            <button 
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} 
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-input border border-border-subtle text-text-main hover:bg-surface-muted hover:text-brand-primary hover:border-brand-primary/40 transition-all text-sm font-bold shadow-2xs"
                                title="Cambiar orden"
                            >
                                {sortOrder === 'asc' ? <ArrowDownAZ className="w-4 h-4 text-text-muted" /> : <ArrowUpZA className="w-4 h-4 text-text-muted" />}
                                <span className="hidden sm:inline">{sortOrder === 'asc' ? 'A - Z' : 'Z - A'}</span>
                            </button>
                        </div>

                        <span className="text-xs font-semibold text-text-muted self-end sm:self-center">
                            {filteredAndSortedIngredientes.length} {filteredAndSortedIngredientes.length === 1 ? 'resultado' : 'resultados'}
                        </span>
                    </div>

                    {/* Table Header */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3.5 bg-surface-muted/50 border-b border-border-subtle font-bold text-xs text-text-muted uppercase tracking-wider">
                        <div className="col-span-1 text-center">Ícono</div>
                        <div className="col-span-4">Nombre & Atributos</div>
                        <div className="col-span-3">Categoría</div>
                        <div className="col-span-2 text-right">Kcal / 100g</div>
                        <div className="col-span-2 text-center">Acciones</div>
                    </div>

                    {/* Content List */}
                    <div className="divide-y divide-border-subtle/60 min-h-[460px]">
                        {filteredAndSortedIngredientes.length === 0 ? (
                            <div className="p-16 text-center text-text-muted flex flex-col items-center justify-center gap-3">
                                <SearchX className="w-12 h-12 stroke-[1.5] text-text-subtle" />
                                <p className="text-base font-semibold text-text-main">No se encontraron ingredientes</p>
                                <p className="text-xs text-text-subtle max-w-sm">Intenta ajustar tu búsqueda o elimina los filtros de categoría para ver más resultados.</p>
                            </div>
                        ) : paginatedIngredientes.map(item => {
                            const meta = getCategoryMeta(item.categoria);
                            const CategoryIcon = meta.icon;
                            return (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-surface-muted/30 transition-colors group">
                                    <div className="col-span-1 hidden md:flex justify-center">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs border ${meta.bg} ${meta.text} ${meta.border}`}>
                                            <CategoryIcon className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="col-span-4 flex flex-col">
                                        <span className="font-bold text-text-main text-sm md:text-base group-hover:text-brand-primary transition-colors">
                                            {item.nombre}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {item.es_vegano && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                                                    <Leaf className="w-2.5 h-2.5" /> Vegano
                                                </span>
                                            )}
                                            {item.es_libre_de_gluten && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> Sin Gluten
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-3 flex flex-wrap items-center gap-1.5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
                                            <CategoryIcon className="w-3.5 h-3.5" />
                                            {meta.name}
                                        </span>
                                        {(() => {
                                            const tipoVal = item.tipo_medida || getTipoMedida(item);
                                            const tipoMeta = TIPO_MEDIDA_OPTIONS.find(t => t.val === tipoVal) || TIPO_MEDIDA_OPTIONS[0];
                                            const TipoIcon = tipoMeta.icon;
                                            return (
                                                <span 
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${tipoMeta.bg} ${tipoMeta.color}`} 
                                                    title={tipoMeta.hint}
                                                >
                                                    <TipoIcon className="w-3 h-3" />
                                                    {tipoMeta.badge}
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    <div className="col-span-2 md:text-right font-extrabold text-sm md:text-base text-brand-primary">
                                        {item.calorias_por_100g !== undefined && item.calorias_por_100g !== null 
                                            ? `${item.calorias_por_100g} kcal` 
                                            : '-'}
                                    </div>

                                    <div className="col-span-2 flex justify-end md:justify-center gap-1.5">
                                        <button 
                                            onClick={() => openModal(item, true)} 
                                            className="p-2 text-text-muted hover:text-amber-600 hover:bg-amber-500/10 rounded-xl transition-all" 
                                            title="Ver Detalles"
                                            aria-label="Ver Detalles"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => openModal(item, false)} 
                                            className="p-2 text-text-muted hover:text-brand-primary hover:bg-brand-subtle rounded-xl transition-all" 
                                            title="Editar"
                                            aria-label="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setIngredientToDelete(item)} 
                                            className="p-2 text-text-muted hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all" 
                                            title="Eliminar"
                                            aria-label="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border-subtle bg-surface-muted/30">
                            <span className="text-xs sm:text-sm text-text-muted">
                                Página <span className="font-bold text-text-main">{currentPage}</span> de <span className="font-bold text-text-main">{totalPages}</span>
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-text-main bg-surface-input border border-border-subtle hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Anterior
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-text-main bg-surface-input border border-border-subtle hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                                >
                                    Siguiente <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal>
                <Modal.Backdrop 
                    isOpen={!!ingredientToDelete} 
                    onOpenChange={(open) => !open && setIngredientToDelete(null)}
                    className="bg-black/60 backdrop-blur-md"
                >
                    <Modal.Container placement="center" className="p-4">
                        <Modal.Dialog className="w-full max-w-md bg-surface-elevated border border-border-subtle rounded-3xl shadow-2xl p-6 overflow-hidden">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                                    <TriangleAlert className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-text-main">
                                        ¿Eliminar ingrediente?
                                    </h3>
                                    <p className="text-sm text-text-muted mt-2 leading-relaxed">
                                        Estás a punto de eliminar <span className="font-bold text-text-main">"{ingredientToDelete?.nombre}"</span>. Esta acción no se puede deshacer y puede afectar recetas vinculadas.
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-3 w-full mt-2 pt-3 border-t border-border-subtle">
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => setIngredientToDelete(null)}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-text-muted hover:bg-surface-muted hover:text-text-main transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={confirmDelete}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-extrabold text-sm text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Eliminando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                <span>Eliminar</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            {/* General Modal (Edit/View/Create) */}
            <Modal>
                <Modal.Backdrop 
                    isOpen={isModalOpen} 
                    onOpenChange={setIsModalOpen}
                    className="bg-black/60 backdrop-blur-md"
                >
                    <Modal.Container placement="center" className="p-4">
                        <Modal.Dialog className="bg-surface-elevated rounded-3xl shadow-2xl w-full max-w-2xl border border-border-subtle overflow-hidden my-6 max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-surface-muted/30 sticky top-0 z-10">
                            <h3 className="text-xl font-black text-text-main tracking-tight flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                                    {isViewMode ? <Eye className="w-5 h-5" /> : formData.id ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </div>
                                {isViewMode ? 'Detalle de Ingrediente' : formData.id ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted text-text-muted hover:text-text-main transition-colors"
                                aria-label="Cerrar modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                            {/* General Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                        Nombre del Ingrediente
                                    </label>
                                    <input 
                                        type="text"
                                        autoFocus={!isViewMode}
                                        readOnly={isViewMode}
                                        className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all ${isViewMode ? 'opacity-80' : ''}`}
                                        placeholder="Ej. Palta Hass, Cebolla morada..."
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                        Categoría Oficial
                                    </label>
                                    {isViewMode ? (
                                        <div className="w-full bg-surface-input border border-border-subtle text-text-main text-sm rounded-xl px-4 py-3 flex items-center gap-2.5">
                                            {(() => {
                                                const meta = getCategoryMeta(formData.categoria);
                                                const Icon = meta.icon;
                                                return (
                                                    <>
                                                        <Icon className="w-4 h-4 text-brand-primary" />
                                                        <span className="font-bold">{meta.name}</span>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <Select
                                            value={formData.categoria || "Vegetales"}
                                            onOpenChange={(isOpen) => { if (!isOpen) handleItemLeave(); }}
                                            onChange={(val) => {
                                                handleItemLeave();
                                                setFormData({ ...formData, categoria: val || "Vegetales" });
                                            }}
                                            aria-label="Selecciona una categoría oficial"
                                            className="w-full"
                                        >
                                            <Label className="sr-only">Categoría Oficial</Label>
                                            <Select.Trigger className="h-[46px] w-full bg-surface-input border border-border-subtle hover:border-border-strong text-text-main rounded-xl px-4 flex items-center justify-between transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer">
                                                <Select.Value className="text-sm font-medium text-text-main truncate">
                                                    {formData.categoria || "Selecciona una categoría"}
                                                </Select.Value>
                                                <Select.Indicator className="text-text-muted shrink-0 ml-2" />
                                            </Select.Trigger>
                                            <Select.Popover 
                                                onMouseLeave={handleItemLeave}
                                                className="bg-surface-elevated text-text-main border border-border-subtle shadow-2xl rounded-2xl p-1.5 max-h-72 overflow-y-auto z-[150] custom-scrollbar"
                                            >
                                                <ListBox className="bg-surface-elevated text-text-main space-y-0.5">
                                                    {INGREDIENT_CATEGORIES.map(cat => {
                                                        const Icon = cat.icon;
                                                        return (
                                                            <ListBox.Item 
                                                                id={cat.name} 
                                                                key={cat.name} 
                                                                textValue={cat.name} 
                                                                onMouseEnter={(e) => handleItemHover(e, cat)}
                                                                onMouseLeave={handleItemLeave}
                                                                onClick={handleItemLeave}
                                                                className="hover:bg-surface-muted text-text-main rounded-xl px-3 py-2 cursor-pointer text-sm font-medium transition-colors flex items-center gap-2.5"
                                                            >
                                                                <Icon className="w-4 h-4 text-text-muted shrink-0" />
                                                                <span>{cat.name}</span>
                                                            </ListBox.Item>
                                                        );
                                                    })}
                                                </ListBox>
                                            </Select.Popover>
                                        </Select>
                                    )}
                                </div>

                                {/* Naturaleza / Tipo de Medida */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-wide">
                                        Naturaleza de Medición (Contables vs. Incontables)
                                    </label>
                                    {isViewMode ? (
                                        <div className="w-full bg-surface-input border border-border-subtle rounded-xl p-3 flex items-center gap-3">
                                            {(() => {
                                                const currentTipo = TIPO_MEDIDA_OPTIONS.find(t => t.val === (formData.tipo_medida || 'peso')) || TIPO_MEDIDA_OPTIONS[0];
                                                const Icon = currentTipo.icon;
                                                return (
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${currentTipo.bg} ${currentTipo.color}`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-text-main">{currentTipo.label}</p>
                                                            <p className="text-xs text-text-muted">{currentTipo.hint}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {TIPO_MEDIDA_OPTIONS.map(tipo => {
                                                const Icon = tipo.icon;
                                                const isSelected = (formData.tipo_medida || 'peso') === tipo.val;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={tipo.val}
                                                        onClick={() => setFormData({ ...formData, tipo_medida: tipo.val })}
                                                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                                                            isSelected 
                                                                ? 'border-brand-primary bg-brand-primary/10 shadow-sm ring-1 ring-brand-primary/30' 
                                                                : 'border-border-subtle bg-surface-input hover:border-border-strong hover:bg-surface-muted/50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between w-full">
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${tipo.bg} ${tipo.color}`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            {isSelected && (
                                                                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-text-main leading-tight">
                                                                {tipo.label}
                                                            </p>
                                                            <p className="text-[11px] font-semibold text-text-muted mt-0.5">
                                                                Unidades: <span className="text-brand-primary">{tipo.units}</span>
                                                            </p>
                                                            <p className="text-[11px] text-text-subtle mt-1 leading-snug line-clamp-2">
                                                                {tipo.hint}
                                                            </p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Macros/Nutrientes Principales */}
                            <div className="border-t border-border-subtle pt-5">
                                <h4 className="text-sm font-bold text-text-main mb-4 tracking-tight flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-brand-primary" /> 
                                    Valores Nutricionales (por cada 100g {formData.tipo_medida === 'volumen' ? 'o 100ml' : ''})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                            Calorías (kcal)
                                        </label>
                                        <div className="relative">
                                            <Flame className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                                            <input 
                                                type="number" 
                                                step="any"
                                                readOnly={isViewMode} 
                                                className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewMode ? 'opacity-80' : ''}`} 
                                                value={formData.calorias_por_100g || ''} 
                                                onChange={(e) => setFormData({...formData, calorias_por_100g: parseFloat(e.target.value) || 0})} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                            Proteínas (g)
                                        </label>
                                        <div className="relative">
                                            <Dumbbell className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                                            <input 
                                                type="number" 
                                                step="any"
                                                readOnly={isViewMode} 
                                                className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewMode ? 'opacity-80' : ''}`} 
                                                value={formData.proteinas_por_100g || ''} 
                                                onChange={(e) => setFormData({...formData, proteinas_por_100g: parseFloat(e.target.value) || 0})} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                            Grasas (g)
                                        </label>
                                        <div className="relative">
                                            <Droplets className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                            <input 
                                                type="number" 
                                                step="any"
                                                readOnly={isViewMode} 
                                                className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewMode ? 'opacity-80' : ''}`} 
                                                value={formData.grasas_por_100g || ''} 
                                                onChange={(e) => setFormData({...formData, grasas_por_100g: parseFloat(e.target.value) || 0})} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                            Carbohidratos (g)
                                        </label>
                                        <div className="relative">
                                            <Wheat className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                                            <input 
                                                type="number" 
                                                step="any"
                                                readOnly={isViewMode} 
                                                className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewMode ? 'opacity-80' : ''}`} 
                                                value={formData.carbohidratos_por_100g || ''} 
                                                onChange={(e) => setFormData({...formData, carbohidratos_por_100g: parseFloat(e.target.value) || 0})} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                            Fibra (g)
                                        </label>
                                        <div className="relative">
                                            <Leaf className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                            <input 
                                                type="number" 
                                                step="any"
                                                readOnly={isViewMode} 
                                                className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewMode ? 'opacity-80' : ''}`} 
                                                value={formData.fibra_por_100g || ''} 
                                                onChange={(e) => setFormData({...formData, fibra_por_100g: parseFloat(e.target.value) || 0})} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                            Azúcares (g)
                                        </label>
                                        <div className="relative">
                                            <Candy className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                                            <input 
                                                type="number" 
                                                step="any"
                                                readOnly={isViewMode} 
                                                className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewMode ? 'opacity-80' : ''}`} 
                                                value={formData.azucares_por_100g || ''} 
                                                onChange={(e) => setFormData({...formData, azucares_por_100g: parseFloat(e.target.value) || 0})} 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                            Sodio (mg)
                                        </label>
                                        <div className="relative">
                                            <FlaskConical className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                                            <input 
                                                type="number" 
                                                step="any"
                                                readOnly={isViewMode} 
                                                className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewMode ? 'opacity-80' : ''}`} 
                                                value={formData.sodio_mg_por_100g || ''} 
                                                onChange={(e) => setFormData({...formData, sodio_mg_por_100g: parseFloat(e.target.value) || 0})} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Conversiones Típicas / Equivalencias Caseras */}
                            <div className="border-t border-border-subtle pt-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                                    <h4 className="text-sm font-bold text-text-main tracking-tight flex items-center gap-2">
                                        <Scale className="w-4 h-4 text-brand-primary" /> 
                                        Equivalencias Caseras
                                    </h4>
                                    <span className="text-xs text-text-muted">
                                        {formData.tipo_medida === 'volumen' 
                                            ? 'Líquidos: 1 taza ≈ 240ml, 1 cda ≈ 15ml'
                                            : formData.tipo_medida === 'unidad'
                                            ? 'Contables: Peso de 1 pieza completa'
                                            : 'Sólidos pesables: Gramos equivalentes'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className={formData.tipo_medida === 'volumen' ? 'opacity-50' : ''}>
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                            1 Unidad {formData.tipo_medida === 'volumen' ? '(No aplica)' : '(g)'}
                                        </label>
                                        <input 
                                            type="number" 
                                            step="any"
                                            readOnly={isViewMode || formData.tipo_medida === 'volumen'} 
                                            placeholder={formData.tipo_medida === 'volumen' ? 'No aplica' : 'Ej. 50'} 
                                            className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewMode || formData.tipo_medida === 'volumen' ? 'opacity-80' : ''}`} 
                                            value={formData.peso_por_unidad_gramos || ''} 
                                            onChange={(e) => setFormData({...formData, peso_por_unidad_gramos: parseFloat(e.target.value) || null})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                            1 Taza {formData.tipo_medida === 'volumen' ? '(ml o g)' : '(g)'}
                                        </label>
                                        <input 
                                            type="number" 
                                            step="any"
                                            readOnly={isViewMode} 
                                            placeholder={formData.tipo_medida === 'volumen' ? 'Ej. 240' : 'Ej. 200'} 
                                            className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewMode ? 'opacity-80' : ''}`} 
                                            value={formData.peso_por_taza_gramos || ''} 
                                            onChange={(e) => setFormData({...formData, peso_por_taza_gramos: parseFloat(e.target.value) || null})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase tracking-wide">
                                            1 Cucharada {formData.tipo_medida === 'volumen' ? '(ml o g)' : '(g)'}
                                        </label>
                                        <input 
                                            type="number" 
                                            step="any"
                                            readOnly={isViewMode} 
                                            placeholder={formData.tipo_medida === 'volumen' ? 'Ej. 15' : 'Ej. 15'} 
                                            className={`w-full bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewMode ? 'opacity-80' : ''}`} 
                                            value={formData.peso_por_cucharada_gramos || ''} 
                                            onChange={(e) => setFormData({...formData, peso_por_cucharada_gramos: parseFloat(e.target.value) || null})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Atributos Dietéticos */}
                            <div className="border-t border-border-subtle pt-5">
                                <h4 className="text-sm font-bold text-text-main mb-3 tracking-tight flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-brand-primary" /> 
                                    Certificaciones & Estilos de Vida
                                </h4>
                                <div className="flex flex-wrap gap-6 pt-1">
                                    <label className={`flex items-center gap-2.5 cursor-pointer select-none ${isViewMode ? 'pointer-events-none opacity-80' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.es_vegano} 
                                            onChange={(e) => setFormData({...formData, es_vegano: e.target.checked})} 
                                            className="w-5 h-5 rounded-md border-border-subtle text-brand-primary focus:ring-brand-primary bg-surface-input cursor-pointer" 
                                        />
                                        <span className="text-sm font-bold text-text-main flex items-center gap-1.5">
                                            <Leaf className="w-4 h-4 text-emerald-500" /> Apto para Veganos
                                        </span>
                                    </label>

                                    <label className={`flex items-center gap-2.5 cursor-pointer select-none ${isViewMode ? 'pointer-events-none opacity-80' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={formData.es_libre_de_gluten} 
                                            onChange={(e) => setFormData({...formData, es_libre_de_gluten: e.target.checked})} 
                                            className="w-5 h-5 rounded-md border-border-subtle text-brand-primary focus:ring-brand-primary bg-surface-input cursor-pointer" 
                                        />
                                        <span className="text-sm font-bold text-text-main flex items-center gap-1.5">
                                            <ShieldCheck className="w-4 h-4 text-amber-500" /> Libre de Gluten
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="px-6 md:px-8 py-4 border-t border-border-subtle flex justify-end gap-3 bg-surface-muted/30">
                            <button 
                                className="px-5 py-2.5 rounded-xl font-bold text-sm text-text-muted hover:bg-surface-muted hover:text-text-main transition-colors"
                                onClick={() => setIsModalOpen(false)}
                            >
                                {isViewMode ? 'Cerrar' : 'Cancelar'}
                            </button>
                            {!isViewMode && (
                                <button 
                                    disabled={isSaving}
                                    className="px-6 py-2.5 rounded-xl font-extrabold text-sm text-white bg-brand-primary hover:bg-brand-hover hover:scale-[1.02] active:scale-95 shadow-md shadow-brand-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                    onClick={handleSave}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Guardar Cambios</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>

        {/* Floating Category Description & Example Tooltip */}
        {hoveredCategory && (
            <div 
                style={{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }}
                className="fixed z-[9999] pointer-events-none w-72 p-3.5 rounded-2xl bg-surface-elevated/95 backdrop-blur-md border border-border-subtle shadow-2xl animate-in fade-in zoom-in-95 duration-150 transition-all select-none"
            >
                <div className="flex items-center gap-2.5 pb-2 mb-2 border-b border-border-subtle">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${hoveredCategory.bg} ${hoveredCategory.text} border ${hoveredCategory.border} shrink-0`}>
                        {(() => {
                            const Icon = hoveredCategory.icon;
                            return <Icon className="w-4 h-4" />;
                        })()}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-text-main truncate">{hoveredCategory.name}</h4>
                        <span className="text-[10px] font-semibold text-brand-primary tracking-wide uppercase">Categoría Oficial</span>
                    </div>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                    {hoveredCategory.description}
                </p>
                <div className="mt-2.5 pt-2 border-t border-border-subtle/60 text-[11px] leading-snug">
                    <span className="font-bold text-text-main">Ejemplos: </span>
                    <span className="text-text-muted font-medium">{hoveredCategory.examples}</span>
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
