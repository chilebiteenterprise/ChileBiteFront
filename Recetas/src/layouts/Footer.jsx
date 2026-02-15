import { ChefHat, Instagram, Twitter, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const footerLinks = {
    company: [{ label: "Blog", href: "#" }],
    resources: [
      { label: "Recetas", href: "/Recetas" },
      { label: "Locales", href: "#" },
      { label: "Comunidad", href: "#" },
    ],
    legal: [
      { label: "Términos de Uso", href: "#" },
      { label: "Política de Privacidad", href: "#" },
      { label: "Cookies", href: "#" } /*Completar links*/,
      { label: "Licencias", href: "#" },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-stone-900 to-stone-800 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ backgroundColor: "#b08968" }}
                />
                <ChefHat
                  className="w-10 h-10 relative z-10 transition-transform duration-300 group-hover:rotate-12"
                  style={{ color: "#b08968" }}
                />
              </div>
              <span className="text-3xl font-bold" style={{ color: "#b08968" }}>
                Chilebite
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Descubre el mundo de la gastronomía, encuentra locales increíbles
              y conecta con otros amantes de la comida.
            </p>
            <div className="flex space-x-4 pt-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: "#b08968" }}>
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: "#b08968" }}>
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: "#b08968" }}>
              Compañía
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: "#b08968" }}>
              Recursos
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-lg mb-4" style={{ color: "#b08968" }}>
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors duration-300 hover:translate-x-1 inline-block">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#b08968" }}>
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm text-white">contacto@Chilebite</p>
              </div>
            </div>
            <div className="flex items-center space-x-3"></div>
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#b08968" }}>
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Ubicación</p>
                <p className="text-sm text-white">Las Cabras, Chile</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            © 2025 Chilebite. Todos los derechos reservados.
          </p>
          <p className="text-sm text-gray-400">
            Hecho con amor para los amantes de la buena comida
          </p>
        </div>
      </div>
    </footer>
  );
}
