import React, { useState, useRef, useEffect } from "react";
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import {
  Camera, MapPin, Calendar, Bookmark,
  Loader, UserCircle2, Pencil, Save, X, Settings
} from "lucide-react";
import { Button, Skeleton, toast } from "@heroui/react";
import { updateProfile } from '@/lib/profileService';
import { getUserCollections, createCollection } from '@/lib/collectionService';
import { Check } from "lucide-react";

const BRAND = "#b08968";

/* ──────────────────────────────────────────────────────────────
   SKELETON
────────────────────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-6">
      <div className="bg-surface rounded-2xl border border-border p-8">
        <div className="flex items-start gap-8">
          <Skeleton className="w-28 h-28 rounded-full shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <Skeleton className="w-56 h-7 rounded-lg" />
            <Skeleton className="w-36 h-4 rounded-lg" />
            <Skeleton className="w-full h-4 rounded-lg" />
            <Skeleton className="w-3/4 h-4 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   FIELD
────────────────────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, multiline = false }) {
  const base = "w-full px-4 py-3 rounded-xl text-sm border border-border bg-black/5 dark:bg-white/5 text-foreground placeholder-default-500 focus:outline-none focus:border-[#b08968] focus:ring-2 focus:ring-[#b08968]/20 focus:bg-black/10 dark:focus:bg-white/10 transition-all";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-default-500 uppercase tracking-wider">{label}</label>
      {multiline
        ? <textarea rows={3} value={value} onChange={onChange} placeholder={placeholder} className={base + " resize-none"} />
        : <input type="text" value={value} onChange={onChange} placeholder={placeholder} className={base} />}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   PROFILE CONTENT
────────────────────────────────────────────────────────────── */
function ProfileContent() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [editData, setEditData] = useState({
    nombres: "", apellido_paterno: "", apellido_materno: "",
    username: "", bio: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [savingCollection, setSavingCollection] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditData({
        nombres: profile.nombres || "",
        apellido_paterno: profile.apellido_paterno || "",
        apellido_materno: profile.apellido_materno || "",
        username: profile.username || "",
        bio: profile.bio || ""
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user?.id) {
      getUserCollections(user.id)
        .then(setCollections)
        .catch(err => console.error(err))
        .finally(() => setLoadingCollections(false));
    }
  }, [user?.id]);

  if (authLoading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <UserCircle2 className="w-16 h-16 text-default-300" />
        <h2 className="text-2xl font-bold text-foreground">Sesión Requerida</h2>
        <p className="text-default-500">Inicia sesión para ver tu perfil.</p>
        <Button as="a" href="/auth/register" className="text-white font-bold" style={{ backgroundColor: BRAND }}>
          Ir al Login
        </Button>
      </div>
    );
  }

  const joinedDate = new Date(profile.created_at || user?.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const fullName = [profile.nombres, profile.apellido_paterno, profile.apellido_materno].filter(Boolean).join(" ") || "Usuario ChileBite";
  
  // Priorizar foto de Google, luego fallback a inicial
  const currentAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || profile.avatar_url;

  const handleSave = async () => {
    if (!editData.nombres.trim()) { toast.error("El nombre es obligatorio"); return; }
    setIsSaving(true);
    try {
      const clean = { ...editData, username: editData.username.toLowerCase().replace(/[^a-z0-9_]/g, "") };
      await updateProfile(user.id, clean);
      await refreshProfile();
      toast.success("¡Perfil actualizado!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !user?.id) return;
    setSavingCollection(true);
    try {
      const newCol = await createCollection(user.id, newCollectionName);
      // Actualizamos listado
      setCollections(prev => [{ ...newCol, portadas: [], total_recetas: 0 }, ...prev]);
      setNewCollectionName("");
      setIsCreatingCollection(false);
      toast.success("Colección creada satisfactoriamente");
    } catch (err) {
      toast.error("Error al crear la colección");
    } finally {
      setSavingCollection(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      nombres: profile.nombres || "",
      apellido_paterno: profile.apellido_paterno || "",
      apellido_materno: profile.apellido_materno || "",
      username: profile.username || "",
      bio: profile.bio || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

      {/* ═══ PROFILE CARD ═══ */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="p-8">

          {/* Top: Avatar + info/form + actions */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-7">

            {/* Avatar */}
            <div className="relative shrink-0 self-start">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 bg-default flex items-center justify-center shadow-md"
                style={{ borderColor: BRAND }}>
                {currentAvatar ? (
                  <img src={currentAvatar} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-default-400">{(profile.nombres || "?").charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Info or Edit fields */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nombres" value={editData.nombres} placeholder="María"
                      onChange={e => setEditData(p => ({ ...p, nombres: e.target.value }))} />
                    <Field label="Nombre de usuario" value={editData.username} placeholder="maria_chef"
                      onChange={e => setEditData(p => ({ ...p, username: e.target.value }))} />
                    <Field label="Apellido paterno" value={editData.apellido_paterno} placeholder="González"
                      onChange={e => setEditData(p => ({ ...p, apellido_paterno: e.target.value }))} />
                    <Field label="Apellido materno" value={editData.apellido_materno} placeholder="Valenzuela"
                      onChange={e => setEditData(p => ({ ...p, apellido_materno: e.target.value }))} />
                  </div>
                  <Field label="Biografía" value={editData.bio} multiline
                    placeholder="Cuéntale a la comunidad sobre tus gustos culinarios…"
                    onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))} />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-black text-foreground leading-tight">{fullName}</h1>
                  {profile.username && (
                    <p className="text-sm font-semibold mt-1" style={{ color: BRAND }}>@{profile.username}</p>
                  )}
                  {profile.bio && (
                    <p className="mt-4 text-sm leading-relaxed text-default-600 max-w-xl">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-5 mt-4">
                    {profile.role === 'admin' && (
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#b08968] bg-[#b08968]/10 border border-[#b08968]/20 rounded-full">
                        Admin
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-default-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: BRAND }} />
                      <span>Miembro desde {joinedDate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              {isEditing ? (
                <>
                  <button onClick={handleSave} disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                    style={{ backgroundColor: BRAND }}>
                    {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </button>
                  <button onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-default-600 border border-border hover:bg-default-hover transition-colors">
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all"
                    style={{ backgroundColor: BRAND }}>
                    <Pencil className="w-4 h-4" />
                    Editar perfil
                  </button>
                  <a href="/profile/settings"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-default-600 border border-border hover:bg-default-hover transition-colors">
                    <Settings className="w-4 h-4" />
                    Ajustes
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          {!isEditing && (
            <div className="flex gap-8 mt-8 pt-6 border-t border-divider">
              <div>
                <p className="text-2xl font-black text-foreground">{collections.reduce((acc, col) => acc + col.total_recetas, 0)}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-default-500 mt-0.5">Guardadas</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{collections.length}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-default-500 mt-0.5">Colecciones</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ RECETAS GUARDADAS ═══ */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: BRAND + "1a" }}>
              <Bookmark className="w-4 h-4" style={{ color: BRAND }} />
            </div>
            <h2 className="text-lg font-black text-foreground">Mis Colecciones</h2>
            <span className="text-xs text-default-500 font-semibold bg-default px-3 py-1 rounded-full">
              {collections.length}
            </span>
          </div>
          {isCreatingCollection ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-3 duration-300">
              <input 
                autoFocus
                className="px-4 py-2 rounded-xl text-sm border-2 border-[#b08968]/30 bg-white dark:bg-gray-800 focus:outline-none focus:border-[#b08968] focus:ring-4 focus:ring-[#b08968]/10 transition-all w-48 shadow-sm"
                placeholder="Nombre de colección..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              />
              <button 
                disabled={savingCollection} 
                onClick={handleCreateCollection} 
                className="size-10 flex items-center justify-center rounded-xl text-white bg-[#b08968] hover:bg-[#977353] transition-all shadow-md active:scale-95 disabled:opacity-50"
                title="Crear"
              >
                {savingCollection ? <Loader className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 stroke-[3px]" />}
              </button>
              <button 
                onClick={() => setIsCreatingCollection(false)} 
                className="size-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                title="Cancelar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreatingCollection(true)} 
              className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#b08968] bg-[#b08968]/5 hover:bg-[#b08968] hover:text-white transition-all duration-300 border border-[#b08968]/20 shadow-sm active:scale-95"
            >
              <div className="size-5 rounded-full bg-[#b08968]/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 stroke-[3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              Nueva Colección
            </button>
          )}
        </div>

        {loadingCollections ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {collections.map((col) => (
              <div 
                key={col.id} 
                onClick={() => window.location.href = `/profile/collection?id=${col.id}&name=${encodeURIComponent(col.nombre)}`}
                className="flex flex-col gap-2 cursor-pointer group"
              >
                <div className="aspect-square bg-surface border border-border rounded-xl flex flex-wrap shadow-sm overflow-hidden group-hover:border-[#b08968]/50 group-hover:shadow-md transition-all">
                   {col.portadas && col.portadas.length > 0 ? (
                     col.portadas.map((img, i) => (
                       <div key={i} className={`h-1/2 w-1/2 bg-gray-100 border-b border-r border-[#b08968]/20 ${col.portadas.length === 1 ? 'h-full w-full' : ''}`}>
                         <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                       </div>
                     ))
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                       <Bookmark className="w-8 h-8 opacity-20" />
                     </div>
                   )}
                </div>
                <div>
                   <h3 className="text-sm font-bold text-foreground leading-tight">{col.nombre}</h3>
                   <p className="text-[11px] text-default-500 font-medium mt-0.5">{col.total_recetas} recetas</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: BRAND + "1a" }}>
              <Bookmark className="w-7 h-7" style={{ color: BRAND }} />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">Aún no tienes colecciones</h3>
            <p className="text-sm text-default-500 max-w-xs mx-auto">
              Guarda tus recetas favoritas en colecciones para organizarlas mejor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PerfilClient() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
}
