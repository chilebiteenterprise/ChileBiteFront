import React, { useState, useEffect } from "react";
import { Camera, Edit2, Trash2, Save, X, Plus, Bookmark, Grid2x2 as Grid, AlertTriangle, Loader } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = "http://127.0.0.1:8000/api/perfil/";

export default function PerfilClient() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [tempData, setTempData] = useState({});
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [userLocales, setUserLocales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ===================== Cargar datos del usuario =====================
  const fetchPerfil = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setError("No se encontró token de sesión.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 403) {
        setError("Sesión expirada o no autorizada.");
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await res.json();
      setProfileData(data);
      setTempData(data);
      setSavedRecipes(data.recetas_guardadas || []);
      setUserLocales(data.locales || []);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  // ===================== Manejo de inputs =====================
  const handleChange = (e) => setTempData({ ...tempData, [e.target.name]: e.target.value });
  const handleAvatarChange = (e) => { const file = e.target.files[0]; if (file) setTempData({ ...tempData, avatar_file: file }); };
  const handleEditToggle = () => { if (isEditing) setTempData(profileData); setIsEditing(!isEditing); };

  const handleSave = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return;

    // Validar username para que no tenga espacios ni caracteres inválidos
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(tempData.username)) {
      toast.error("El nombre de usuario solo puede contener letras, números y guiones bajos.");
      return;
    }

    const formData = new FormData();
    formData.append("username", tempData.username || profileData.username);
    formData.append("bio", tempData.bio || "");
    formData.append("nombres", tempData.nombres || profileData.nombres);
    formData.append("apellido_paterno", tempData.apellido_paterno || profileData.apellido_paterno);
    formData.append("apellido_materno", tempData.apellido_materno || profileData.apellido_materno);
    if (tempData.avatar_file) formData.append("avatar", tempData.avatar_file);

    try {
      const res = await fetch(`${API_BASE_URL}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${accessToken}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error HTTP ${res.status}: ${JSON.stringify(errorData)}`);
      }

      const updatedData = await res.json();
      setProfileData(updatedData);
      setTempData(updatedData);
      setIsEditing(false);
      toast.success("Perfil actualizado correctamente");

    } catch (err) {
      setError("Error al guardar cambios: " + err.message);
      toast.error("Error al guardar cambios");
    }
  };

  // ===================== Eliminar cuenta =====================
const handleDeleteAccount = async () => {
  const accessToken = localStorage.getItem("access_token");
  if (!accessToken) return;

  try {
    const res = await fetch(`${API_BASE_URL}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    toast.success("Cuenta eliminada correctamente", { position: "top-center", autoClose: 1500 });

    setTimeout(() => {
      window.location.replace("/"); 
    }, 1600);

  } catch (err) {
    setError("Error al eliminar la cuenta: " + err.message);
    toast.error("No se pudo eliminar la cuenta", { position: "top-center", autoClose: 3000 });
  }
};


  // ===================== Modal de confirmación =====================
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
        <h3 className="text-xl font-bold mb-4 text-red-600 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2"/> Confirmar Eliminación
        </h3>
        <p className="mb-6 text-gray-700">
          ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300"
            style={{ borderColor: "#b08968", color: "#b08968" }}>
            Cancelar
          </button>
          <button onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">
            <Trash2 className="w-4 h-4" /> Eliminar Permanentemente
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Loader className="animate-spin w-8 h-8 text-[#b08968]" />
      <p className="ml-2 text-gray-700">Cargando perfil...</p>
    </div>
  );

  if (!profileData) return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-xl max-w-lg shadow-lg">
        <p className="font-bold mb-2 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" /> Error de Sesión
        </p>
        <p>{error || "Error desconocido."}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex flex-col">
      <ToastContainer />
      {showDeleteModal && <DeleteConfirmationModal />}
      <div className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Perfil y edición */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#f5f0ec" }}>
                    {(profileData.avatar || tempData.avatar_url) ? (
                      <img src={profileData.avatar || tempData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-12 h-12" style={{ color: "#b08968" }} />
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <input type="file" id="avatar_file" name="avatar_file" className="absolute bottom-0 right-0 w-10 h-10 opacity-0 cursor-pointer z-10"
                             onChange={handleAvatarChange} accept="image/*" />
                      <label htmlFor="avatar_file" className="absolute bottom-0 right-0 w-10 h-10 flex items-center justify-center shadow-lg bg-[#b08968] text-white rounded-full cursor-pointer transition-transform duration-300 hover:scale-110">
                        <Camera className="w-5 h-5" />
                      </label>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">{isEditing ? "Click para cambiar foto" : " "}</p>
              </div>

              {/* Info del perfil */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-1" style={{ color: "#b08968" }}>{profileData.username}</h1>
                    <p className="text-gray-600">{profileData.email}</p>
                  </div>
                  <button onClick={handleEditToggle} className="p-2 rounded-lg transition-colors duration-300 hover:bg-gray-100" style={{ color: "#b08968" }}>
                    {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                      <input type="text" id="username" name="username" value={tempData.username} onChange={handleChange}
                             className="w-full px-4 py-2 border-2 rounded-lg outline-none focus:ring-2 focus:ring-[#b08968]" style={{ borderColor: "#e5e7eb" }} />
                    </div>
                    <div>
                      <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                      <input type="text" id="nombres" name="nombres" value={tempData.nombres || ''} onChange={handleChange}
                             className="w-full px-4 py-2 border-2 rounded-lg outline-none focus:ring-2 focus:ring-[#b08968]" style={{ borderColor: "#e5e7eb" }} />
                    </div>
                    <div>
                      <label htmlFor="apellido_paterno" className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
                      <input type="text" id="apellido_paterno" name="apellido_paterno" value={tempData.apellido_paterno || ''} onChange={handleChange}
                             className="w-full px-4 py-2 border-2 rounded-lg outline-none focus:ring-2 focus:ring-[#b08968]" style={{ borderColor: "#e5e7eb" }} />
                    </div>
                    <div>
                      <label htmlFor="apellido_materno" className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                      <input type="text" id="apellido_materno" name="apellido_materno" value={tempData.apellido_materno || ''} onChange={handleChange}
                             className="w-full px-4 py-2 border-2 rounded-lg outline-none focus:ring-2 focus:ring-[#b08968]" style={{ borderColor: "#e5e7eb" }} />
                    </div>
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                      <textarea id="bio" name="bio" value={tempData.bio || ""} onChange={handleChange} rows={3}
                                className="w-full px-4 py-2 border-2 rounded-lg outline-none resize-none focus:ring-2 focus:ring-[#b08968]" style={{ borderColor: "#e5e7eb" }} />
                    </div>
                    {error && <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-lg">{error}</div>}
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg hover:bg-amber-700" style={{ backgroundColor: "#b08968" }}>
                        <Save className="w-4 h-4" /> Guardar
                      </button>
                      <button onClick={handleEditToggle} className="px-4 py-2 rounded-lg border-2 font-medium transition-all duration-300 hover:bg-gray-100" style={{ borderColor: "#b08968", color: "#b08968" }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-700 min-h-[5rem]">{profileData.bio || "Aún no has escrito tu biografía."}</p>
                    <p className="text-gray-500 text-sm">Nombre completo: {profileData.nombres} {profileData.apellido_paterno} {profileData.apellido_materno}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg hover:bg-amber-700" style={{ backgroundColor: "#b08968" }}>
                <Plus className="w-5 h-5" /> Crear Local
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:bg-red-600">
                <Trash2 className="w-5 h-5" /> Eliminar Cuenta
              </button>
            </div>
          </div>

          {/* Recetas guardadas */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button className="flex-1 flex items-center justify-center gap-2 py-4 font-medium border-b-2" style={{ color: "#b08968", borderColor: "#b08968" }}>
                <Bookmark className="w-5 h-5" /> Recetas Guardadas
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {savedRecipes.map((recipe) => (
                  <div key={recipe.id} className="aspect-square rounded-xl overflow-hidden group cursor-pointer relative transform hover:scale-[1.02] transition duration-300" style={{ backgroundColor: "#f5f0ec" }}>
                    {recipe.imagen_url ? (
                      <img src={recipe.imagen_url} alt={recipe.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Grid className="w-12 h-12" style={{ color: "#b08968" }} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <p className="text-white font-semibold text-lg">{recipe.nombre}</p>
                    </div>
                  </div>
                ))}
              </div>
              {savedRecipes.length === 0 && (
                <div className="text-center py-16">
                  <Bookmark className="w-16 h-16 mx-auto mb-4" style={{ color: "#b08968" }} />
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">No hay recetas guardadas</h3>
                  <p className="text-gray-600">Comienza a guardar tus recetas favoritas</p>
                </div>
              )}
            </div>
          </div>

          {/* Locales del usuario */}
          {userLocales.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl mt-8 p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#b08968" }}>Mis Locales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userLocales.map((local) => (
                  <a key={local.id} href={`/locales/${local.id}`} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl shadow hover:shadow-lg transition bg-[#f5f0ec] border-l-4 border-[#b08968] transform hover:translate-x-1">
                    <h3 className="font-semibold text-gray-800">{local.nombre_local}</h3>
                    <p className="text-sm text-gray-500">{local.descripcion}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
