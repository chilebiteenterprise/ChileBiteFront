import { useState, useEffect, useRef } from "react";
import { ChefHat, BookOpen, MapPin, User, Menu, X, Mail, Lock, Moon, Sun } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { Toast, toast, Alert } from "@heroui/react";

function NavbarContent() {
  const { user, profile, logout, loginWithGoogle } = useAuth();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState(null); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isForgotPwOpen, setIsForgotPwOpen] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const loginRef = useRef(null);

  const isHomePage = typeof window !== 'undefined' && window.location.pathname === '/';
  const isLoggedIn = !!user;

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

  useEffect(() => {
    window.abrirLoginNavbar = () => setIsLoginOpen(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the ref
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setIsLoginOpen(false);
        setLoginError(null);
        setIsForgotPwOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { id: "recetas", label: "Recetas", href: "/Recetas", icon: BookOpen },
    { id: "locales", label: "Locales", href: "/Locales", icon: MapPin },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    const form = e.target;
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.value,
        password: form.password.value,
      });
      if (error) throw error;
      setIsLoginOpen(false);
      toast.success("¡Bienvenido de nuevo! Sesión iniciada.");
    } catch (error) {
      setLoginError(error.message || "Credenciales incorrectas");
    }
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
  };

  const currentAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || "/default-avatar.png";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
      <Toast.Provider placement="bottom end" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300" style={{ backgroundColor: "#b08968" }} />
              <ChefHat className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:rotate-12" style={{ color: "#b08968" }} />
            </div>
            <span className="text-2xl font-bold tracking-tight transition-all duration-300 group-hover:tracking-wide dark:text-white" style={{ color: "#b08968" }}>
              Chilebite
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = window.location.pathname === link.href;
              const linkColor = isActive ? "#b08968" : (isScrolled ? "#6b7280" : (isDarkMode || isHomePage ? "#e5e7eb" : "#4b5563"));
              return (
                <a key={link.id} href={link.href} className="relative px-4 py-2 rounded-lg transition-all duration-300 group">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} style={{ color: linkColor }} />
                    <span className={`font-medium transition-colors duration-300 ${isActive ? "font-semibold" : ""}`} style={{ color: linkColor }}>{link.label}</span>
                  </div>
                </a>
              );
            })}
          </div>

          {/* User actions desktop */}
          <div className="hidden md:flex items-center relative" ref={loginRef}>
            <button onClick={handleUserClick} className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 flex items-center justify-center overflow-hidden border-2 ${isLoggedIn ? "border-[#b08968]" : "bg-[#b08968] border-transparent"}`}>
               {isLoggedIn ? (
                  <img src={currentAvatar} alt="Avatar" className="w-7 h-7 object-cover rounded-full" />
               ) : (
                  <User className="w-6 h-6 text-white m-0.5" />
               )}
            </button>

            {isLoginOpen && (
              <div className="absolute top-14 right-0 w-80 bg-overlay rounded-3xl shadow-2xl p-6 z-50 border border-border animate-in fade-in slide-in-from-top-4 duration-200">
                {/* Opciones Generales (Dark Mode) */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-divider">
                  <span className="text-sm font-bold text-default-500 uppercase tracking-wider">Apariencia</span>
                  <button onClick={toggleDarkMode} className="flex items-center justify-center p-2 rounded-full bg-default hover:bg-default-hover transition-colors text-default-600">
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>

                {!isLoggedIn ? (
                  isForgotPwOpen ? (
                    <>
                      <h3 className="text-xl font-black mb-2 dark:text-white" style={{ color: "#b08968" }}>Recuperar Acceso</h3>
                      <p className="text-xs text-default-500 mb-4">Ingresa tu correo y te enviaremos un enlace mágico.</p>
                      
                      <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-default-600 mb-1 ml-1 uppercase tracking-wide">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#b08968" }} />
                            <input type="email" name="email" required className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl outline-none bg-field text-foreground placeholder-default-500 focus:border-[#b08968] focus:bg-default transition-colors font-medium" placeholder="tu@email.com" />
                          </div>
                        </div>
                        
                        {loginError && (
                          <Alert status="danger" className="py-2">
                            <Alert.Indicator />
                            <Alert.Content><Alert.Description>{loginError}</Alert.Description></Alert.Content>
                          </Alert>
                        )}

                        <button type="submit" disabled={isSendingReset} className="w-full py-3 mt-2 rounded-xl text-white font-extrabold hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50" style={{ backgroundColor: "#b08968", shadowColor: "rgba(176, 137, 104, 0.4)" }}>
                          {isSendingReset ? "Enviando..." : "Enviar enlace mágico"}
                        </button>
                      </form>
                      
                      <div className="mt-5 pt-5 border-t border-divider">
                        <button type="button" onClick={() => setIsForgotPwOpen(false)} className="w-full text-center text-sm font-extrabold hover:underline" style={{ color: "#b08968" }}>
                          Volver al inicio de sesión
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-black mb-4 dark:text-white" style={{ color: "#b08968" }}>Iniciar Sesión</h3>
                      
                      <form onSubmit={handleLogin} className="space-y-4">
                        {/* Email */}
                        <div>
                          <label className="block text-xs font-bold text-default-600 mb-1 ml-1 uppercase tracking-wide">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#b08968" }} />
                            <input type="email" name="email" required className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl outline-none bg-field text-foreground placeholder-default-500 focus:border-[#b08968] focus:bg-default transition-colors font-medium" placeholder="tu@email.com" />
                          </div>
                        </div>

                        {/* Password */}
                        <div>
                          <div className="flex justify-between items-end mb-1 ml-1">
                            <label className="block text-xs font-bold text-default-600 uppercase tracking-wide">Contraseña</label>
                            <button type="button" onClick={() => setIsForgotPwOpen(true)} className="text-[10px] font-bold text-[#b08968] hover:underline focus:outline-none">¿Olvidaste tu contraseña?</button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#b08968" }} />
                            <input type="password" name="password" required className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl outline-none bg-field text-foreground placeholder-default-500 focus:border-[#b08968] focus:bg-default transition-colors font-medium" placeholder="••••••••" />
                          </div>
                        </div>

                      {/* Login error as HeroUI alert */}
                      {loginError && (
                        <Alert status="danger" className="py-2">
                          <Alert.Indicator />
                          <Alert.Content>
                            <Alert.Description>{loginError}</Alert.Description>
                          </Alert.Content>
                        </Alert>
                      )}

                      <button type="submit" className="w-full py-3 mt-2 rounded-xl text-white font-extrabold hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg" style={{ backgroundColor: "#b08968", shadowColor: "rgba(176, 137, 104, 0.4)" }}>
                        Entrar
                      </button>
                      
                      <div className="relative my-5"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-divider"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-overlay px-2 text-default-500 font-bold">O</span></div></div>
                      
                      <button type="button" onClick={() => loginWithGoogle()} className="w-full flex items-center justify-center space-x-3 py-3 border-2 border-border text-foreground-700 rounded-xl hover:bg-default-hover transition-colors font-bold truncate">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
                        <span>Continuar con Google</span>
                      </button>
                    </form>

                    <div className="mt-5 pt-5 border-t border-divider space-y-2">
                       <p className="text-center text-sm font-medium text-default-500">¿No tienes cuenta? <a href="/Register" className="font-extrabold hover:underline ml-1" style={{ color: "#b08968" }}>Regístrate</a></p>
                    </div>
                  </>
                )
                ) : (
                  <div className="space-y-4">
                    {/* Avatar + info */}
                    <div className="flex items-center space-x-3 pb-4 border-b border-divider">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 p-0.5" style={{ borderColor: "#b08968" }}>
                        <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover rounded-full"/>
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-extrabold text-foreground truncate text-lg">{profile?.username || user?.user_metadata?.user_name || user?.user_metadata?.full_name || "Usuario"}</p>
                        <p className="text-xs font-medium text-default-500 truncate w-40">{user.email}</p>
                      </div>
                    </div>

                    {/* Ver perfil */}
                   <button
                      onClick={() => {
                        window.location.href = "/Perfil";
                        setIsLoginOpen(false);
                      }}
                      className="block w-full py-3 text-center rounded-xl text-white font-bold hover:scale-[1.02] transition-all shadow-md"
                      style={{ backgroundColor: "#b08968" }}
                    >
                      Ver mi perfil
                    </button>

                    {/* Logout */}
                    <button onClick={handleLogout} className="w-full py-3 text-center rounded-xl text-default-600 font-bold hover:bg-danger-soft hover:text-danger flex items-center justify-center transition-colors">
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`md:hidden p-2 rounded-lg ${isScrolled || (!isDarkMode && !isHomePage) ? "text-gray-800 dark:text-white" : "text-white"}`}>
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>

          {/* Mobile menu */}
          <div className={`md:hidden absolute top-full left-0 right-0 bg-background shadow-2xl transition-all duration-300 overflow-hidden z-40 ${isMobileMenuOpen ? "max-h-[1000px] py-4 border-t border-divider" : "max-h-0"}`}>
            <div className="px-4 space-y-3">
              <div className="flex justify-between items-center mb-4 px-4 pb-4 border-b border-divider">
                  <span className="text-sm font-bold text-default-500 uppercase tracking-wider">Modo Oscuro</span>
                  <button onClick={toggleDarkMode} className="p-2 rounded-full bg-default text-default-600 hover:bg-default-hover">
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
              </div>
              
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = window.location.pathname === link.href;
                return (
                  <a key={link.id} href={link.href} className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? "bg-default" : "hover:bg-default-hover"}`}>
                    <Icon className="w-5 h-5" style={{ color: isActive ? "#b08968" : "var(--color-default-500)" }} />
                    <span className={`font-medium ${isActive ? "font-bold text-[#b08968]" : "text-foreground-600"}`}>{link.label}</span>
                  </a>
                );
              })}

              {/* User section mobile */}
              {!isLoggedIn ? (
                <div className="mt-6 pt-6 border-t border-divider space-y-4 px-2">
                  <form onSubmit={handleLogin} className="space-y-3">
                    <input type="email" name="email" placeholder="Email" className="w-full px-5 py-3.5 border-2 border-transparent bg-field text-foreground placeholder-default-500 focus:border-[#b08968] focus:bg-default rounded-xl outline-none transition-all font-medium" />
                    <input type="password" name="password" placeholder="Contraseña" className="w-full px-5 py-3.5 border-2 border-transparent bg-field text-foreground placeholder-default-500 focus:border-[#b08968] focus:bg-default rounded-xl outline-none transition-all font-medium" />
                    {loginError && (
                      <Alert status="danger" className="py-2">
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Description>{loginError}</Alert.Description>
                        </Alert.Content>
                      </Alert>
                    )}
                    <button type="submit" className="w-full py-4 rounded-xl text-white font-extrabold text-lg shadow-lg" style={{ backgroundColor: "#b08968" }}>Iniciar sesión</button>
                  </form>
                  <div className="relative my-5"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-divider"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-default-500 font-bold">O</span></div></div>
                  
                  <button onClick={() => loginWithGoogle()} className="w-full flex items-center justify-center space-x-3 py-4 border-2 border-border rounded-xl font-bold text-foreground-700 hover:bg-default-hover transition-colors">
                     <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
                     <span>Continuar con Google</span>
                  </button>
                  <div className="flex justify-between items-center text-sm pt-4 px-2">
                    <a href="/Register" className="font-extrabold" style={{ color: "#b08968" }}>Crear cuenta</a>
                    <a href="/Login" className="text-default-500 font-medium hover:text-default-700">¿Olvidaste tu contraseña?</a>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-divider space-y-4 px-2">
                  <div className="flex items-center space-x-4 p-4 bg-default rounded-2xl overflow-hidden">
                    <img src={currentAvatar} alt="Avatar" className="w-12 h-12 object-cover rounded-full border-2 border-divider"/>
                    <div className="overflow-hidden">
                      <p className="font-extrabold text-foreground truncate text-lg">{profile?.username || "Usuario"}</p>
                      <p className="text-sm font-medium text-default-500 truncate w-48">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <a href="/Perfil" className="flex items-center justify-center w-full py-3.5 rounded-xl text-white font-bold transition-transform active:scale-95" style={{ backgroundColor: "#b08968" }}>Perfil</a>
                    <button onClick={logout} className="flex items-center justify-center w-full py-3.5 rounded-xl font-bold bg-danger-soft active:scale-95 transition-transform text-danger">Salir</button>
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