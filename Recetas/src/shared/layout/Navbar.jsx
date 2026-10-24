import { useState, useEffect, useRef } from "react";
import { ChefHat, BookOpen, MapPin, Store, User, Menu, X, Mail, Lock, Moon, Sun, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { Toast, toast, Alert } from "@heroui/react";
import BlobatarAvatar from "@/shared/ui/BlobatarAvatar";

function NavbarContent() {
  const { user, profile, logout, loginWithGoogle, loginWithEmail, verifyMfaCode } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isForgotPwOpen, setIsForgotPwOpen] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const loginRef = useRef(null);

  const isHomePage = typeof window !== 'undefined' && window.location.pathname === '/';
  const isLoggedIn = !!user && !mfaChallenge;

  // Darkmode init
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !document.documentElement.classList.contains("dark");
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    window.abrirLoginNavbar = () => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsMobileMenuOpen(true);
      } else {
        setIsLoginOpen(true);
      }
    };
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the ref
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setIsLoginOpen(false);
        setLoginError(null);
        setIsForgotPwOpen(false);
        setShowPassword(false);
        if (mfaChallenge) {
          cancelMfaChallenge();
        }
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsLoginOpen(false);
        setIsMobileMenuOpen(false);
        setLoginError(null);
        setIsForgotPwOpen(false);
        setShowPassword(false);
        if (mfaChallenge) {
          cancelMfaChallenge();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mfaChallenge]);

  const navLinks = [
    { id: "recetas", label: "Recetas", href: "/recipes", icon: BookOpen },
    { id: "marketplace", label: "Marketplace", href: "/marketplace", icon: Store },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    const form = e.target;
    if (mfaChallenge) {
      setIsVerifyingMfa(true);
      try {
        if (!/^\d{6}$/.test(mfaCode)) {
          setLoginError("Ingresa el código de 6 dígitos de tu app autenticadora.");
          return;
        }
        const { error } = await verifyMfaCode(mfaChallenge.factorId, mfaCode);
        if (error) throw error;
        setMfaChallenge(null);
        setMfaCode("");
        setIsLoginOpen(false);
        toast.success("¡Sesión verificada! Bienvenido de nuevo.");
        return;
      } catch (error) {
        setLoginError(error.message || "Credenciales incorrectas");
      } finally {
        setIsVerifyingMfa(false);
      }
      return;
    }

    setIsLoggingIn(true);
    try {
      const { error, mfaRequired, factorId } = await loginWithEmail(
        form.email.value,
        form.password.value,
      );
      if (error) throw error;
      if (mfaRequired) {
        setMfaChallenge({
          factorId,
          email: form.email.value,
        });
        setMfaCode("");
        toast.success("Ingresa el código de tu app autenticadora para continuar.");
        return;
      }

      setIsLoginOpen(false);
      toast.success("¡Bienvenido de nuevo! Sesión iniciada.");
    } catch (error) {
      setLoginError(error.message || "Credenciales incorrectas");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const cancelMfaChallenge = async () => {
    setMfaChallenge(null);
    setMfaCode("");
    setLoginError(null);
    await supabase.auth.signOut({ scope: "local" });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsSendingReset(true);
    const form = e.target;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email.value, {
        redirectTo: `${window.location.origin}/RecuperarPassword`,
      });
      if (error) throw error;
      toast.success("Te enviamos instrucciones a tu correo.");
      setIsForgotPwOpen(false);
      setIsLoginOpen(false);
    } catch (error) {
      setLoginError(error.message || "Error al enviar el correo");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Has cerrado sesión correctamente.");
  };

  const handleUserClick = () => {
    setIsLoginOpen(!isLoginOpen);
    setLoginError(null);
    if (mfaChallenge) {
      cancelMfaChallenge();
    }
  };

  const currentAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || "/default-avatar.png";
  const mfaSubmitLabel = isVerifyingMfa ? "Verificando..." : "Verificar código";

  const renderMfaChallengeForm = () => (
    <>
      <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-brand-primary dark:text-[#f0a262]" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Verificación 2FA</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium truncate">{mfaChallenge?.email}</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 ml-1 uppercase tracking-wide">Código autenticador</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={mfaCode}
          onChange={(e) => {
            setMfaCode(e.target.value.replace(/\D/g, ""));
            setLoginError(null);
          }}
          placeholder="000000"
          className="w-full px-5 py-3.5 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-brand-primary transition-colors font-mono text-center text-lg tracking-[0.35em]"
        />
      </div>
    </>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-lg border-b border-zinc-200/60 dark:border-white/10" : "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/40 dark:border-white/5"}`}>
      <Toast.Provider placement="bottom end" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 group cursor-pointer" aria-label="ChileBite Inicio">
            <div className="relative">
              <div className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300 bg-brand-primary" />
              <ChefHat className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:rotate-12 text-brand-primary dark:text-[#f0a262]" />
            </div>
            <span className="text-2xl font-bold tracking-tight transition-all duration-300 group-hover:tracking-wide text-brand-primary dark:text-white">
              Chilebite
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = typeof window !== 'undefined' && (
                window.location.pathname === link.href || 
                (link.href !== '/' && window.location.pathname.startsWith(link.href))
              );
              return (
                <a key={link.id} href={link.href} className="relative px-4 py-2 rounded-lg transition-all duration-300 group">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? "scale-110 text-brand-primary dark:text-[#f0a262]" : "text-zinc-600 dark:text-zinc-300 group-hover:scale-110 group-hover:text-brand-primary"}`} />
                    <span className={`font-medium transition-colors duration-300 ${isActive ? "font-bold text-brand-primary dark:text-[#f0a262]" : "text-zinc-700 dark:text-zinc-200 group-hover:text-brand-primary"}`}>{link.label}</span>
                  </div>
                </a>
              );
            })}
          </div>

          {/* User actions desktop */}
          <div className="hidden md:flex items-center relative" ref={loginRef}>
            <button onClick={handleUserClick} aria-label="Menú de usuario" className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 flex items-center justify-center overflow-hidden border-2 ${isLoggedIn ? "border-brand-primary" : "bg-brand-primary border-transparent"}`}>
              {isLoggedIn ? (
                <BlobatarAvatar src={profile?.avatar_url || user?.user_metadata?.avatar_url} name={user?.email || "Usuario"} size={28} rounded="rounded-full" />
              ) : (
                <User className="w-6 h-6 text-white m-0.5" />
              )}
            </button>

            {isLoginOpen && (
              <div className="absolute top-14 right-0 w-80 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 z-[110] border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-200">
                {/* Popover Arrow / Notch */}
                <div className="absolute -top-2 right-4 w-4 h-4 bg-white dark:bg-[#18181b] border-t border-l border-zinc-200 dark:border-[#27272a] rotate-45 rounded-tl-sm pointer-events-none z-10" />
                {/* Opciones Generales (Dark Mode) */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Apariencia</span>
                  <button onClick={toggleDarkMode} aria-label="Alternar modo oscuro" className="flex items-center justify-center p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-700 dark:text-zinc-300">
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>

                {!isLoggedIn ? (
                  isForgotPwOpen ? (
                    <>
                      <h3 className="text-xl font-black mb-2 text-brand-primary dark:text-white">Recuperar Acceso</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Ingresa tu correo y te enviaremos un enlace mágico.</p>

                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 ml-1 uppercase tracking-wide">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary dark:text-[#f0a262]" />
                            <input type="email" name="email" required className="w-full pl-10 pr-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-brand-primary transition-colors font-medium" placeholder="tu@email.com" />
                          </div>
                        </div>

                        {loginError && (
                          <Alert status="danger" className="py-2">
                            <Alert.Indicator />
                            <Alert.Content><Alert.Description>{loginError}</Alert.Description></Alert.Content>
                          </Alert>
                        )}

                        <button type="submit" disabled={isSendingReset} className="w-full py-3 mt-2 rounded-xl text-white font-extrabold bg-brand-primary hover:bg-brand-hover hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50">
                          {isSendingReset ? "Enviando..." : "Enviar enlace mágico"}
                        </button>
                      </form>

                      <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">
                        <button type="button" onClick={() => setIsForgotPwOpen(false)} className="w-full text-center text-sm font-extrabold hover:underline text-brand-primary dark:text-[#f0a262]">
                          Volver al inicio de sesión
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-black mb-4 text-brand-primary dark:text-white">
                        {mfaChallenge ? "Verifica tu acceso" : "Iniciar Sesión"}
                      </h3>

                      <form onSubmit={handleLogin} className="space-y-4">
                        {mfaChallenge ? (
                          renderMfaChallengeForm()
                        ) : (
                          <>
                            {/* Email */}
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1 ml-1 uppercase tracking-wide">Email</label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary dark:text-[#f0a262]" />
                                <input type="email" name="email" required className="w-full pl-10 pr-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-brand-primary transition-colors font-medium" placeholder="tu@email.com" />
                              </div>
                            </div>

                            {/* Password */}
                            <div>
                              <div className="flex justify-between items-end mb-1 ml-1">
                                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">Contraseña</label>
                                <button type="button" onClick={() => setIsForgotPwOpen(true)} className="text-[10px] font-bold text-brand-primary dark:text-[#f0a262] hover:underline focus:outline-none">¿Olvidaste tu contraseña?</button>
                              </div>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary dark:text-[#f0a262]" />
                                <input 
                                  type={showPassword ? "text" : "password"} 
                                  name="password" 
                                  required 
                                  className="w-full pl-10 pr-11 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl outline-none bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-brand-primary transition-colors font-medium" 
                                  placeholder="••••••••" 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none transition-colors"
                                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Login error as HeroUI alert */}
                        {loginError && (
                          <Alert status="danger" className="py-2">
                            <Alert.Indicator />
                            <Alert.Content>
                              <Alert.Description>{loginError}</Alert.Description>
                            </Alert.Content>
                          </Alert>
                        )}

                        <button 
                          type="submit" 
                          disabled={isVerifyingMfa || isLoggingIn} 
                          className="w-full py-3 mt-2 rounded-xl text-white font-extrabold bg-brand-primary hover:bg-brand-hover hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-60 flex items-center justify-center space-x-2" 
                        >
                          {isLoggingIn ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                              </svg>
                              <span>Iniciando sesión...</span>
                            </>
                          ) : mfaChallenge ? (
                            mfaSubmitLabel
                          ) : (
                            <span>Entrar</span>
                          )}
                        </button>

                        {mfaChallenge ? (
                          <button type="button" onClick={cancelMfaChallenge} className="w-full text-center text-sm font-extrabold hover:underline text-brand-primary dark:text-[#f0a262]">
                            Volver al inicio de sesión
                          </button>
                        ) : (
                          <>
                            <div className="relative my-5">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-200 dark:border-zinc-800"></span>
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-[#18181b] px-3 text-zinc-400 font-bold">O</span>
                              </div>
                            </div>

                            <button type="button" onClick={() => loginWithGoogle()} className="w-full flex items-center justify-center space-x-3 py-3 border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-bold truncate">
                              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
                              <span>Continuar con Google</span>
                            </button>
                          </>
                        )}
                      </form>

                      {!mfaChallenge && <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                        <p className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">¿No tienes cuenta? <a href="/auth/register" className="font-extrabold hover:underline ml-1 text-brand-primary dark:text-[#f0a262]">Regístrate</a></p>
                      </div>}
                    </>
                  )
                ) : (
                  <div className="space-y-4">
                    {/* Avatar + info */}
                    <div className="flex items-center space-x-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-primary p-0.5">
                        <BlobatarAvatar src={profile?.avatar_url || user?.user_metadata?.avatar_url} name={user?.email || "Usuario"} size={52} rounded="rounded-full" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-extrabold text-zinc-900 dark:text-white truncate text-lg">{profile?.username || user?.user_metadata?.user_name || user?.user_metadata?.full_name || "Usuario"}</p>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate w-40">{user.email}</p>
                      </div>
                    </div>

                    {/* Ver perfil */}
                    <button
                      onClick={() => {
                        window.location.href = "/profile";
                        setIsLoginOpen(false);
                      }}
                      className="block w-full py-3 text-center rounded-xl text-white font-bold bg-brand-primary hover:bg-brand-hover hover:scale-[1.02] transition-all shadow-md cursor-pointer"
                    >
                      Ver mi perfil
                    </button>

                    {/* Logout */}
                    <button onClick={handleLogout} className="w-full py-3 text-center rounded-xl text-zinc-600 dark:text-zinc-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer">
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            aria-label="Menú móvil" 
            className="md:hidden p-2 rounded-lg text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>

          {/* Mobile menu */}
          <div className={`md:hidden absolute top-full left-0 right-0 bg-background shadow-2xl transition-all duration-300 overflow-hidden z-[100] ${isMobileMenuOpen ? "max-h-[1000px] py-4 border-t border-divider" : "max-h-0"}`}>
            <div className="px-4 space-y-3">
              <div className="flex justify-between items-center mb-4 px-4 pb-4 border-b border-divider">
                <span className="text-sm font-bold text-default-500 uppercase tracking-wider">Modo Oscuro</span>
                <button onClick={toggleDarkMode} aria-label="Alternar modo oscuro" className="p-2 rounded-full bg-default text-default-600 hover:bg-default-hover">
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = typeof window !== 'undefined' && (
                  window.location.pathname === link.href || 
                  (link.href !== '/' && window.location.pathname.startsWith(link.href))
                );
                return (
                  <a 
                    key={link.id} 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? "bg-default" : "hover:bg-default-hover"}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-brand-primary dark:text-[#f0a262]" : "text-default-500"}`} />
                    <span className={`font-medium ${isActive ? "font-bold text-brand-primary dark:text-[#f0a262]" : "text-foreground-600"}`}>{link.label}</span>
                  </a>
                );
              })}

              {/* User section mobile */}
              {!isLoggedIn ? (
                <div className="mt-6 pt-6 border-t border-divider space-y-4 px-2">
                  <form onSubmit={handleLogin} className="space-y-3">
                    {mfaChallenge ? (
                      renderMfaChallengeForm()
                    ) : (
                      <>
                        <input type="email" name="email" placeholder="Email" className="w-full px-5 py-3.5 border-2 border-transparent bg-field text-foreground placeholder-default-500 focus:border-brand-primary focus:bg-default rounded-xl outline-none transition-all font-medium" />
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="Contraseña" 
                            className="w-full px-5 pr-12 py-3.5 border-2 border-transparent bg-field text-foreground placeholder-default-500 focus:border-brand-primary focus:bg-default rounded-xl outline-none transition-all font-medium" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-default-400 hover:text-default-600 focus:outline-none transition-colors"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </>
                    )}
                    {loginError && (
                      <Alert status="danger" className="py-2">
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Description>{loginError}</Alert.Description>
                        </Alert.Content>
                      </Alert>
                    )}
                    <button 
                      type="submit" 
                      disabled={isVerifyingMfa || isLoggingIn} 
                      className="w-full py-4 rounded-xl text-white font-extrabold text-lg shadow-lg bg-brand-primary hover:opacity-95 disabled:opacity-60 flex items-center justify-center space-x-2" 
                    >
                      {isLoggingIn ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Iniciando sesión...</span>
                        </>
                      ) : mfaChallenge ? (
                        mfaSubmitLabel
                      ) : (
                        <span>Iniciar sesión</span>
                      )}
                    </button>
                  </form>
                  {mfaChallenge ? (
                    <button type="button" onClick={cancelMfaChallenge} className="w-full text-center text-sm font-extrabold text-brand-primary dark:text-[#f0a262]">
                      Volver al inicio de sesión
                    </button>
                  ) : (
                    <>
                      <div className="relative my-5"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-divider"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-default-500 font-bold">O</span></div></div>

                      <button onClick={() => loginWithGoogle()} className="w-full flex items-center justify-center space-x-3 py-4 border-2 border-border rounded-xl font-bold text-foreground-700 hover:bg-default-hover transition-colors">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
                        <span>Continuar con Google</span>
                      </button>
                      <div className="flex justify-between items-center text-sm pt-4 px-2">
                        <a href="/auth/register" onClick={() => setIsMobileMenuOpen(false)} className="font-extrabold text-brand-primary dark:text-[#f0a262] hover:underline">Crear cuenta</a>
                        <a href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="text-default-500 font-medium hover:text-default-700">¿Olvidaste tu contraseña?</a>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-divider space-y-4 px-2">
                  <div className="flex items-center space-x-4 p-4 bg-default rounded-2xl overflow-hidden">
                    <BlobatarAvatar src={profile?.avatar_url || user?.user_metadata?.avatar_url} name={user?.email || "Usuario"} size={48} rounded="rounded-full" className="border-2 border-divider" />
                    <div className="overflow-hidden">
                      <p className="font-extrabold text-foreground truncate text-lg">{profile?.username || "Usuario"}</p>
                      <p className="text-sm font-medium text-default-500 truncate w-48">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <a href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3.5 rounded-xl text-white font-bold bg-brand-primary hover:opacity-95 transition-transform active:scale-95">Perfil</a>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center w-full py-3.5 rounded-xl font-bold bg-danger-soft active:scale-95 transition-transform text-danger">Salir</button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <AuthProvider>
      <NavbarContent />
    </AuthProvider>
  );
}
