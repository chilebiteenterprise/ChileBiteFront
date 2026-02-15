import { useState, useEffect, useRef } from "react";
import { ChefHat, BookOpen, MapPin, User, Menu, X, Mail, Lock } from "lucide-react";

/**
 * Navbar principal
 * Funcionalidades:
 * - Login/logout (desktop y mobile)
 * - Persistencia de sesión con localStorage
 * - Mensajes de error de login visibles
 * - Mostrar avatar y email del usuario
 * - Responsive: mobile menu
 * 
 * Pendientes para producción:
 * - HttpOnly cookies en lugar de localStorage
 * - Toasts más profesionales
 * - Optimización de re-render con React Router
 */


export default function Navbar() {
  // ===== Estados =====
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); 
  const [loginError, setLoginError] = useState(null); 
  const loginRef = useRef(null);


  
  // ===== Logout =====
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    setIsLoginOpen(false);
  };

  // ===== Persistir login al recargar =====
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // ===== Exponer función para abrir login desde otro componente =====
  useEffect(() => {
    window.abrirLoginNavbar = () => setIsLoginOpen(true);
  }, []);


  // ===== Scroll y click fuera =====
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    const handleClickOutside = (event) => {
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setIsLoginOpen(false);
        setLoginError(null);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ===== Links de navegación =====
  const navLinks = [
    { id: "recetas", label: "Recetas", href: "/Recetas", icon: BookOpen },
    { id: "locales", label: "Locales", href: "/Locales", icon: MapPin },
  ];

  // ===== Login =====
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Error inesperado. Revisa tus datos.");
        return;
      }

      // ===== Guardar tokens y datos del usuario =====
      // Para producción: usar HttpOnly cookies en lugar de localStorage
      localStorage.setItem("access_token", data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setIsLoggedIn(true);
      setIsLoginOpen(false);
      setLoginError(null);
    } catch (error) {
      console.error("Error de conexión:", error);
      setLoginError("Error de conexión. Intenta nuevamente.");
    }
  };

  const handleUserClick = () => {
    setIsLoginOpen(!isLoginOpen);
    setLoginError(null);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300" style={{ backgroundColor: "#b08968" }} />
              <ChefHat className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:rotate-12" style={{ color: "#b08968" }} />
            </div>
            <span className="text-2xl font-bold tracking-tight transition-all duration-300 group-hover:tracking-wide" style={{ color: "#b08968" }}>
              Chilebite
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = window.location.pathname === link.href;
              return (
                <a key={link.id} href={link.href} className="relative px-4 py-2 rounded-lg transition-all duration-300 group">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} style={{ color: isActive ? "#b08968" : "#6b7280" }} />
                    <span className={`font-medium transition-colors duration-300 ${isActive ? "font-semibold" : ""}`} style={{ color: isActive ? "#b08968" : "#6b7280" }}>{link.label}</span>
                  </div>
                </a>
              );
            })}
          </div>

          {/* User actions desktop */}
          <div className="hidden md:flex items-center relative" ref={loginRef}>
            <button onClick={handleUserClick} className="p-2 rounded-full transition-all duration-300 hover:scale-110" style={{ backgroundColor: "#b08968" }}>
              <User className="w-5 h-5 text-white" />
            </button>

            {isLoginOpen && (
              <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-2xl p-6 z-50">
                {!isLoggedIn ? (
                  <>
                    <h3 className="text-xl font-bold mb-4" style={{ color: "#b08968" }}>Iniciar Sesión</h3>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#9ca3af" }} />
                          <input type="email" name="email" required className="w-full pl-10 pr-4 py-2 border-2 rounded-lg outline-none" placeholder="tu@email.com" />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#9ca3af" }} />
                          <input type="password" name="password" required className="w-full pl-10 pr-4 py-2 border-2 rounded-lg outline-none" placeholder="••••••••" />
                        </div>
                      </div>

                      {/* Login error */}
                      {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

                      <button type="submit" className="w-full py-2.5 rounded-lg text-white font-medium" style={{ backgroundColor: "#b08968" }}>
                        Iniciar Sesión
                      </button>
                    </form>

                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                      <a href="/Login" className="block text-center text-sm py-2 rounded-lg" style={{ color: "#b08968" }}>Recuperar contraseña</a>
                      <a href="/Register" className="block text-center text-sm py-2 rounded-lg font-medium" style={{ color: "#b08968", backgroundColor: "#f5f0ec" }}>Crear cuenta nueva</a>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    {/* Avatar + email */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#f5f0ec" }}>
                        <img src={user.avatar || "/default-avatar.png"} alt="Avatar"className="w-12 h-12 object-cover"/>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user?.email}</p>
                      </div>
                    </div>

                    {/* Ver perfil */}
                   <button
                      onClick={() => {
                        window.location.href = "/Perfil";
                        setIsLoginOpen(false); // cerrar dropdown
                      }}
                      className="block w-full py-2.5 text-center rounded-lg text-white font-medium"
                      style={{ backgroundColor: "#b08968" }}
                    >
                      Ver mi perfil
                    </button>

                    {/* Logout */}
                    <button onClick={handleLogout} className="block w-full py-2.5 text-center rounded-lg text-white font-medium hover:opacity-90 transition" style={{ backgroundColor: "#a15c38" }}>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg" style={{ color: "#b08968" }}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile menu */}
          <div className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-300 overflow-hidden z-40 ${isMobileMenuOpen ? "max-h-[1000px] py-4" : "max-h-0"}`}>
            <div className="px-4 space-y-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = window.location.pathname === link.href;
                return (
                  <a key={link.id} href={link.href} className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? "bg-[#f5f0ec]" : "hover:bg-gray-50"}`}>
                    <Icon className="w-5 h-5" style={{ color: isActive ? "#b08968" : "#6b7280" }} />
                    <span className={`font-medium ${isActive ? "font-semibold" : ""}`} style={{ color: isActive ? "#b08968" : "#6b7280" }}>{link.label}</span>
                  </a>
                );
              })}

              {/* User section mobile */}
              {!isLoggedIn ? (
                <div className="mt-3 space-y-2">
                  <form onSubmit={handleLogin} className="space-y-2">
                    <input type="email" name="email" placeholder="Email" className="w-full px-3 py-2 border rounded-lg outline-none" />
                    <input type="password" name="password" placeholder="Contraseña" className="w-full px-3 py-2 border rounded-lg outline-none" />
                    {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                    <button type="submit" className="w-full py-2 rounded-lg text-white font-medium" style={{ backgroundColor: "#b08968" }}>Iniciar sesión</button>
                  </form>
                  <a href="/Login" className="block text-center text-sm py-2 rounded-lg text-[#b08968] hover:bg-gray-50">Recuperar contraseña</a>
                  <a href="/Register" className="block text-center text-sm py-2 rounded-lg font-medium text-[#b08968]" style={{ backgroundColor: "#f5f0ec" }}>Crear cuenta nueva</a>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-3 p-2 bg-[#f5f0ec] rounded-lg overflow-hidden">
                    <img src={user?.avatar_url || ""} alt="Avatar" className="w-8 h-8 object-cover rounded-full"/>
                    <div>
                      <p className="font-semibold text-gray-800">{user?.email}</p>
                    </div>
                  </div>
                  <a href="/Perfil" className="block w-full py-2.5 text-center rounded-lg text-white font-medium" style={{ backgroundColor: "#b08968" }}>Ver mi perfil</a>
                  <button onClick={handleLogout} className="block w-full py-2.5 text-center rounded-lg text-white font-medium hover:opacity-90 transition" style={{ backgroundColor: "#a15c38" }}>Cerrar sesión</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}