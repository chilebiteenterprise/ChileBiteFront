import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { 
  Globe, 
  UtensilsCrossed, 
  Sparkles, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  ArrowRightLeft, 
  AlertTriangle, 
  Check, 
  X, 
  ShieldAlert, 
  Lightbulb 
} from 'lucide-react';
import { toast } from '@heroui/react';

function TaxonomiasAdminContent() {
  const { session, profile, loading } = useAuth();
  const [paises, setPaises] = useState([]);
  const [tiposPlato, setTiposPlato] = useState([]);
  const [estilosVida, setEstilosVida] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Filtros de búsqueda individual por sección
  const [searchPais, setSearchPais] = useState('');
  const [searchTipoPlato, setSearchTipoPlato] = useState('');
  const [searchEstiloVida, setSearchEstiloVida] = useState('');

  // Modal de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState(''); // 'pais' | 'tipoplato' | 'estilovida'
  const [formData, setFormData] = useState({ id: null, nombre: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Modal de Eliminación con Reasignación
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    entity: '',
    recipeCount: 0,
    targetId: '',
    action: 'reassign', // 'reassign' | 'unassign'
    isChecking: false,
    isProcessing: false
  });

  const entityTable = {
    pais: 'core_pais',
    tipoplato: 'core_tipoplato',
    estilovida: 'core_estilovida'
  };

  const entityLabels = {
    pais: { singular: 'País', plural: 'Países' },
    tipoplato: { singular: 'Tipo de Plato', plural: 'Tipos de Plato' },
    estilovida: { singular: 'Estilo de Vida', plural: 'Estilos de Vida' }
  };

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role !== 'admin' && profile.rol !== 'admin') {
        window.location.href = '/';
      }
    } else if (!loading && !session) {
      window.location.href = '/auth/login';
    }
    fetchData();
  }, [profile, session, loading]);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      const [{ data: p }, { data: t }, { data: e }] = await Promise.all([
        supabase.from('core_pais').select('id, nombre').order('nombre'),
        supabase.from('core_tipoplato').select('id, nombre').order('nombre'),
        supabase.from('core_estilovida').select('id, nombre').order('nombre'),
      ]);
      if (p) setPaises(p);
      if (t) setTiposPlato(t);
      if (e) setEstilosVida(e);
    } catch (err) {
      console.error("Error al cargar taxonomías:", err);
      toast.danger("No se pudieron cargar los datos de taxonomías.");
    } finally {
      setIsDataLoading(false);
    }
  };

  // Guardar creación o edición
  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast.warning("El nombre no puede estar vacío");
      return;
    }
    setIsSaving(true);
    const table = entityTable[currentEntity];
    try {
      if (formData.id) {
        const { error } = await supabase.from(table).update({ nombre: formData.nombre.trim() }).eq('id', formData.id);
        if (error) throw error;
        toast.success(`${entityLabels[currentEntity].singular} actualizado con éxito`);
      } else {
        const { error } = await supabase.from(table).insert({ nombre: formData.nombre.trim() });
        if (error) throw error;
        toast.success(`${entityLabels[currentEntity].singular} añadido con éxito`);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error al guardar:", err);
      toast.danger("Error al guardar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Inicio del proceso de eliminación: comprueba recetas asociadas
  const handleStartDelete = async (item, entity) => {
    setDeleteModal(prev => ({ ...prev, isChecking: true }));
    let count = 0;

    try {
      if (entity === 'tipoplato') {
        const res = await supabase.from('core_receta').select('*', { count: 'exact', head: true }).eq('tipo_plato_id', item.id);
        count = res.count || 0;
      } else if (entity === 'pais') {
        const res = await supabase.from('core_receta').select('*', { count: 'exact', head: true }).eq('pais_id', item.id);
        count = res.count || 0;
      } else if (entity === 'estilovida') {
        const res = await supabase.from('core_receta_estilos_vida').select('*', { count: 'exact', head: true }).eq('estilovida_id', item.id);
        count = res.count || 0;
      }

      // Obtener las demás opciones para reasignar (excluyendo el que se elimina)
      const list = entity === 'pais' ? paises : entity === 'tipoplato' ? tiposPlato : estilosVida;
      const otherOptions = list.filter(o => o.id !== item.id);
      const defaultTarget = otherOptions.length > 0 ? otherOptions[0].id : '';

      setDeleteModal({
        isOpen: true,
        item,
        entity,
        recipeCount: count,
        targetId: defaultTarget,
        action: count > 0 && otherOptions.length > 0 ? 'reassign' : 'unassign',
        isChecking: false,
        isProcessing: false
      });
    } catch (err) {
      console.error("Error al verificar dependencias:", err);
      toast.danger("Error al verificar recetas asociadas.");
      setDeleteModal(prev => ({ ...prev, isChecking: false }));
    }
  };

  // Confirmar eliminación (con o sin reasignación)
  const handleConfirmDelete = async () => {
    const { item, entity, recipeCount, action, targetId } = deleteModal;
    if (!item || !entity) return;

    if (recipeCount > 0 && action === 'reassign' && !targetId) {
      toast.warning("Selecciona una categoría de destino para trasladar las recetas.");
      return;
    }

    setDeleteModal(prev => ({ ...prev, isProcessing: true }));
    const table = entityTable[entity];

    try {
      // 1. Reasignar o desvincular recetas asociadas
      if (recipeCount > 0) {
        if (entity === 'tipoplato') {
          const newTipo = action === 'reassign' ? targetId : null;
          const { error } = await supabase.from('core_receta').update({ tipo_plato_id: newTipo }).eq('tipo_plato_id', item.id);
          if (error) throw error;
        } else if (entity === 'pais') {
          const newPais = action === 'reassign' ? targetId : null;
          const { error } = await supabase.from('core_receta').update({ pais_id: newPais }).eq('pais_id', item.id);
          if (error) throw error;
        } else if (entity === 'estilovida') {
          if (action === 'reassign') {
            // Verificar cuáles recetas ya tienen el targetId para no duplicar la llave única
            const { data: existingTarget } = await supabase
              .from('core_receta_estilos_vida')
              .select('receta_id')
              .eq('estilovida_id', targetId);

            const existingRecetaIds = new Set((existingTarget || []).map(r => r.receta_id));

            // Obtener todas las recetas con el estilo que se elimina
            const { data: toMigrate } = await supabase
              .from('core_receta_estilos_vida')
              .select('id, receta_id')
              .eq('estilovida_id', item.id);

            for (const row of (toMigrate || [])) {
              if (existingRecetaIds.has(row.receta_id)) {
                // Ya tiene el target, solo borramos la relación vieja
                await supabase.from('core_receta_estilos_vida').delete().eq('id', row.id);
              } else {
                // No lo tiene, actualizamos a targetId
                await supabase.from('core_receta_estilos_vida').update({ estilovida_id: targetId }).eq('id', row.id);
              }
            }
          } else {
            // Desvincular todas las relaciones
            const { error } = await supabase.from('core_receta_estilos_vida').delete().eq('estilovida_id', item.id);
            if (error) throw error;
          }
        }
      }

      // 2. Eliminar la taxonomía
      const { error: delErr } = await supabase.from(table).delete().eq('id', item.id);
      if (delErr) throw delErr;

      const entityName = entityLabels[entity].singular;
      if (recipeCount > 0 && action === 'reassign') {
        toast.success(`Se eliminó «${item.nombre}» y se trasladaron ${recipeCount} receta(s) con éxito.`);
      } else {
        toast.success(`${entityName} eliminado correctamente.`);
      }

      setDeleteModal({ isOpen: false, item: null, entity: '', recipeCount: 0, targetId: '', action: 'reassign', isChecking: false, isProcessing: false });
      await fetchData();
    } catch (err) {
      console.error("Error al eliminar taxonomía:", err);
      toast.danger("Hubo un error al eliminar: " + err.message);
      setDeleteModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const openModal = (entity, item = null) => {
    setCurrentEntity(entity);
    setFormData(item ? { id: item.id, nombre: item.nombre } : { id: null, nombre: '' });
    setIsModalOpen(true);
  };

  // Filtrados individuales
  const filteredPaises = useMemo(() => {
    const q = searchPais.toLowerCase().trim();
    if (!q) return paises;
    return paises.filter(p => p.nombre.toLowerCase().includes(q));
  }, [paises, searchPais]);

  const filteredTiposPlato = useMemo(() => {
    const q = searchTipoPlato.toLowerCase().trim();
    if (!q) return tiposPlato;
    return tiposPlato.filter(t => t.nombre.toLowerCase().includes(q));
  }, [tiposPlato, searchTipoPlato]);

  const filteredEstilosVida = useMemo(() => {
    const q = searchEstiloVida.toLowerCase().trim();
    if (!q) return estilosVida;
    return estilosVida.filter(e => e.nombre.toLowerCase().includes(q));
  }, [estilosVida, searchEstiloVida]);

  // Lista de opciones para el selector de reasignación
  const availableTargetOptions = useMemo(() => {
    if (!deleteModal.isOpen || !deleteModal.entity || !deleteModal.item) return [];
    const list = deleteModal.entity === 'pais' ? paises : deleteModal.entity === 'tipoplato' ? tiposPlato : estilosVida;
    return list.filter(o => o.id !== deleteModal.item.id);
  }, [deleteModal, paises, tiposPlato, estilosVida]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-text-muted">Verificando credenciales de administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-8 md:py-12 animate-fade-in">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-border-subtle">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => window.location.href = "/recipes"} 
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-card border border-border-subtle text-text-muted hover:text-brand-primary hover:border-brand-primary/40 transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
            title="Volver a recetas"
            aria-label="Volver a recetas"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">
                Panel de Control
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-text-main tracking-tight">
              Gestión de Taxonomías
            </h1>
            <p className="text-text-muted text-sm md:text-base mt-1">
              Administra países de origen, tipos de plato y estilos de vida con reasignación inteligente de recetas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-surface-card border border-border-subtle text-xs font-bold text-text-muted">
            Total activos: <span className="text-brand-primary font-black">{paises.length + tiposPlato.length + estilosVida.length}</span>
          </div>
        </div>
      </div>

      {/* Grid de 3 Secciones con Scrolles Individuales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start mb-10">

        {/* 1. SECCIÓN PAÍSES */}
        <section className="premium-glass-wrapper bg-surface-card rounded-[2rem] border border-border-subtle shadow-sm overflow-hidden flex flex-col h-[560px]">
          {/* Card Header */}
          <div className="p-5 border-b border-border-subtle bg-surface-muted/40">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-text-main leading-none">Países</h3>
                  <span className="text-xs text-text-subtle font-medium">{filteredPaises.length} de {paises.length} registrados</span>
                </div>
              </div>
              <button 
                onClick={() => openModal('pais')} 
                className="text-xs font-bold text-white bg-brand-primary hover:bg-brand-hover px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" /> Añadir
              </button>
            </div>

            {/* Buscador interno */}
            <div className="relative">
              <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar país..."
                value={searchPais}
                onChange={(e) => setSearchPais(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle rounded-xl text-xs font-medium outline-none focus:border-brand-primary transition-all"
              />
              {searchPais && (
                <button onClick={() => setSearchPais('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-main">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Container Individual */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 divide-y divide-border-subtle/60">
            {isDataLoading ? (
              <div className="p-8 text-center text-xs text-text-muted animate-pulse">Cargando países...</div>
            ) : filteredPaises.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-subtle">
                {searchPais ? 'No se encontraron países con ese nombre.' : 'No hay países registrados.'}
              </div>
            ) : (
              filteredPaises.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-muted/50 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary font-black text-xs flex items-center justify-center shrink-0">
                      {item.nombre.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-text-main text-sm truncate" title={item.nombre}>
                      {item.nombre}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openModal('pais', item)} 
                      className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                      title="Editar país"
                      aria-label={`Editar ${item.nombre}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleStartDelete(item, 'pais')} 
                      className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar país"
                      aria-label={`Eliminar ${item.nombre}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. SECCIÓN TIPOS DE PLATO */}
        <section className="premium-glass-wrapper bg-surface-card rounded-[2rem] border border-border-subtle shadow-sm overflow-hidden flex flex-col h-[560px]">
          {/* Card Header */}
          <div className="p-5 border-b border-border-subtle bg-surface-muted/40">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-text-main leading-none">Tipos de Plato</h3>
                  <span className="text-xs text-text-subtle font-medium">{filteredTiposPlato.length} de {tiposPlato.length} registrados</span>
                </div>
              </div>
              <button 
                onClick={() => openModal('tipoplato')} 
                className="text-xs font-bold text-white bg-brand-primary hover:bg-brand-hover px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" /> Añadir
              </button>
            </div>

            {/* Buscador interno */}
            <div className="relative">
              <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar tipo de plato..."
                value={searchTipoPlato}
                onChange={(e) => setSearchTipoPlato(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle rounded-xl text-xs font-medium outline-none focus:border-brand-primary transition-all"
              />
              {searchTipoPlato && (
                <button onClick={() => setSearchTipoPlato('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-main">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Container Individual */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 divide-y divide-border-subtle/60">
            {isDataLoading ? (
              <div className="p-8 text-center text-xs text-text-muted animate-pulse">Cargando tipos de plato...</div>
            ) : filteredTiposPlato.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-subtle">
                {searchTipoPlato ? 'No se encontraron tipos con ese nombre.' : 'No hay tipos registrados.'}
              </div>
            ) : (
              filteredTiposPlato.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-muted/50 transition-colors group">
                  <span className="font-semibold text-text-main text-sm truncate pr-2" title={item.nombre}>
                    {item.nombre}
                  </span>
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openModal('tipoplato', item)} 
                      className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                      title="Editar tipo"
                      aria-label={`Editar ${item.nombre}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleStartDelete(item, 'tipoplato')} 
                      className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar tipo"
                      aria-label={`Eliminar ${item.nombre}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 3. SECCIÓN ESTILOS DE VIDA */}
        <section className="premium-glass-wrapper bg-surface-card rounded-[2rem] border border-border-subtle shadow-sm overflow-hidden flex flex-col h-[560px]">
          {/* Card Header */}
          <div className="p-5 border-b border-border-subtle bg-surface-muted/40">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-text-main leading-none">Estilos de Vida</h3>
                  <span className="text-xs text-text-subtle font-medium">{filteredEstilosVida.length} de {estilosVida.length} registrados</span>
                </div>
              </div>
              <button 
                onClick={() => openModal('estilovida')} 
                className="text-xs font-bold text-white bg-brand-primary hover:bg-brand-hover px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" /> Añadir
              </button>
            </div>

            {/* Buscador interno */}
            <div className="relative">
              <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar estilo de vida..."
                value={searchEstiloVida}
                onChange={(e) => setSearchEstiloVida(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-input border border-border-subtle text-text-main placeholder:text-text-subtle rounded-xl text-xs font-medium outline-none focus:border-brand-primary transition-all"
              />
              {searchEstiloVida && (
                <button onClick={() => setSearchEstiloVida('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-main">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Container Individual */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 divide-y divide-border-subtle/60">
            {isDataLoading ? (
              <div className="p-8 text-center text-xs text-text-muted animate-pulse">Cargando estilos de vida...</div>
            ) : filteredEstilosVida.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-subtle">
                {searchEstiloVida ? 'No se encontraron estilos con ese nombre.' : 'No hay estilos registrados.'}
              </div>
            ) : (
              filteredEstilosVida.map((item, index) => {
                const dotColors = [
                  'bg-emerald-500', 
                  'bg-amber-500', 
                  'bg-sky-500', 
                  'bg-purple-500', 
                  'bg-rose-500'
                ];
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-muted/50 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[index % dotColors.length]}`}></span>
                      <span className="font-semibold text-text-main text-sm truncate" title={item.nombre}>
                        {item.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal('estilovida', item)} 
                        className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                        title="Editar estilo"
                        aria-label={`Editar ${item.nombre}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleStartDelete(item, 'estilovida')} 
                        className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar estilo"
                        aria-label={`Eliminar ${item.nombre}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>

      {/* Tip Box Informativo */}
      <div className="p-6 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-extrabold text-text-main text-base mb-1">
            Reasignación Segura de Recetas
          </h4>
          <p className="text-text-muted text-sm leading-relaxed">
            Al eliminar un país, tipo de plato o estilo de vida, el sistema detecta automáticamente si existen recetas asociadas y te permite trasladarlas a otra categoría existente. De este modo, evitas errores de integridad y las recetas nunca quedan huérfanas ni con campos vacíos.
          </p>
        </div>
      </div>

      {/* MODAL 1: Crear / Editar Taxonomía */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" 
          onClick={() => !isSaving && setIsModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-card rounded-[2rem] shadow-2xl w-full max-w-md border border-border-subtle overflow-hidden transform transition-all animate-scale-in"
          >
            <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-surface-muted/40">
              <h3 className="text-xl font-serif font-black text-text-main tracking-tight flex items-center gap-2.5">
                <span className="p-1.5 bg-brand-primary/10 text-brand-primary rounded-lg">
                  {formData.id ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </span>
                {formData.id ? 'Editar' : 'Añadir'} {entityLabels[currentEntity]?.singular || 'Taxonomía'}
              </h3>
              <button 
                onClick={() => !isSaving && setIsModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted hover:bg-surface-elevated text-text-muted transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 md:p-8">
              <label className="block text-xs font-bold text-text-subtle mb-2 uppercase tracking-wider">
                Nombre de la Taxonomía
              </label>
              <input 
                type="text"
                autoFocus
                disabled={isSaving}
                className="w-full bg-surface-input border border-border-subtle text-text-main text-base font-semibold rounded-xl px-4 py-3.5 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-text-subtle"
                placeholder={
                  currentEntity === 'pais' ? "Ej. México, Chile, Perú..." : 
                  currentEntity === 'tipoplato' ? "Ej. Almuerzo, Picoteo, Postres..." : 
                  "Ej. Vegano, Sin Gluten, Keto..."
                }
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            
            <div className="px-6 md:px-8 py-5 border-t border-border-subtle flex justify-end gap-3 bg-surface-muted/30">
              <button 
                type="button"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-text-muted hover:bg-surface-muted transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="button"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-primary hover:bg-brand-hover shadow-lg shadow-brand-primary/25 transition-all flex items-center gap-2 disabled:opacity-50"
                onClick={handleSave}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {formData.id ? 'Guardar Cambios' : 'Crear Registro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Eliminar con Reasignación de Recetas */}
      {deleteModal.isOpen && deleteModal.item && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" 
          onClick={() => !deleteModal.isProcessing && setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-card rounded-[2rem] shadow-2xl w-full max-w-lg border border-border-subtle overflow-hidden transform transition-all animate-scale-in"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-red-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main leading-tight">
                    Eliminar {entityLabels[deleteModal.entity]?.singular}
                  </h3>
                  <span className="text-xs text-text-muted">«{deleteModal.item.nombre}»</span>
                </div>
              </div>
              <button 
                onClick={() => !deleteModal.isProcessing && setDeleteModal(prev => ({ ...prev, isOpen: false }))} 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-muted hover:bg-surface-elevated text-text-muted transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6">
              {deleteModal.recipeCount > 0 ? (
                <>
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-text-main leading-relaxed">
                      Se encontraron <strong className="text-amber-500 text-sm font-black">{deleteModal.recipeCount} receta(s)</strong> vinculadas a esta categoría.
                      Para no dejarlas vacías ni romper las búsquedas, puedes trasladarlas a otra existente.
                    </div>
                  </div>

                  {availableTargetOptions.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                          <ArrowRightLeft className="w-4 h-4 text-brand-primary" />
                          ¿Hacia qué categoría deseas trasladar estas recetas?
                        </label>
                        <select
                          disabled={deleteModal.isProcessing}
                          value={deleteModal.targetId}
                          onChange={(e) => setDeleteModal(prev => ({ ...prev, targetId: e.target.value, action: 'reassign' }))}
                          className="w-full bg-surface-input border border-border-subtle text-text-main rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        >
                          {availableTargetOptions.map(opt => (
                            <option key={opt.id} value={opt.id}>
                              {opt.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Opción alternativa: Desvincular */}
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-border-subtle hover:bg-surface-muted/40 cursor-pointer transition-colors text-xs text-text-muted">
                        <input
                          type="checkbox"
                          checked={deleteModal.action === 'unassign'}
                          onChange={(e) => setDeleteModal(prev => ({
                            ...prev,
                            action: e.target.checked ? 'unassign' : 'reassign'
                          }))}
                          className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                        />
                        <span>No trasladar; desvincular recetas y dejarlas sin esta categoría</span>
                      </label>
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted">
                      No hay otra categoría disponible en esta sección. Las recetas quedarán sin asignar.
                    </p>
                  )}
                </>
              ) : (
                <div className="text-sm text-text-muted leading-relaxed">
                  No hay recetas asociadas a <strong>«{deleteModal.item.nombre}»</strong>. 
                  ¿Estás seguro de que deseas eliminar este registro de forma definitiva?
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 md:px-8 py-5 border-t border-border-subtle flex justify-end gap-3 bg-surface-muted/30">
              <button 
                type="button"
                disabled={deleteModal.isProcessing}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-text-muted hover:bg-surface-muted transition-colors"
                onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
              >
                Cancelar
              </button>
              <button 
                type="button"
                disabled={deleteModal.isProcessing}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
                onClick={handleConfirmDelete}
              >
                {deleteModal.isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleteModal.recipeCount > 0 && deleteModal.action === 'reassign' 
                  ? 'Reasignar y Eliminar' 
                  : 'Eliminar Definitivamente'}
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
