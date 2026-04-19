import React, { useState, useRef, useEffect } from "react";
import { Camera, Loader, User, Mail, MapPin } from "lucide-react";
import { Modal, Button, Input, TextArea } from "@heroui/react";
import { toast } from "@heroui/react";
import { updateProfile, uploadAvatar } from '@/lib/profileService';

export default function EditProfileModal({ isOpen, onOpenChange, user, profile, refreshProfile }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempData, setTempData] = useState({
    nombre: "",
    username: "",
    bio: "",
    ubicacion: ""
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile && isOpen) {
      setTempData({
        nombre: profile.nombre || "",
        username: profile.username || "",
        bio: profile.bio || "",
        ubicacion: profile.ubicacion || ""
      });
    }
  }, [profile, isOpen]);


  const handleSave = async (onClose) => {
    if (!user?.id) return;
    setIsSaving(true);
    
    // Validaciones básicas
    if (!tempData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      setIsSaving(false);
      return;
    }
    
    // Limpieza
    const cleanUsername = tempData.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const dataToSave = { ...tempData, username: cleanUsername };

    try {
      await updateProfile(user.id, dataToSave);
      await refreshProfile();
      toast.success("¡Perfil actualizado correctamente!");
      onClose();
    } catch (err) {
      if (err.message.includes("unique_username") || err.code === '23505') {
        toast.error("Este nombre de usuario ya está ocupado");
      } else {
        toast.error(err.message || "Error al guardar cambios");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container scroll="inside">
          <Modal.Dialog className="w-full sm:max-w-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl">
            <Modal.CloseTrigger className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" />
            <Modal.Header className="border-b border-gray-100 dark:border-gray-800 flex flex-col gap-1 px-6 py-4">
              <Modal.Heading className="text-xl font-bold dark:text-white">Editar Perfil</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="px-6 py-6 pb-8">
              <div className="flex flex-col md:flex-row gap-8">

                {/* Form fields */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Nombre Completo" 
                      labelPlacement="outside"
                      placeholder="Ej. Ricardo Valenzuela" 
                      value={tempData.nombre}
                      onChange={(e) => setTempData({...tempData, nombre: e.target.value})}
                      startContent={<User className="w-4 h-4 text-default-400" />}
                      radius="lg"
                    />
                    <Input 
                      label="Username" 
                      labelPlacement="outside"
                      placeholder="chilean_chef" 
                      value={tempData.username}
                      onChange={(e) => setTempData({...tempData, username: e.target.value})}
                      startContent={<span className="text-default-400 text-sm">@</span>}
                      radius="lg"
                    />
                  </div>
                  
                  <Input 
                      label="Ubicación" 
                      labelPlacement="outside"
                      placeholder="Ej. Santiago, Chile" 
                      value={tempData.ubicacion}
                      onChange={(e) => setTempData({...tempData, ubicacion: e.target.value})}
                      startContent={<MapPin className="w-4 h-4 text-default-400" />}
                      radius="lg"
                  />
                  
                  <TextArea
                    label="Biografía"
                    labelPlacement="outside"
                    placeholder="Cuéntanos sobre ti y tu relación con la cocina chilena..."
                    value={tempData.bio}
                    onChange={e => setTempData(p => ({ ...p, bio: e.target.value }))}
                    minRows={4}
                    radius="lg"
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="border-t border-gray-100 dark:border-gray-800 px-6 py-4">
              <Button color="default" variant="light" onPress={() => onOpenChange(false)} className="font-semibold dark:text-gray-300">
                Cancelar
              </Button>
              <Button 
                color="primary" 
                onPress={() => handleSave(() => onOpenChange(false))} 
                isLoading={isSaving} 
                className="font-semibold bg-[#b08968] hover:bg-[#977353] text-white"
              >
                Guardar Cambios
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
