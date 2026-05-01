import { ChefHat, Instagram, Youtube, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const footerLinks = {
    company: [{ label: "La Ruta", href: "/blog" }],
    resources: [
      { label: "Recetas", href: "/recipes" },
      { label: "Calculadora de Macros", href: "/calculadora" },
      { label: "Locales", href: "#" },
      { label: "Comunidad", href: "#" },
    ],
    legal: [
      { label: "Términos de Uso", href: "#" },
      { label: "Política de Privacidad", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Licencias", href: "#" },
    ],
  };

  return (
    <footer className="bg-black text-gray-300 pt-16 pb-8 border-t border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 rounded-full opacity-20 bg-[#b08968] group-hover:opacity-30 transition-opacity duration-300 blur-sm" />
                <ChefHat className="w-10 h-10 relative z-10 text-[#b08968] transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                Chile<span className="text-[#b08968]">Bite</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mt-4">
              Descubre el mundo de la gastronomía, encuentra locales increíbles y conecta con otros amantes de la comida tradicional e innovadora.
            </p>
            <div className="flex space-x-4 pt-6">
              <a href="https://www.instagram.com/chilebite.channel?utm_source=qr&igsh=aGpkczc4aWp2dGg%3D" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-[#b08968] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@chilebite_tk?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-[#b08968] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@chilebite.channel?si=nl7r_XeXHuXzAevG" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-[#b08968] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-[#b08968] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white relative inline-block">
              Compañía
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-[#b08968] rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-400 hover:text-[#b08968] text-sm transition-all duration-300 hover:translate-x-1 inline-block font-medium">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
             <h3 className="font-bold text-lg mb-6 text-white relative inline-block">
              Recursos
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-[#b08968] rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                   <a href={link.href} className="text-gray-400 hover:text-[#b08968] text-sm transition-all duration-300 hover:translate-x-1 inline-block font-medium">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
             <h3 className="font-bold text-lg mb-6 text-white relative inline-block">
              Legal
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-[#b08968] rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                   <a href={link.href} className="text-gray-400 hover:text-[#b08968] text-sm transition-all duration-300 hover:translate-x-1 inline-block font-medium">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4 bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-800 transition-colors">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#b08968]/10 text-[#b08968]">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-white">contacto@chilebite.cl</p>
              </div>
            </div>
            <div className="hidden md:block"></div>
            <div className="flex items-center space-x-4 bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-800 transition-colors">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#b08968]/10 text-[#b08968]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Ubicación</p>
                <p className="text-sm font-medium text-white">Las Cabras, Chile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
          <p className="text-sm text-gray-400 font-medium">
            © {new Date().getFullYear()} ChileBite. Todos los derechos reservados.
          </p>
          <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
            Hecho con <span className="text-red-500">❤</span> para los amantes de la buena comida
          </p>
        </div>
      </div>
    </footer>
  );
}
