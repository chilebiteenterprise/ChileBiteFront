import React, { useState } from 'react';
import { Tooltip, Modal, Button, useOverlayState } from "@heroui/react";
import { useAuth } from '@/features/auth/context/AuthContext';

export default function AdminFloatingMenu({ selectedRecipes = [], onDeleteSuccess, onClearSelection }) {
    const { session } = useAuth();
    const state = useOverlayState();
    const [isDeleting, setIsDeleting] = useState(false);

    const hasSelection = selectedRecipes?.length > 0;
    const isSingleSelection = selectedRecipes?.length === 1;

    const handleDelete = async (onClose) => {
        setIsDeleting(true);
        try {
            const token = session?.access_token || localStorage.getItem("access_token");
            const headers = { "Authorization": `Bearer ${token}` };
            
            for (const id of selectedRecipes) {
                await fetch(`http://127.0.0.1:8000/api/recetas/${id}/`, {
                    method: 'DELETE',
                    headers
                });
            }
            onDeleteSuccess && onDeleteSuccess(selectedRecipes);
            onClose();
        } catch (error) {
            console.error("Error al eliminar", error);
        } finally {
            setIsDeleting(false);
        }
    };
    // Array dinámico de opciones basado en la lógica. Fácilmente expandible a "mas o menos de 5".
    const adminActions = [
        {
            id: 'new_recipe',
            label: "Crear Nueva Receta",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            ),
            action: () => window.location.href = '/admin/recipe-editor',
            color: "text-white", 
            bg: "bg-[#A0522D]",
            bgHover: "hover:bg-[#8B4513]"
        },
        {
            id: 'taxonomies',
            label: "Gestionar Clasificaciones",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            ),
            action: () => window.location.href = '/admin/taxonomy-manager',
            color: "text-white", 
            bg: "bg-[#4A5568]",
            bgHover: "hover:bg-[#2D3748]"
        }
    ];

    if (hasSelection) {
        if (isSingleSelection) {
            adminActions.push({
                id: 'edit_recipe',
                label: `Editar Receta (${selectedRecipes[0]})`,
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                ),
                action: () => window.location.href = `/admin/recipe-editor?id=${selectedRecipes[0]}`,
                color: "text-white", 
                bg: "bg-blue-600",
                bgHover: "hover:bg-blue-700"
            });
        }

        adminActions.push({
            id: 'delete_recipes',
            label: `Eliminar (${selectedRecipes.length})`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            ),
            action: state.open,
            color: "text-white", 
            bg: "bg-red-600",
            bgHover: "hover:bg-red-700"
        });
    }

    return (
        <div className="sticky bottom-6 z-50 flex justify-center w-full pointer-events-none px-4">
            <div className="pointer-events-auto bg-white dark:bg-[#1a1d24] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-gray-800 rounded-[2rem] px-5 py-3 flex items-center gap-3 transition-colors">
                
                {/* Admin Badge Prefix */}
                <div className="pr-4 mr-1 border-r border-gray-200 dark:border-gray-800 flex items-center select-none cursor-pointer" onClick={() => hasSelection && onClearSelection && onClearSelection()} title={hasSelection ? "Limpiar selección" : ""}>
                    <span className="text-xs font-black tracking-widest text-[#A0522D] dark:text-[#E89E75] uppercase flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin
                    </span>
                </div>

                {/* Dinamic Icons */}
                {adminActions.map((item) => (
                    <Tooltip key={item.id} content={item.label} placement="top" className="font-semibold text-xs rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 mt-1">
                        <button
                            onClick={item.action}
                            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 ${item.color} ${item.bg} ${item.bgHover} shadow-md hover:scale-105 hover:-translate-y-1 active:scale-95`}
                            aria-label={item.label}
                        >
                            {item.icon}
                        </button>
                    </Tooltip>
                ))}
            </div>

            <Modal>
                <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen}>
                    <Modal.Container>
                        <Modal.Dialog>
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Heading className="text-red-600">Confirmar Eliminación</Modal.Heading>
                            </Modal.Header>
                            <Modal.Body>
                                <p>¿Estás seguro de que deseas eliminar {selectedRecipes.length} receta(s)? Esta acción no se puede deshacer.</p>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="light" onPress={state.close} disabled={isDeleting}>Cancelar</Button>
                                <Button color="danger" onPress={() => handleDelete(state.close)} isLoading={isDeleting}>
                                    Eliminar Definitivamente
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </div>
    );
}
