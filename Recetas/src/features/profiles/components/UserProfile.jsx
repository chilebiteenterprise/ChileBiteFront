import React, { useState, useRef, useEffect } from "react";
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import {
  Camera, MapPin, Calendar, Bookmark,
  Loader, UserCircle2, Pencil, Save, X, Settings
} from "lucide-react";
import { Button, Skeleton, toast } from "@heroui/react";
import { updateProfile, uploadAvatar } from '@/lib/profileService';

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
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [editData, setEditData] = useState({
    nombres: "", apellido_paterno: "", apellido_materno: "",
    username: "", bio: "", avatar_url: ""
  });

  useEffect(() => {
    if (profile) {
      setEditData({
        nombres: profile.nombres || "",
        apellido_paterno: profile.apellido_paterno || "",
        apellido_materno: profile.apellido_materno || "",
        username: profile.username || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || ""
      });
    }
  }, [profile]);

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
  const currentAvatar = editData.avatar_url || profile.avatar_url;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("La imagen debe pesar menos de 2 MB"); return; }
    setIsUploading(true);
    try {
      const url = await uploadAvatar(user.id, file);
      setEditData(p => ({ ...p, avatar_url: url }));
    } catch { toast.error("Error al subir la imagen"); }
    finally { setIsUploading(false); }
  };

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

  const handleCancel = () => {
    setEditData({
      nombres: profile.nombres || "",
      apellido_paterno: profile.apellido_paterno || "",
      apellido_materno: profile.apellido_materno || "",
      username: profile.username || "",
      bio: profile.bio || "",
      avatar_url: profile.avatar_url || ""
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
                {isUploading ? (
                  <Loader className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
                ) : currentAvatar ? (
                  <img src={currentAvatar} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-default-400">{(profile.nombres || "?").charAt(0).toUpperCase()}</span>
                )}
              </div>
              {isEditing && (
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                  style={{ backgroundColor: BRAND }}>
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
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
                <p className="text-2xl font-black text-foreground">{profile.recetas_favoritas?.length || 0}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-default-500 mt-0.5">Guardadas</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">0</p>
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
            <h2 className="text-lg font-black text-foreground">Recetas Guardadas</h2>
          </div>
          <span className="text-xs text-default-500 font-semibold bg-default px-3 py-1 rounded-full">
            {profile.recetas_favoritas?.length || 0}
          </span>
        </div>

        {profile.recetas_favoritas?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profile.recetas_favoritas.map((id, i) => (
              <div key={id || i}
                className="aspect-square bg-surface border border-border rounded-2xl flex items-center justify-center cursor-pointer group shadow-sm hover:border-[#b08968]/40 hover:shadow-md transition-all">
                <Bookmark className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: BRAND }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: BRAND + "1a" }}>
              <Bookmark className="w-7 h-7" style={{ color: BRAND }} />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">Sin recetas guardadas</h3>
            <p className="text-sm text-default-500 max-w-xs mx-auto">
              Aquí aparecerán las recetas que guardes desde el catálogo de ChileBite.
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
