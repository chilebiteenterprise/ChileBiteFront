import { useState, useEffect } from "react";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';
import { Alert, Toast, toast } from "@heroui/react";

export default function ResetPasswordClient() {
  const [formData, setFormData] = useState({ password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorObj, setErrorObj] = useState("");
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Supabase parses the access_token from the URL hash automatically 
      // and establishes a session.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setValidSession(true);
      }
      setChecking(false);
    };
    checkSession();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorObj("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (formData.password !== formData.confirm) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: formData.password });
      if (error) throw error;
      
      toast.success("¡Tu contraseña ha sido actualizada!");
      // Cerrar la sesión de recuperación para obligar un nuevo login, o redirigir
      await supabase.auth.signOut();
      setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch (err) {
      setErrorObj(err.message || "Error al actualizar la contraseña");
      toast.error("Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#b08968]" />
        <p className="mt-4 text-default-500 font-medium">Validando enlace de recuperación...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-surface/80 rounded-[2.5rem] shadow-2xl shadow-stone-200/50 dark:shadow-none p-10 md:p-12 border border-border backdrop-blur-xl transition-all duration-300">
      <Toast.Provider placement="bottom end" />
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-foreground">
          Nueva Contraseña
        </h1>
        <p className="text-default-500 font-medium tracking-wide">
          Crea una nueva clave de acceso para tu cuenta
        </p>
      </div>

      {!validSession ? (
        <div className="text-center">
          <Alert status="danger" className="mb-6">
            <Alert.Indicator />
            <Alert.Content>
               <Alert.Title>Enlace Inválido</Alert.Title>
               <Alert.Description>
                 El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo desde el inicio de sesión.
               </Alert.Description>
            </Alert.Content>
          </Alert>
          <a href="/" className="inline-block mt-4 text-[#b08968] font-bold hover:underline">
            Volver al Inicio de Sesión
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
            <div>
              <label className="text-xs font-bold text-default-600 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b08968]" />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-field hover:bg-field-hover border-2 border-transparent focus:border-[#b08968] focus:bg-default text-foreground outline-none transition-all font-medium placeholder-default-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-default-500 hover:text-[#b08968] transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-default-600 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b08968]" />
                <input type="password" name="confirm" value={formData.confirm} onChange={handleChange} placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-field hover:bg-field-hover border-2 border-transparent focus:border-[#b08968] focus:bg-default text-foreground outline-none transition-all font-medium placeholder-default-500" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-[#b08968]/30 dark:shadow-[#b08968]/20 mt-4 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#b08968" }}>
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Guardar y Continuar"}
          </button>

          {errorObj && (
            <Alert status="danger" className="mt-4">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{errorObj}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
        </form>
      )}
    </div>
  );
}
