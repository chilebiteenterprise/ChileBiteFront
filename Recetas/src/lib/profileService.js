/**
 * profileService.js
 * Capa centralizada de operaciones de usuario — todo directo a Supabase.
 * NINGUNA operación de usuario debe pasar por Django.
 */
import { supabase } from './supabaseClient';

// -------------------------------------------------------
// LECTURA
// -------------------------------------------------------

/**
 * Obtiene el perfil desde la tabla public.profiles de Supabase.
 * @param {string} userId - UUID del usuario (session.user.id)
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// -------------------------------------------------------
// AUTENTICACIÓN
// -------------------------------------------------------

/**
 * Registro con email + password.
 * El trigger on_auth_user_created crea la fila en profiles automáticamente.
 */
export async function register({ email, password, username }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_name: username,
      },
    },
  });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Login con email + password.
 */
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Login con Google OAuth.
 */
export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw new Error(error.message);
}

/**
 * Cierra la sesión.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// -------------------------------------------------------
// ACTUALIZACIÓN DE PERFIL
// -------------------------------------------------------

/**
 * Actualiza el perfil en DOS lugares para garantizar consistencia inmediata:
 *  1. public.profiles (lo que lee el cliente inmediatamente)
 *  2. auth.users.user_metadata (el trigger on_auth_user_updated lo sincroniza también)
 *
 * @param {string} userId - UUID del usuario
 * @param {object} fields - { username, nombres, apellido_paterno, apellido_materno, bio, avatar_url }
 */
export async function updateProfile(userId, fields) {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      username: fields.username,
      nombres: fields.nombres,
      apellido_paterno: fields.apellido_paterno,
      apellido_materno: fields.apellido_materno,
      bio: fields.bio,
      avatar_url: fields.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (profileError) throw new Error('Error al guardar perfil: ' + profileError.message);
}

// -------------------------------------------------------
// AVATAR
// -------------------------------------------------------

/**
 * Sube un avatar al bucket 'avatars' de Supabase Storage y retorna la URL pública.
 * Requiere que el bucket 'avatars' exista y sea público en Supabase Storage.
 *
 * @param {string} userId - UUID del usuario
 * @param {File} file - Archivo de imagen
 * @returns {string} URL pública del avatar
 */
export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;

  // upsert:true sobreescribe el avatar anterior del mismo usuario
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { cacheControl: '3600', upsert: true });

  if (uploadError) {
    throw new Error(
      "Error al subir el avatar. Verifica que el bucket 'avatars' exista y sea público. Detalle: " +
        uploadError.message
    );
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}

// -------------------------------------------------------
// ELIMINACIÓN DE CUENTA
// -------------------------------------------------------

/**
 * Elimina la cuenta del usuario llamando a la Edge Function 'delete-user'.
 * La Edge Function tiene el service_role key y puede usar admin.deleteUser().
 * 
 * IMPORTANTE: el cascade ON DELETE en la tabla profiles elimina el perfil también.
 */
export async function deleteAccount() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('No hay sesión activa');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tnzpojvhsxjzfachozid.supabase.co';

  const res = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error HTTP ${res.status}`);
  }

  await supabase.auth.signOut();
}
