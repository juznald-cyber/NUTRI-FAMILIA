import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { signIn, signUp, signInAsGuest } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (isRegister) {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await signUp(email.trim(), password, name.trim());
      } else {
        await signIn(email.trim(), password);
      }
      navigate('/');
    } catch (err: any) {
      console.error("Login catch error:", err);
      if (err.code === 'auth/wrong-password') {
        setError('Contraseña incorrecta. Verifica tu clave.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Usuario no encontrado o clave errónea. Si aún no te has registrado, toca "Crear Cuenta" arriba.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo/usuario ya existe. Inicia sesión con tu clave.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Formato de correo no válido.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError(err.message || 'Error al iniciar sesión. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    signInAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-apple-bg dark:bg-black flex flex-col justify-center items-center px-4 py-8 animate-fade-in transition-colors">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <img
            src="favicon.svg"
            alt="NutriFamilia Logo"
            className="w-20 h-20 rounded-3xl mx-auto shadow-apple mb-4 transform hover:scale-105 transition-transform duration-300"
          />
          <h1 className="apple-large-title text-gray-900 dark:text-white tracking-tight">NutriFamilia</h1>
          <p className="text-sm text-apple-gray-1 dark:text-gray-400 mt-1.5">
            Alimentación balanceada y salud para tu familia
          </p>
        </div>

        {/* Auth Card */}
        <div className="apple-glass rounded-apple-lg p-6 sm:p-8 shadow-apple border border-white/60 dark:border-white/10">
          
          {/* Segmented Control Toggle */}
          <div className="flex bg-apple-gray-6 dark:bg-white/10 rounded-apple-sm p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-2.5 rounded-[10px] text-xs sm:text-sm font-semibold transition-all duration-200 ${
                !isRegister
                  ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-apple'
                  : 'text-apple-gray-1 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-2.5 rounded-[10px] text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isRegister
                  ? 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white shadow-apple'
                  : 'text-apple-gray-1 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/60 border border-apple-red/20 rounded-apple-sm text-apple-red text-xs sm:text-sm font-medium animate-scale-in flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-apple-red flex-shrink-0" />
                <span>{error}</span>
              </div>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className="text-left text-xs font-bold text-apple-blue hover:underline pl-3.5"
                >
                  👉 Toca aquí para Crear Cuenta ahora
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field (Sign Up Only) */}
            {isRegister && (
              <div>
                <label className="apple-section-title">Tu Nombre</label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-apple-gray-2 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Carlos Torres"
                    className="apple-input pl-11 w-full"
                  />
                </div>
              </div>
            )}

            {/* Email / Username Field */}
            <div>
              <label className="apple-section-title">Correo o Usuario</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-apple-gray-2 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com o tu usuario"
                  className="apple-input pl-11 w-full"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <label className="apple-section-title">Contraseña</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-apple-gray-2 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="apple-input pl-11 pr-11 w-full"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-apple-gray-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-apple-blue" />
                  ) : (
                    <Eye className="w-5 h-5 text-apple-gray-2" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up Only) with Show/Hide Toggle */}
            {isRegister && (
              <div>
                <label className="apple-section-title">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-apple-gray-2 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="apple-input pl-11 pr-11 w-full"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-apple-gray-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-1"
                    title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-apple-blue" />
                    ) : (
                      <Eye className="w-5 h-5 text-apple-gray-2" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 apple-btn-primary py-3.5 text-base font-semibold shadow-apple flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Procesando...' : isRegister ? 'Registrarme' : 'Iniciar Sesión'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 dark:bg-[#1C1C1E] px-3 text-apple-gray-1 dark:text-gray-400 font-medium">O ingresa directo</span>
            </div>
          </div>

          {/* Guest Access Button */}
          <button
            type="button"
            onClick={handleGuest}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 rounded-apple-sm text-sm font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-apple-teal" />
            <span>Ingresar en Modo Invitado</span>
          </button>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-apple-gray-1 dark:text-gray-500 mt-6">
          NutriFamilia · Tu información personal está aislada y protegida.
        </p>
      </div>
    </div>
  );
}
