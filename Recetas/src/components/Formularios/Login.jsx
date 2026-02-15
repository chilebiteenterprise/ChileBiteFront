import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Loader from "../Botones/Loader";

export default function Register({ abrirLogin, setUserNavbar }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombres) newErrors.nombres = "Ingresa tus nombres";
    if (!formData.apellido_paterno) newErrors.apellido_paterno = "Ingresa apellido paterno";
    if (!formData.apellido_materno) newErrors.apellido_materno = "Ingresa apellido materno";
    if (!formData.email) newErrors.email = "Ingresa tu correo";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Correo inválido";
    if (!formData.password) newErrors.password = "Ingresa tu contraseña";
    // En el futuro afregar más validaciones de seguridad
    // if (formData.password.length < 8) newErrors.password = "Debe tener al menos 8 caracteres";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const userData = {
      username: formData.email.split("@")[0],
      nombres: formData.nombres,
      apellido_paterno: formData.apellido_paterno,
      apellido_materno: formData.apellido_materno,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    try {
      // Crear usuario
      const res = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error al registrar usuario: " + JSON.stringify(data));
        return;
      }

      // Loguear automáticamente al usuario recién creado
      const loginRes = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        alert("Usuario creado, pero fallo el login automático: " + JSON.stringify(loginData));
        return;
      }

      // Guardar tokens y usuario en localStorage
      localStorage.setItem("access_token", loginData.tokens.access);
      localStorage.setItem("refresh_token", loginData.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(loginData.user));

      // Actualizar estado del navbar
      if (setUserNavbar) setUserNavbar(loginData.user);

      // Redirigir al home
      window.location.href = "/";

    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#b08968" }}>Crear Cuenta</h1>
            <p className="text-gray-600">Únete a nuestra comunidad gastronómica</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  placeholder="Tus nombres"
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-xl outline-none transition-colors duration-300"
                  style={{ borderColor: errors.nombres ? "red" : "#e5e7eb" }}
                />
                {errors.nombres && <p className="text-red-500 text-sm mt-1">{errors.nombres}</p>}
              </div>
            </div>

            {/* Apellidos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno</label>
                <input
                  type="text"
                  name="apellido_paterno"
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  placeholder="Apellido Paterno"
                  className="w-full pl-3 pr-3 py-3 border-2 rounded-xl outline-none transition-colors duration-300"
                  style={{ borderColor: errors.apellido_paterno ? "red" : "#e5e7eb" }}
                />
                {errors.apellido_paterno && <p className="text-red-500 text-sm mt-1">{errors.apellido_paterno}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                <input
                  type="text"
                  name="apellido_materno"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                  placeholder="Apellido Materno"
                  className="w-full pl-3 pr-3 py-3 border-2 rounded-xl outline-none transition-colors duration-300"
                  style={{ borderColor: errors.apellido_materno ? "red" : "#e5e7eb" }}
                />
                {errors.apellido_materno && <p className="text-red-500 text-sm mt-1">{errors.apellido_materno}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-xl outline-none transition-colors duration-300"
                  style={{ borderColor: errors.email ? "red" : "#e5e7eb" }}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

{/* Contraseña y Confirmar */}
<div className="grid grid-cols-2 gap-6">
  {/* Contraseña */}
  <div className="flex flex-col">
    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        className="w-full pl-10 pr-12 py-3 border-2 rounded-xl outline-none transition-colors duration-300"
        style={{ borderColor: errors.password ? "red" : "#e5e7eb" }}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
      </button>
    </div>
    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
    <p className="text-xs text-gray-500 mt-1">
      La contraseña debe tener al menos 8 caracteres, incluir mayúsculas y números.
    </p>
  </div>

  {/* Confirmar Contraseña */}
  <div className="flex flex-col">
    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type={showConfirmPassword ? "text" : "password"}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
        className="w-full pl-10 pr-12 py-3 border-2 rounded-xl outline-none transition-colors duration-300"
        style={{ borderColor: errors.confirmPassword ? "red" : "#e5e7eb" }}
      />
      <button
        type="button"
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
      </button>
    </div>
    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
  </div>
</div>


            {/* Botón Crear Cuenta o Loader */}
            <div>
              {loading ? <Loader client:only="react" /> : (
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
                  style={{ backgroundColor: "#b08968" }}
                >
                  Crear Cuenta
                </button>
              )}
            </div>

            {/* Error global */}
            {errors.global && <p className="text-red-500 text-center mt-2">{errors.global}</p>}
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <span
                onClick={() => {
                  if (window.abrirLoginNavbar) {
                    window.abrirLoginNavbar();
                  } else {
                    console.warn("No se encontró la función abrirLoginNavbar");
                  }
                }}
                className="font-semibold hover:underline cursor-pointer"
                style={{ color: "#b08968" }}
              >
                Inicia sesión aquí
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
