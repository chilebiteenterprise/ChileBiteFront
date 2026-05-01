import { ChefHat, Instagram, Twitter, Mail, MapPin } from "lucide-react";

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
              <a href="https://www.instagram.com/chilebite.channel?utm_source=qr&igsh=aGpkczc4aWp2dGg%3D" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-[#b08968] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-[#b08968] hover:text-white transition-all duration-300 hover:scale-110 shadow-sm">
                <Twitter className="w-5 h-5" />
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
