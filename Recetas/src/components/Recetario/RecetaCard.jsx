import React, { useState, useEffect } from "react";
import Checkbox from "./Botones/Checkbox.jsx";
import ContenedorFire from "./Botones/ContenedorFire.jsx";
import { Heart, Bookmark } from "lucide-react";
import "./RecetaCard.css";

const categoriaColors = {
  Postre: "bg-pink-400 text-white",
  Almuerzo: "bg-green-400 text-white",
  Cena: "bg-blue-400 text-white",
  Ensalada: "bg-red-400 text-white",
  Desayuno: "bg-yellow-400 text-black",
  Snack: "bg-purple-400 text-white",
  Entrada: "bg-orange-400 text-white",
  Sopa: "bg-teal-400 text-white",
  Bebida: "bg-indigo-400 text-white",
  Acompañamiento: "bg-lime-400 text-black",
  Panadería: "bg-rose-400 text-white",
};

const dificultadMap = {
  "Muy Fácil": 1,
  "Fácil": 2,
  "Media": 3,
  "Difícil": 4,
  "Muy Difícil": 5,
};

export default function RecetaCard({ receta, usuarioEsAdmin = false, onDeleteSuccess }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [guardado, setGuardado] = useState(false);

  const idToUse = receta.id_receta || receta.id;

  // === CARGA INICIAL: sincroniza con backend ===
useEffect(() => {
  const fetchEstado = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const response = await fetch(`http://127.0.0.1:8000/api/recetas/${idToUse}/`, { headers });

      if (!response.ok) throw new Error("Error al obtener la receta");
      const data = await response.json();

      setLiked(data.liked || false);
      setLikes(data.contador_likes || 0);
      setGuardado(data.is_guardada || false);
    } catch (err) {
      console.error("Error al obtener estado de receta:", err);
    }
  };

  fetchEstado();
}, [idToUse]);


  // === LIKE ===
  const handleFavorite = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Debes estar logueado");

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/recetas/${idToUse}/like/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("No se pudo actualizar favorito");

      const data = await response.json();
      // Sin recargar ni resetear
      setLiked(data.is_liked ?? !liked);
      setLikes(data.total_likes ?? (liked ? likes - 1 : likes + 1));

    } catch (err) {
      console.error(err);
      alert("Error al marcar como favorito");
    }
  };

  // === GUARDAR ===
  const handleSave = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Debes estar logueado");

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/recetas/${idToUse}/guardar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("No se pudo guardar la receta");

      const data = await response.json();
      setGuardado(data.is_guardada ?? !guardado);

    } catch (err) {
      console.error(err);
      alert("Error al guardar receta");
    }
  };

  // === ADMIN ===
  const handleEdit = () => {
    window.location.href = `/admin/receta-form?id=${idToUse}`;
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Seguro que quieres eliminar "${receta.nombre}"?`)) return;
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return alert("Error: No hay token de autenticación.");

      const response = await fetch(`http://127.0.0.1:8000/api/recetas/${idToUse}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok || response.status === 204) {
        alert("Receta eliminada correctamente.");
        onDeleteSuccess?.(idToUse);
      } else throw new Error("Error al eliminar la receta.");
    } catch (error) {
      console.error("Error al eliminar la receta:", error);
      alert(`No se pudo eliminar: ${error.message}`);
    }
  };

  const dificultadNum = dificultadMap[receta.dificultad] || 0;

  const handleCardClick = (e) => {
    if (e.target.closest("[data-receta-ignore='true']")) return;
    window.open(`/recetas/${idToUse}`, "_blank");
  };

  return (
    <div className="receta-card cursor-pointer" onClick={handleCardClick}>
      <div className="receta-img-container relative">
        <img src={receta.imagen_url} alt={receta.nombre} className="receta-img" />

        <div className="absolute top-2 right-2 flex gap-2 z-20" data-receta-ignore="true">
          {/* Guardar */}
          <button
            onClick={handleSave}
            className={`p-3 rounded-full shadow-lg transition-colors ${
              guardado ? "bg-yellow-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            title="Guardar receta"
          >
            <Bookmark className="w-6 h-6 fill-current" />
          </button>
        </div>
      </div>

      <div className="receta-content">
        <h3 className="receta-title">{receta.nombre}</h3>
        <p className="receta-desc">{receta.descripcion_corta}</p>
        <p className="receta-porciones">🍽 Porciones: {receta.numero_porcion}</p>

        <div className="receta-footer">
          <div className="receta-row items-center justify-between">
            <ContenedorFire selectedDifficulty={dificultadNum} setSelectedDifficulty={() => {}} />

            <div className="popularity-container flex items-center gap-1" data-receta-ignore="true">
              <span className="like-counter" style={{ color: "#ff4757" }}>
                {likes}
              </span>
              <button
                onClick={handleFavorite}
                className={`p-3 rounded-full shadow-lg transition-colors ${
                  liked ? "bg-red-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                title="Me gusta"
              >
                <Heart className="w-6 h-6 fill-current" />
              </button>
            </div>
          </div>

          <div className="receta-row mt-2">
            <span className="pais-text">{receta.pais}</span>
            {receta.categoria && (
              <span
                className={`categoria-badge ${
                  categoriaColors[receta.categoria] || "bg-gray-400 text-white"
                }`}
              >
                {receta.categoria}
              </span>
            )}
          </div>

          {usuarioEsAdmin && (
            <div className="admin-actions mt-3 flex justify-between gap-2" data-receta-ignore="true">
              <button
                onClick={handleEdit}
                className="flex-1 px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ✏️ Modificar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                🗑️ Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
