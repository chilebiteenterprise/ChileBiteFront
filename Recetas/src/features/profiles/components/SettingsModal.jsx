import React, { useState } from "react";
import { Modal, Button, Accordion, AccordionItem } from "@heroui/react";
import { X, KeyRound, Lock, Trash2, Mail, ShieldCheck, Eye, EyeOff, Loader } from "lucide-react";
import { toast } from "@heroui/react";
import { supabase } from '@/lib/supabaseClient';
import { deleteAccount } from '@/lib/profileService';

export default function SettingsModal({ isOpen, onOpenChange, user, profile, linkGoogleToCurrentAccount }) {
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "", show: false });
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Link/Unlink Google Logic
  const isGoogleLinked = user?.identities?.some(id => id.provider === "google");
  const isOnlyGoogle = user?.identities?.length === 1 && user.identities[0].provider === "google";

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passwordForm.password !== passwordForm.confirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setIsSettingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.password });
      if (error) throw error;
      toast.success("¡Contraseña establecida! Ya puedes iniciar sesión con email.");
      setPasswordForm({ password: "", confirm: "", show: false });
    } catch (err) {
      toast.error(err.message || "Error al establecer la contraseña");
    } finally {
      setIsSettingPassword(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      await linkGoogleToCurrentAccount();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setIsDeleting(true);
    try {
      await deleteAccount(user.id);
      toast.success("Cuenta eliminada permanentemente");
      // Redirigir y limpiar
      window.location.href = '/';
    } catch (err) {
      toast.error("Error al eliminar la cuenta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
        <Modal.Container>
          <Modal.Dialog className="w-full sm:max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl">
            <Modal.CloseTrigger className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" />
            <Modal.Header className="border-b border-gray-100 dark:border-gray-800 flex flex-col gap-1 px-6 py-4">
              <Modal.Heading className="text-xl font-bold dark:text-white">Ajustes de Cuenta</Modal.Heading>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Privacidad, seguridad y conexiones</p>
            </Modal.Header>
            <Modal.Body className="px-6 py-4">
              <Accordion variant="splitted" className="px-0">
                {/* ─── SEGURIDAD (SOLO GOOGLE) ─── */}
                {isOnlyGoogle && (
                  <AccordionItem 
                    key="password" 
                    aria-label="Contraseña" 
                    title={<div className="flex items-center gap-3"><KeyRound className="w-5 h-5 text-violet-500"/><span className="font-semibold text-gray-800 dark:text-gray-200">Añadir Contraseña</span></div>}
                    subtitle="Inicia sesión con email además de Google"
                  >
                    <form onSubmit={handleSetPassword} className="space-y-4 pt-2">
                       <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Tu cuenta actualmente solo usa Google. Crea una contraseña para ingresar con <span className="font-semibold">{profile?.email}</span>.
                      </p>
                      <div>
                        <div className="relative">
                          <input
                            type={passwordForm.show ? "text" : "password"}
                            value={passwordForm.password}
                            onChange={e => setPasswordForm(p => ({ ...p, password: e.target.value }))}
                            placeholder="Nueva contraseña (mín 6)"
                            className="w-full px-4 py-3 pr-10 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-violet-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setPasswordForm(p => ({ ...p, show: !p.show }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {passwordForm.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <input
                          type={passwordForm.show ? "text" : "password"}
                          value={passwordForm.confirm}
                          onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                          placeholder="Confirmar contraseña"
                          className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-violet-500 transition-colors"
                        />
                      </div>
                      <Button
                        type="submit"
                        color="secondary"
                        isLoading={isSettingPassword}
                        isDisabled={!passwordForm.password || !passwordForm.confirm}
                        className="w-full font-semibold"
                        startContent={!isSettingPassword && <Lock className="w-4 h-4" />}
                      >
                        Establecer Contraseña
                      </Button>
                    </form>
                  </AccordionItem>
                )}

                {/* ─── CONEXIONES SOCIALES ─── */}
                <AccordionItem 
                    key="connections" 
                    aria-label="Conexiones" 
                    title={<div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-blue-500"/><span className="font-semibold text-gray-800 dark:text-gray-200">Cuentas Vinculadas</span></div>}
                    subtitle="Gestiona métodos de inicio de sesión"
                >
                  <div className="pt-2 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold flex items-center gap-2 dark:text-white">
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Google
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {isGoogleLinked ? "Vinculado" : "No vinculado"}
                        </span>
                      </div>
                      
                      {!isGoogleLinked ? (
                        <Button size="sm" color="primary" variant="flat" onClick={handleLinkGoogle} className="font-semibold">
                          Vincular
                        </Button>
                      ) : (
                         <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                           Conectado
                         </span>
                      )}
                    </div>
                  </div>
                </AccordionItem>

                {/* ─── ZONA DE PELIGRO ─── */}
                <AccordionItem 
                    key="danger" 
                    aria-label="Zona de Peligro" 
                    title={<div className="flex items-center gap-3"><Trash2 className="w-5 h-5 text-red-500"/><span className="font-semibold text-red-600 dark:text-red-400">Zona de Peligro</span></div>}
                >
                  <div className="pt-2">
                    <Button 
                      color="danger" 
                      variant="flat" 
                      fullWidth
                      className="font-semibold justify-start mt-2"
                      startContent={<Trash2 className="w-4 h-4"/>}
                      onClick={handleDeleteAccount}
                      isLoading={isDeleting}
                    >
                      Eliminar Cuenta Permanentemente
                    </Button>
                  </div>
                </AccordionItem>
              </Accordion>
            </Modal.Body>
            <Modal.Footer className="border-t border-gray-100 dark:border-gray-800 px-6 py-4">
              <Button color="default" variant="light" onPress={() => onOpenChange(false)} className="font-semibold dark:text-gray-300">
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
