import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Checkbox, toast, Spinner } from "@heroui/react";
import { FolderPlus, Bookmark, X, Plus } from "lucide-react";
import { getCollectionsWithRecipeStatus, createCollection, toggleRecipeInCollection } from "@/lib/collectionService";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function CollectionPickerModal({ isOpen, onOpenChange, recetaId, onSaveComplete }) {
  const { session, user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para nueva colección
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [savingCollection, setSavingCollection] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id && recetaId) {
      loadCollections();
    }
  }, [isOpen, user?.id, recetaId]);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await getCollectionsWithRecipeStatus(user.id, recetaId);
      setCollections(data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar colecciones");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollection = async (coleccionId, isCurrentlySaved) => {
    try {
      // Optimistic update
      setCollections(prev => prev.map(c => 
        c.id === coleccionId ? { ...c, hasRecipe: !isCurrentlySaved } : c
      ));

      const isNowSaved = await toggleRecipeInCollection(coleccionId, recetaId, isCurrentlySaved);
      
      if (isCurrentlySaved) {
        toast.success("Receta eliminada de la colección");
      } else {
        toast.success("Receta añadida a la colección");
      }

      // Notificamos al componente padre si lo necesita
      if (onSaveComplete) {
        onSaveComplete(isNowSaved);
      }
    } catch (err) {
      // Revertir si falla
      setCollections(prev => prev.map(c => 
        c.id === coleccionId ? { ...c, hasRecipe: isCurrentlySaved } : c
      ));
      toast.error("Error al actualizar la colección");
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    setSavingCollection(true);
    try {
      const newCol = await createCollection(user.id, newCollectionName);
      // Tras crearla, añadimos la receta de inmediato
      await toggleRecipeInCollection(newCol.id, recetaId, false);
      
      setNewCollectionName("");
      setIsCreating(false);
      toast.success("Colección creada");
      await loadCollections();
      
      if (onSaveComplete) {
        onSaveComplete(true);
      }
    } catch (err) {
      toast.error("Error al crear la colección");
    } finally {
      setSavingCollection(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} className="bg-black/60 backdrop-blur-md">
        <Modal.Container placement="center">
          <Modal.Dialog className="sm:max-w-md w-full relative bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden">
            
            {/* Custom Close Button */}
            <button 
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-10"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <Modal.Header className="flex flex-col gap-1 border-b border-black/5 dark:border-white/10 px-6 py-5">
              <Modal.Heading className="text-xl font-black text-gray-900 dark:text-white">Guardar en...</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner color="primary" style={{ '--nextui-colors-primary': '#b08968' }} />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Lista de Colecciones */}
                  <div className="max-h-64 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                    {collections.length === 0 && !isCreating ? (
                      <p className="text-sm text-default-500 text-center py-6">No tienes colecciones aún.</p>
                    ) : (
                      collections.map(col => (
                        <div 
                          key={col.id} 
                          onClick={() => handleToggleCollection(col.id, col.hasRecipe)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                            col.hasRecipe 
                              ? 'border-[#b08968] bg-[#b08968]/5 dark:bg-[#b08968]/10' 
                              : 'border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${col.hasRecipe ? 'bg-[#b08968]/20' : 'bg-black/5 dark:bg-white/10 group-hover:bg-black/10 dark:group-hover:bg-white/20'}`}>
                              <Bookmark className={`w-4 h-4 ${col.hasRecipe ? 'fill-[#b08968] text-[#b08968]' : 'text-gray-500 dark:text-gray-400'}`} />
                            </div>
                            <span className={`font-semibold text-sm ${col.hasRecipe ? 'text-[#b08968]' : 'text-gray-800 dark:text-gray-200'}`}>{col.nombre}</span>
                          </div>
                          <Checkbox 
                            isSelected={col.hasRecipe}
                            color="primary"
                            onChange={() => {}} // Manejado por el onClick del div padre
                            style={{ '--nextui-colors-primary': '#b08968' }}
                            classNames={{ wrapper: "before:border-[#b08968]" }}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Crear Nueva Colección */}
                  {isCreating ? (
                    <div className="flex items-center gap-2 mt-4 pt-5 border-t border-black/5 dark:border-white/10">
                      <Input 
                        autoFocus
                        size="md"
                        placeholder="Nueva colección..."
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                        classNames={{
                          inputWrapper: "bg-black/5 dark:bg-white/5 border-transparent focus-within:!border-[#b08968] focus-within:!bg-transparent"
                        }}
                      />
                      <Button isIconOnly size="md" color="primary" style={{backgroundColor: '#b08968'}} onClick={handleCreateCollection} isLoading={savingCollection}>
                        {(!savingCollection) && <Check className="w-5 h-5 text-white" />}
                      </Button>
                      <Button isIconOnly size="md" variant="flat" className="bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={() => setIsCreating(false)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="flat" 
                      className="w-full justify-start mt-2 font-bold py-6 text-[#b08968] bg-[#b08968]/10 hover:bg-[#b08968]/20 transition-colors rounded-2xl border border-transparent hover:border-[#b08968]/30" 
                      startContent={<Plus className="w-5 h-5" />}
                      onPress={() => setIsCreating(true)}
                    >
                      Crear nueva colección
                    </Button>
                  )}
                </div>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

// Dummy check icon if lucid-react not imported
function Check(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
