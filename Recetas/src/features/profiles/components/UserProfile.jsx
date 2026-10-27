import React, { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@/features/auth/context/AuthContext";
import {
  Calendar,
  Bookmark,
  Loader,
  UserCircle2,
  Pencil,
  Save,
  X,
  Settings,
  Check,
  Plus,
} from "lucide-react";
import { Skeleton, toast } from "@heroui/react";
import BlobatarAvatar from "@/shared/ui/BlobatarAvatar";
import { updateProfile } from "@/lib/profileService";
import { getUserCollections, createCollection } from "@/lib/collectionService";

/* ──────────────────────────────────────────────────────────────
   SKELETON
────────────────────────────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div className="bg-white dark:bg-[#202026] rounded-3xl border border-border-subtle dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
          <Skeleton className="w-28 h-28 rounded-full shrink-0" />
          <div className="flex-1 space-y-3 pt-2 w-full">
            <Skeleton className="w-56 h-8 rounded-xl" />
            <Skeleton className="w-32 h-4 rounded-lg" />
            <Skeleton className="w-full max-w-md h-4 rounded-lg" />
            <Skeleton className="w-2/3 max-w-sm h-4 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="w-48 h-6 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   FIELD
────────────────────────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, multiline = false }) {
  const base =
    "w-full px-4 py-3 rounded-xl text-sm border border-border-strong/40 dark:border-zinc-700/80 bg-white dark:bg-[#18181d] text-text-main dark:text-zinc-100 placeholder-text-subtle/40 dark:placeholder-zinc-500 focus:outline-none focus:border-brand-primary dark:focus:border-[#f0a262] focus:ring-2 focus:ring-brand-primary/15 dark:focus:ring-[#f0a262]/20 transition-all shadow-xs";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-text-muted dark:text-zinc-400 uppercase tracking-wider">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={base + " resize-none"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   PROFILE CONTENT
────────────────────────────────────────────────────────────── */
function ProfileContent() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [editData, setEditData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    username: "",
    bio: "",
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
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user?.id) {
      getUserCollections(user.id)
        .then(setCollections)
        .catch((err) => console.error(err))
        .finally(() => setLoadingCollections(false));
    }
  }, [user?.id]);

  if (authLoading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-brand-primary/10 dark:bg-[#f0a262]/10 text-brand-primary dark:text-[#f0a262]">
          <UserCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-text-main dark:text-zinc-100">
          Sesión Requerida
        </h2>
        <p className="text-sm text-text-muted dark:text-zinc-400 max-w-sm">
          Inicia sesión para ver y gestionar tu perfil de usuario y tus colecciones.
        </p>
        <button
          onClick={() => {
            if (typeof window !== "undefined" && typeof window.abrirLoginNavbar === "function") {
              window.abrirLoginNavbar();
            } else {
              window.location.href = "/auth/login";
            }
          }}
          className="mt-2 px-6 py-2.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-hover dark:bg-[#f0a262] dark:hover:bg-[#ffb87a] dark:text-[#171310] transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  const joinedDate = new Date(profile.created_at || user?.created_at).toLocaleDateString(
    "es-ES",
    { month: "long", year: "numeric" }
  );
  const fullName =
    [profile.nombres, profile.apellido_paterno, profile.apellido_materno]
      .filter(Boolean)
      .join(" ") || "Usuario ChileBite";

  // Priorizar foto de Google, luego avatar_url
  const currentAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    profile.avatar_url;

  const handleSave = async () => {
    if (!editData.nombres.trim()) {
      toast.danger("El nombre es obligatorio");
      return;
    }
    setIsSaving(true);
    try {
      const clean = {
        ...editData,
        username: editData.username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      };
      await updateProfile(user.id, clean);
      await refreshProfile();
      toast.success("¡Perfil actualizado!");
      setIsEditing(false);
    } catch (err) {
      toast.danger(err.message || "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !user?.id) return;
    setSavingCollection(true);
    try {
      const newCol = await createCollection(user.id, newCollectionName);
      setCollections((prev) => [
        { ...newCol, portadas: [], total_recetas: 0 },
        ...prev,
      ]);
      setNewCollectionName("");
      setIsCreatingCollection(false);
      toast.success("Colección creada satisfactoriamente");
    } catch (err) {
      toast.danger("Error al crear la colección");
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
      bio: profile.bio || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="w-full">
      {/* ═══ PROFILE CARD (Sección de datos del usuario - En modo oscuro preserva su color plomo) ═══ */}
      <div className="bg-white dark:bg-[#202026] border border-border-subtle dark:border-zinc-800 rounded-3xl shadow-sm dark:shadow-black/25 overflow-hidden mb-10 transition-colors">
        <div className="p-6 sm:p-8">
          {/* Top: Avatar + info/form + actions */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0 self-start">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-brand-primary dark:border-[#f0a262] bg-surface-muted dark:bg-zinc-800 flex items-center justify-center shadow-md">
                <BlobatarAvatar
                  src={currentAvatar}
                  name={profile?.username || user?.user_metadata?.user_name || user?.user_metadata?.full_name || user?.email || fullName || "Usuario"}
                  size={112}
                  rounded="rounded-full"
                  className="w-full h-full"
                  alt={fullName}
                />
              </div>
            </div>

            {/* Info or Edit fields */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Nombres"
                      value={editData.nombres}
                      placeholder="María"
                      onChange={(e) =>
                        setEditData((p) => ({ ...p, nombres: e.target.value }))
                      }
                    />
                    <Field
                      label="Nombre de usuario"
                      value={editData.username}
                      placeholder="maria_chef"
                      onChange={(e) =>
                        setEditData((p) => ({ ...p, username: e.target.value }))
                      }
                    />
                    <Field
                      label="Apellido paterno"
                      value={editData.apellido_paterno}
                      placeholder="González"
                      onChange={(e) =>
                        setEditData((p) => ({
                          ...p,
                          apellido_paterno: e.target.value,
                        }))
                      }
                    />
                    <Field
                      label="Apellido materno"
                      value={editData.apellido_materno}
                      placeholder="Valenzuela"
                      onChange={(e) =>
                        setEditData((p) => ({
                          ...p,
                          apellido_materno: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Field
                    label="Biografía"
                    value={editData.bio}
                    multiline
                    placeholder="Cuéntale a la comunidad sobre tus gustos culinarios…"
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, bio: e.target.value }))
                    }
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-text-main dark:text-zinc-100 tracking-tight leading-tight">
                    {fullName}
                  </h1>
                  {profile.username && (
                    <p className="text-sm font-bold text-brand-primary dark:text-[#f0a262] mt-0.5">
                      @{profile.username}
                    </p>
                  )}
                  {profile.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-text-muted dark:text-zinc-300 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    {profile.role === "admin" && (
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary dark:text-[#f0a262] bg-brand-primary/10 dark:bg-[#f0a262]/15 border border-brand-primary/25 dark:border-[#f0a262]/30 rounded-full">
                        Admin
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted dark:text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-brand-primary dark:text-[#f0a262]" />
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
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-hover dark:bg-[#f0a262] dark:hover:bg-[#ffb87a] dark:text-[#171310] shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {isSaving ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-text-muted dark:text-zinc-300 bg-surface-muted/60 dark:bg-zinc-800/80 border border-border-subtle dark:border-zinc-700 hover:bg-surface-muted dark:hover:bg-zinc-700 transition-all active:scale-95 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-hover dark:bg-[#f0a262] dark:hover:bg-[#ffb87a] dark:text-[#171310] shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar perfil
                  </button>
                  <a
                    href="/profile/settings"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-text-muted dark:text-zinc-300 bg-surface-muted/60 dark:bg-zinc-800/80 border border-border-subtle dark:border-zinc-700 hover:bg-surface-muted dark:hover:bg-zinc-700 transition-all active:scale-95 text-center"
                  >
                    <Settings className="w-4 h-4" />
                    Ajustes
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          {!isEditing && (
            <div className="flex items-center gap-8 mt-8 pt-6 border-t border-border-subtle dark:border-zinc-800/90">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-text-main dark:text-zinc-100">
                  {collections.reduce(
                    (acc, col) => acc + (col.total_recetas || 0),
                    0
                  )}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted dark:text-zinc-400 mt-0.5">
                  Recetas Guardadas
                </p>
              </div>
              <div className="w-px h-10 bg-border-subtle dark:bg-zinc-800 self-center" />
              <div>
                <p className="text-2xl sm:text-3xl font-black text-text-main dark:text-zinc-100">
                  {collections.length}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted dark:text-zinc-400 mt-0.5">
                  Colecciones
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ RECETAS GUARDADAS (Mis Colecciones) ═══ */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-primary/10 dark:bg-[#f0a262]/15 text-brand-primary dark:text-[#f0a262]">
              <Bookmark className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-text-main dark:text-zinc-100 tracking-tight">
              Mis Colecciones
            </h2>
            <span className="text-xs font-bold text-text-muted dark:text-zinc-400 bg-surface-muted dark:bg-zinc-800 px-3 py-1 rounded-full border border-border-subtle/50 dark:border-zinc-700/50">
              {collections.length}
            </span>
          </div>

          {isCreatingCollection ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-3 duration-300">
              <input
                autoFocus
                className="px-4 py-2.5 rounded-xl text-sm border-2 border-brand-primary/30 dark:border-[#f0a262]/40 bg-white dark:bg-[#18181d] text-text-main dark:text-zinc-100 placeholder-text-subtle/50 dark:placeholder-zinc-500 focus:outline-none focus:border-brand-primary dark:focus:border-[#f0a262] focus:ring-4 focus:ring-brand-primary/10 dark:focus:ring-[#f0a262]/15 transition-all w-52 sm:w-60 shadow-sm"
                placeholder="Nombre de colección..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCreateCollection()
                }
              />
              <button
                disabled={savingCollection}
                onClick={handleCreateCollection}
                className="size-10 flex items-center justify-center rounded-xl text-white bg-brand-primary hover:bg-brand-hover dark:bg-[#f0a262] dark:hover:bg-[#ffb87a] dark:text-[#171310] transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Crear"
              >
                {savingCollection ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 stroke-[3px]" />
                )}
              </button>
              <button
                onClick={() => setIsCreatingCollection(false)}
                className="size-10 flex items-center justify-center rounded-xl text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 dark:text-zinc-400 transition-all active:scale-95 cursor-pointer"
                title="Cancelar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreatingCollection(true)}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-brand-primary dark:text-[#f0a262] bg-brand-primary/10 dark:bg-[#f0a262]/10 hover:bg-brand-primary hover:text-white dark:hover:bg-[#f0a262] dark:hover:text-[#171310] transition-all duration-300 border border-brand-primary/20 dark:border-[#f0a262]/30 shadow-xs active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <div className="size-5 rounded-full bg-brand-primary/15 dark:bg-[#f0a262]/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
              </div>
              Nueva Colección
            </button>
          )}
        </div>

        {loadingCollections ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {collections.map((col) => (
              <div
                key={col.id}
                onClick={() =>
                  (window.location.href = `/profile/collection?id=${
                    col.id
                  }&name=${encodeURIComponent(col.nombre)}`)
                }
                className="flex flex-col gap-2.5 cursor-pointer group"
              >
                <div className="aspect-square bg-white dark:bg-[#202026] border border-border-subtle dark:border-zinc-800 rounded-2xl flex flex-wrap shadow-xs overflow-hidden group-hover:border-brand-primary/60 dark:group-hover:border-[#f0a262]/60 group-hover:shadow-md transition-all duration-300">
                  {col.portadas && col.portadas.length > 0 ? (
                    col.portadas.map((img, i) => (
                      <div
                        key={i}
                        className={`h-1/2 w-1/2 bg-surface-muted/30 dark:bg-zinc-800/40 border-b border-r border-border-subtle/60 dark:border-zinc-800 overflow-hidden ${
                          col.portadas.length === 1 ? "h-full w-full" : ""
                        }`}
                      >
                        <img
                          src={img}
                          alt="Miniatura"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-muted/30 dark:bg-zinc-800/40 text-brand-primary/30 dark:text-[#f0a262]/30 group-hover:scale-110 transition-transform duration-300">
                      <Bookmark className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main dark:text-zinc-100 group-hover:text-brand-primary dark:group-hover:text-[#f0a262] transition-colors leading-tight line-clamp-1">
                    {col.nombre}
                  </h3>
                  <p className="text-xs text-text-muted dark:text-zinc-400 font-medium mt-0.5">
                    {col.total_recetas || 0}{" "}
                    {col.total_recetas === 1 ? "receta" : "recetas"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white dark:bg-[#202026] border border-border-subtle dark:border-zinc-800 rounded-3xl shadow-xs transition-colors">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-brand-primary/10 dark:bg-[#f0a262]/15 text-brand-primary dark:text-[#f0a262]">
              <Bookmark className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-text-main dark:text-zinc-100 mb-1">
              Aún no tienes colecciones
            </h3>
            <p className="text-sm text-text-muted dark:text-zinc-400 max-w-sm mx-auto">
              Guarda tus recetas favoritas en colecciones para organizarlas y acceder a ellas rápidamente.
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
