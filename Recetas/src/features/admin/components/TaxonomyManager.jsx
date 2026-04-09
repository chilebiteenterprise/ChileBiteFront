import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

function TaxonomiasAdminContent() {
    const { session, profile, loading } = useAuth();
    const [paises, setPaises] = useState([]);
    const [tiposPlato, setTiposPlato] = useState([]);
    const [estilosVida, setEstilosVida] = useState([]);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEntity, setCurrentEntity] = useState(''); // 'pais', 'tipoplato', 'estilovida'
    const [formData, setFormData] = useState({ id: null, nombre: '' });

    // Map entity name to Supabase table name
    const entityTable = {
        pais: 'core_pais',
        tipoplato: 'core_tipoplato',
        estilovida: 'core_estilovida'
    };

    useEffect(() => {
        if (!loading && profile) {
            if (profile.role !== 'admin' && profile.rol !== 'admin') window.location.href = '/';
        } else if (!loading && !session) {
            window.location.href = '/auth/login';
        }
        fetchData();
    }, [profile, session, loading]);

    const fetchData = async () => {
        const [{ data: p }, { data: t }, { data: e }] = await Promise.all([
            supabase.from('core_pais').select('id, nombre').order('nombre'),
            supabase.from('core_tipoplato').select('id, nombre').order('nombre'),
            supabase.from('core_estilovida').select('id, nombre').order('nombre'),
        ]);
        if (p) setPaises(p);
        if (t) setTiposPlato(t);
        if (e) setEstilosVida(e);
    };

    const handleSave = async () => {
        if (!formData.nombre.trim()) return;
        const table = entityTable[currentEntity];
        if (formData.id) {
            await supabase.from(table).update({ nombre: formData.nombre }).eq('id', formData.id);
        } else {
            await supabase.from(table).insert({ nombre: formData.nombre });
        }
        fetchData();
        setIsModalOpen(false);
    };

    const handleDelete = async (id, entity) => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;
        const table = entityTable[entity];
        await supabase.from(table).delete().eq('id', id);
        fetchData();
    };

    const openModal = (entity, item = null) => {
        setCurrentEntity(entity);
        setFormData(item ? { id: item.id, nombre: item.nombre } : { id: null, nombre: '' });
        setIsModalOpen(true);
    };

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
                        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Datos</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1">Panel Administrador de Taxonomías</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Content: General View Only (No Tabs) */}
            <div className="grid grid-cols-1 gap-8 mb-8">
                {/* Países Section (Full Width) */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#b08969]">public</span>
                            <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Países</h3>
                        </div>
                        <button onClick={() => openModal('pais')} className="text-sm font-bold text-[#b08969] hover:text-white px-4 py-2 rounded-lg bg-[#b08969]/10 hover:bg-[#b08969] transition-all flex items-center gap-1 shadow-xs hover:shadow-md">
                            <span className="material-symbols-outlined text-[18px]">add</span> Añadir
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {paises.length === 0 ? <div className="p-8 text-center text-slate-400">No hay países registrados</div> : paises.map(item => (
                            <div key={item.id} className="flex items-center justify-between px-6 py-4 md:py-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-[#b08969]/10 dark:bg-[#b08969]/20 flex items-center justify-center text-[#b08969] font-black text-lg">
                                        {item.nombre.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-base md:text-lg">{item.nombre}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal('pais', item)} className="p-2 text-slate-400 hover:text-[#b08969] hover:bg-[#b08969]/10 rounded-xl transition-all" title="Editar">
                                        <span className="material-symbols-outlined text-[22px]">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(item.id, 'pais')} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all" title="Eliminar">
                                        <span className="material-symbols-outlined text-[22px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tipos de Plato */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-fit">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#b08969]">restaurant</span>
                            <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Tipos de Plato</h3>
                        </div>
                        <button onClick={() => openModal('tipoplato')} className="text-sm font-bold text-[#b08969] hover:text-white px-4 py-2 rounded-lg bg-[#b08969]/10 hover:bg-[#b08969] transition-all flex items-center gap-1 shadow-xs hover:shadow-md">
                            <span className="material-symbols-outlined text-[18px]">add</span> Añadir
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {tiposPlato.length === 0 ? <div className="p-8 text-center text-slate-400">No hay tipos registrados</div> : tiposPlato.map(item => (
                            <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.nombre}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal('tipoplato', item)} className="p-2 text-slate-400 hover:text-[#b08969] hover:bg-[#b08969]/10 rounded-xl transition-all"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                    <button onClick={() => handleDelete(item.id, 'tipoplato')} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Estilos de Vida */}
                <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-fit">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#b08969]">health_and_safety</span>
                            <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Estilos de Vida</h3>
                        </div>
                        <button onClick={() => openModal('estilovida')} className="text-sm font-bold text-[#b08969] hover:text-white px-4 py-2 rounded-lg bg-[#b08969]/10 hover:bg-[#b08969] transition-all flex items-center gap-1 shadow-xs hover:shadow-md">
                            <span className="material-symbols-outlined text-[18px]">add</span> Añadir
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {estilosVida.length === 0 ? <div className="p-8 text-center text-slate-400">No hay estilos registrados</div> : estilosVida.map((item, index) => {
                            const dotColors = ['bg-green-500 shadow-green-500/50', 'bg-orange-400 shadow-orange-400/50', 'bg-blue-400 shadow-blue-400/50', 'bg-purple-500 shadow-purple-500/50', 'bg-pink-500 shadow-pink-500/50'];
                            return (
                            <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${dotColors[index % dotColors.length]}`}></span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{item.nombre}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal('estilovida', item)} className="p-2 text-slate-400 hover:text-[#b08969] hover:bg-[#b08969]/10 rounded-xl transition-all"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                    <button onClick={() => handleDelete(item.id, 'estilovida')} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                                </div>
                            </div>
                        )})}
                    </div>
                </section>
            </div>

            {/* Hint Box */}
            <div className="mt-12 p-6 rounded-2xl bg-[#b08969]/10 dark:bg-[#b08969]/5 border border-[#b08969]/20 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                <div className="bg-[#b08969] text-white w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-[#b08969]/30">
                    <span className="material-symbols-outlined text-[32px]">lightbulb</span>
                </div>
                <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-100 mb-1.5 text-lg">Tip de Administración</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">Al eliminar una taxonomía, asegúrate de que no existan platos asociados. Los cambios efectuados se verán reflejados inmediatamente en la red general de ChileBite.</p>
                </div>
            </div>

            {/* Custom Tailwind Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-md transition-opacity p-4" onClick={() => setIsModalOpen(false)}>
                    {/* The click on the overlay closes it, but we stop propagation on the modal form itself */}
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden transform scale-100 transition-all">
                        
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/30">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#b08969]">{formData.id ? 'edit_square' : 'add_box'}</span>
                                {formData.id ? 'Editar' : 'Añadir'} {currentEntity === 'pais' ? 'País' : currentEntity === 'tipoplato' ? 'Tipo de Plato' : 'Estilo de Vida'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 md:p-8">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Nombre de Taxonomía</label>
                            <input 
                                type="text"
                                autoFocus
                                className="w-full bg-slate-50 dark:bg-[#1a1c23] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-lg rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#b08969] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                                placeholder={currentEntity === 'pais' ? "Ej. México..." : currentEntity === 'tipoplato' ? "Ej. Picoteo..." : "Ej. Libre de Gluten..."}
                                value={formData.nombre}
                                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />
                        </div>
                        
                        <div className="px-6 md:px-8 py-5 border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                            <button 
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => setIsModalOpen(false)}>
                                Cancelar
                            </button>
                            <button 
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#b08969] hover:bg-[#9c785c] hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#b08969]/30 transition-all flex items-center gap-2"
                                onClick={() => handleSave()}>
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TaxonomyManager() {
    return (
        <AuthProvider>
            <TaxonomiasAdminContent />
        </AuthProvider>
    );
}
