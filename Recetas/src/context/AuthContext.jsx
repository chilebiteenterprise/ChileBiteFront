import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { getProfile } from "../lib/profileService";

const AuthContext = createContext();

// Singleton promises para evitar colisiones entre Astro islands
let sharedSessionPromise = null;
let sharedProfilePromise = null;
let lastProfileUserId = null;

function getSharedSession() {
  if (!sharedSessionPromise) {
    sharedSessionPromise = supabase.auth.getSession().catch(err => {
      sharedSessionPromise = null;
      throw err;
    });
  }
  return sharedSessionPromise;
}

function getSharedProfile(userId) {
  if (lastProfileUserId !== userId || !sharedProfilePromise) {
    lastProfileUserId = userId;
    sharedProfilePromise = getProfile(userId).catch(err => {
      sharedProfilePromise = null;
      throw err;
    });
  }
  return sharedProfilePromise;
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSupabaseProfile = async (userId) => {
    if (!userId) return;
    try {
      const data = await getSharedProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error("[Auth] Error al cargar perfil desde Supabase:", error.message);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Obtención de la sesión (Ahora centralizada para todas las islands)
    async function getInitialSession() {
      try {
        const { data: { session }, error } = await getSharedSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }

        if (session?.user?.id && mounted) {
          await fetchSupabaseProfile(session.user.id);
        } else if (mounted) {
          setProfile(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error obteniendo sesión inicial:", err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    getInitialSession();

    // 2. Suscripción a eventos
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === "SIGNED_OUT") {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (currentSession?.user?.id) {
          await fetchSupabaseProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Login con Google OAuth.
   * Si el usuario ya tiene cuenta con email+pass, Supabase vinculará automáticamente
   * porque usamos la opción linkIdentity en lugar de un nuevo signIn.
   */
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { error };
  };

  /**
   * Vincula Google al usuario YA autenticado con email/password.
   * Usar esto cuando el usuario está logueado y quiere añadir Google a su cuenta.
   */
  const linkGoogleToCurrentAccount = async () => {
    if (!user) return { error: new Error("Debes estar autenticado para vincular Google.") };
    const { data, error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { data, error };
  };

  /**
   * Login con email + password.
   * Si el error es que el email ya está vinculado a Google, lanza mensaje amigable.
   */
  const loginWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Error específico: la cuenta existe pero con OAuth (Google)
      if (error.message?.includes("Invalid login credentials")) {
        // Verificamos si el email tiene un proveedor OAuth asociado
        const friendlyError = new Error(
          "Credenciales incorrectas. Si te registraste con Google, usa el botón 'Continuar con Google'."
        );
        return { data: null, error: friendlyError };
      }
    }
    return { data, error };
  };

  /**
   * Registro con email + password + username.
   * El trigger on_auth_user_created crea el perfil automáticamente.
   */
  const registerWithEmail = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { user_name: username } },
    });
    return { data, error };
  };

  /**
   * Cierra la sesión.
   */
  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  /**
   * Fuerza recarga del perfil desde Supabase (datos siempre frescos).
   */
  const refreshProfile = () => {
    if (user?.id) return fetchSupabaseProfile(user.id);
  };

  const value = {
    session,
    user,
    profile,
    loading,
    loginWithGoogle,
    linkGoogleToCurrentAccount,
    loginWithEmail,
    registerWithEmail,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
