/**
 * collectionService.js
 * Capa centralizada de operaciones para las Colecciones de Recetas (Favoritos).
 */
import { supabase } from './supabaseClient';

/**
 * Obtiene todas las colecciones de un usuario junto con las últimas 4 imágenes de recetas
 * guardadas en cada una para formar el mosaico de portada.
 * @param {string} userId - UUID del usuario
 */
export async function getUserCollections(userId) {
  // Obtenemos las colecciones
  const { data: colecciones, error: colError } = await supabase
    .from('core_coleccion')
    .select('*')
    .eq('user_id', userId)
    .order('fecha_creacion', { ascending: false });

  if (colError) throw new Error(colError.message);

  // Para cada colección, obtenemos las últimas 4 recetas
  const coleccionesConPortadas = await Promise.all(colecciones.map(async (col) => {
    const { data: recetas } = await supabase
      .from('core_coleccion_receta')
      .select(`
        receta_id,
        core_receta ( imagen_url )
      `)
      .eq('coleccion_id', col.id)
      .limit(4);

    const portadas = (recetas || []).map(r => r.core_receta?.imagen_url).filter(Boolean);

    return {
      ...col,
      portadas,
      total_recetas: recetas ? recetas.length : 0 // Idealmente sería un count real, pero esto sirve para la UI base
    };
  }));

  return coleccionesConPortadas;
}

/**
 * Crea una nueva colección para el usuario.
 * @param {string} userId - UUID del usuario
 * @param {string} nombre - Nombre de la colección
 * @param {string} descripcion - (Opcional) Descripción
 */
export async function createCollection(userId, nombre, descripcion = '') {
  const { data, error } = await supabase
    .from('core_coleccion')
    .insert([{
      user_id: userId,
      nombre,
      descripcion,
      es_privada: true
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Obtiene todas las colecciones del usuario y marca en cuáles está la receta dada.
 * Útil para el Modal de Guardar Receta.
 * @param {string} userId - UUID del usuario
 * @param {number} recetaId - ID (BIGINT) de la receta
 */
export async function getCollectionsWithRecipeStatus(userId, recetaId) {
  // 1. Obtener colecciones
  const { data: colecciones, error } = await supabase
    .from('core_coleccion')
    .select('id, nombre')
    .eq('user_id', userId)
    .order('fecha_creacion', { ascending: false });

  if (error) throw new Error(error.message);

  if (!colecciones || colecciones.length === 0) return [];

  // 2. Comprobar cuáles tienen la receta
  const colIds = colecciones.map(c => c.id);
  const { data: guardadas, error: guardadasError } = await supabase
    .from('core_coleccion_receta')
    .select('coleccion_id')
    .eq('receta_id', recetaId)
    .in('coleccion_id', colIds);

  if (guardadasError) throw new Error(guardadasError.message);

  const guardadasSet = new Set(guardadas.map(g => g.coleccion_id));

  return colecciones.map(c => ({
    ...c,
    hasRecipe: guardadasSet.has(c.id)
  }));
}

/**
 * Alterna (Agrega o Quita) una receta de una colección.
 * @param {string} coleccionId - UUID de la colección
 * @param {number} recetaId - ID de la receta
 * @param {boolean} isCurrentlySaved - Si está guardada actualmente (para hacer toggle)
 */
export async function toggleRecipeInCollection(coleccionId, recetaId, isCurrentlySaved) {
  if (isCurrentlySaved) {
    const { error } = await supabase
      .from('core_coleccion_receta')
      .delete()
      .eq('coleccion_id', coleccionId)
      .eq('receta_id', recetaId);
    if (error) throw new Error(error.message);
    return false; // Ya no está guardada
  } else {
    const { error } = await supabase
      .from('core_coleccion_receta')
      .insert([{ coleccion_id: coleccionId, receta_id: recetaId }]);
    if (error) throw new Error(error.message);
    return true; // Ahora está guardada
  }
}
