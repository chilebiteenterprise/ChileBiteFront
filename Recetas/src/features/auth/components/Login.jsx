import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';
import { useAuth, AuthProvider } from '@/features/auth/context/AuthContext';
import { Toast, toast, Alert } from "@heroui/react";

function LoginContent() {
  const { loginWithGoogle, loginWithEmail, verifyMfaCode } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false); 
  const [isForgotPw, setIsForgotPw] = useState(false); 
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [formData, setFormData] = useState({
    nombres: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const cancelMfaChallenge = async () => {
    setMfaChallenge(null);
    setMfaCode("");
    setErrors({});
    await supabase.auth.signOut({ scope: "local" });
  };

  const validate = () => {
    const newErrors = {};
    if (mfaChallenge) {
      if (!/^\d{6}$/.test(mfaCode)) newErrors.mfa = "Ingresa el código de 6 dígitos";
      return newErrors;
    }

    if (!formData.email) newErrors.email = "Ingresa tu correo";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Correo inválido";

    if (isForgotPw) return newErrors;

    if (!isLogin) {
      if (!formData.nombres) newErrors.nombres = "Ingresa tus nombres";
      if (!formData.apellido_paterno) newErrors.apellido_paterno = "Ingresa apellido paterno";
      if (!formData.username) newErrors.username = "Ingresa un nombre de usuario";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    if (!formData.password) newErrors.password = "Ingresa tu contraseña";
    
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
    try {
      if (isForgotPw) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/RecuperarPassword`,
        });
        if (error) throw error;
        toast.success("Te enviamos instrucciones a tu correo para restablecer tu contraseña.");
        setFormData({ ...formData, email: "" });
        setIsForgotPw(false);
        setLoading(false);
        return;
      }

      if (isLogin) {
        if (mfaChallenge) {
          const { error } = await verifyMfaCode(mfaChallenge.factorId, mfaCode);
          if (error) throw error;
          toast.success("¡Sesión verificada! Bienvenido de vuelta.");
          setTimeout(() => { window.location.href = "/"; }, 1000);
          return;
        }

        const { error, mfaRequired, factorId } = await loginWithEmail(formData.email, formData.password);
        if (error) throw error;
        if (mfaRequired) {
          setMfaChallenge({ factorId, email: formData.email });
          setMfaCode("");
          toast.success("Ingresa el código de tu app autenticadora para continuar.");
          return;
        }
        toast.success("¡Sesión iniciada! Bienvenido de vuelta.");
        setTimeout(() => { window.location.href = "/"; }, 1000);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: `${formData.nombres} ${formData.apellido_paterno}`,
              user_name: formData.username,
              nombres: formData.nombres,
              apellido_paterno: formData.apellido_paterno,
              apellido_materno: formData.apellido_materno,
              avatar_url: `https://ui-avatars.com/api/?name=${formData.nombres}+${formData.apellido_paterno}&background=b08968&color=fff`,
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          toast.success("¡Cuenta creada exitosamente! Bienvenido a ChileBite.");
          setTimeout(() => { window.location.href = "/"; }, 1200);
        } else {
          toast.success("¡Registro exitoso! Verifica tu correo para continuar.");
          setIsLogin(true);
        }
      }
    } catch (err) {
      setErrors({ global: err.message || "Error en la autenticación" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-surface/80 rounded-[2.5rem] shadow-2xl shadow-stone-200/50 dark:shadow-none p-10 md:p-12 border border-border backdrop-blur-xl transition-all duration-300">
      <Toast.Provider placement="bottom end" />
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-foreground">
          {mfaChallenge ? "Verifica tu acceso" : isForgotPw ? "Recuperar Contraseña" : isLogin ? "¡Hola de nuevo!" : "Crea tu Cuenta"}
        </h1>
        <p className="text-default-500 font-medium tracking-wide">
          {mfaChallenge
            ? "Ingresa el código de 6 dígitos de tu app autenticadora"
            : isForgotPw
            ? "Ingresa tu correo y te enviaremos un enlace mágico" 
            : isLogin ? "Inicia sesión para descubrir nuevos sabores" : "Únete a la comunidad gastronómica de Chile"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mfaChallenge ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-default border border-border">
              <ShieldCheck className="w-5 h-5 shrink-0 text-[#b08968]" />
              <p className="text-sm text-default-600">
                Cuenta protegida: {mfaChallenge.email}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-default-600 uppercase tracking-widest ml-1">Código 2FA</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => {
                  setMfaCode(e.target.value.replace(/\D/g, ""));
                  setErrors({ ...errors, mfa: "", global: "" });
                }}
                placeholder="000000"
                className="w-full px-5 py-4 mt-1 rounded-2xl text-center text-xl font-mono tracking-[0.4em] bg-field hover:bg-field-hover border-2 border-transparent focus:border-[#b08968] focus:bg-default text-foreground outline-none transition-all placeholder-default-500"
              />
              {errors.mfa && <p className="text-danger-500 text-xs mt-1 ml-1 font-bold">{errors.mfa}</p>}
            </div>
          </div>
        ) : !isLogin && !isForgotPw && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
             <div>
                <label className="text-xs font-bold text-default-600 uppercase tracking-widest ml-1">Username</label>
                <div className="relative mt-1">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b08968]" />
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="nombre_usuario"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-field hover:bg-field-hover border-2 border-transparent focus:border-[#b08968] focus:bg-default text-foreground outline-none transition-all font-medium placeholder-default-500" />
                </div>
                {errors.username && <p className="text-danger-500 text-xs mt-1 ml-1 font-bold">{errors.username}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="text-xs font-bold text-default-600 uppercase tracking-widest ml-1">Nombres</label>
                  <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Juan"
                    className="w-full px-5 py-4 mt-1 rounded-2xl bg-field hover:bg-field-hover border-2 border-transparent focus:border-[#b08968] focus:bg-default text-foreground outline-none transition-all font-medium placeholder-default-500" />
                  {errors.nombres && <p className="text-danger-500 text-xs mt-1 font-bold">{errors.nombres}</p>}
               </div>
               <div>
                  <label className="text-xs font-bold text-default-600 uppercase tracking-widest ml-1">Apellido</label>
                  <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} placeholder="Pérez"
                    className="w-full px-5 py-4 mt-1 rounded-2xl bg-field hover:bg-field-hover border-2 border-transparent focus:border-[#b08968] focus:bg-default text-foreground outline-none transition-all font-medium placeholder-default-500" />
                  {errors.apellido_paterno && <p className="text-danger-500 text-xs mt-1 font-bold">{errors.apellido_paterno}</p>}
               </div>
            </div>
          </div>
        )}

        {!mfaChallenge && <div>
          <label className="text-xs font-bold text-default-600 uppercase tracking-widest ml-1">Correo Electrónico</label>
          <div className="relative mt-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b08968]" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ejemplo@correo.com"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-field hover:bg-field-hover border-2 border-transparent focus:border-[#b08968] focus:bg-default text-foreground outline-none transition-all font-medium placeholder-default-500" />
          </div>
          {errors.email && <p className="text-danger-500 text-xs mt-1 ml-1 font-bold">{errors.email}</p>}
        </div>}

        {!isForgotPw && !mfaChallenge && (
          <div className={`grid grid-cols-1 ${!isLogin ? 'md:grid-cols-2' : ''} gap-6`}>
            <div>
              <label className="text-xs font-bold text-default-600 uppercase tracking-widest ml-1">Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b08968]" />
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-field hover:bg-field-hover border-2 border-transparent focus:border-[#b08968] focus:bg-default text-foreground outline-none transition-all font-medium placeholder-default-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-default-500 hover:text-[#b08968] transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {isLogin && (
              <div className="flex justify-end mt-2 px-1">
                <button type="button" onClick={() => setIsForgotPw(true)} className="text-xs font-bold text-[#b08968] hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
            {errors.password && <p className="text-danger-500 text-xs mt-1 ml-1 font-bold">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-default-600 uppercase tracking-widest ml-1">Confirmar</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b08968]" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-field hover:bg-field-hover border-2 border-transparent focus:border-[#b08968] focus:bg-default text-foreground outline-none transition-all font-medium placeholder-default-500" />
              </div>
              {errors.confirmPassword && <p className="text-danger-500 text-xs mt-1 ml-1 font-bold">{errors.confirmPassword}</p>}
            </div>
          )}
        </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-[#b08968]/30 dark:shadow-[#b08968]/20 mt-4 flex items-center justify-center gap-2"
          style={{ backgroundColor: "#b08968" }}>
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (mfaChallenge ? "Verificar código" : isForgotPw ? "Enviar enlace mágico" : isLogin ? "Entrar ahora" : "Completar Registro")}
        </button>

      {errors.global && (
        <Alert status="danger" className="mt-4">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{errors.global}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      </form>

      <div className="mt-8 text-center border-t border-divider pt-8">
        <p className="text-sm font-medium text-default-500">
          {mfaChallenge ? (
            <button type="button" onClick={cancelMfaChallenge} className="text-[#b08968] font-extrabold hover:underline">
               Volver al inicio de sesión
            </button>
          ) : isForgotPw ? (
            <button type="button" onClick={() => setIsForgotPw(false)} className="text-[#b08968] font-extrabold hover:underline">
               Volver al inicio de sesión
            </button>
          ) : (
            <>
              {isLogin ? "¿Eres nuevo por aquí? " : "¿Ya tienes una cuenta? "}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setMfaChallenge(null); setMfaCode(""); }} className="text-[#b08968] font-extrabold hover:underline ml-1">
                {isLogin ? "Crea una cuenta gratis" : "Inicia sesión"}
              </button>
            </>
          )}
        </p>
      </div>
      
      {!isForgotPw && !mfaChallenge && (
        <div className="mt-6">
            <button type="button" onClick={() => loginWithGoogle()} className="w-full flex items-center justify-center gap-3 py-4 border-2 border-border rounded-2xl font-bold text-foreground-700 hover:bg-default-hover transition-all">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
                Continuar con Google
            </button>
        </div>
      )}
    </div>
  );
}

export default function LoginRegister() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
