import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Sparkles, ArrowRight } from 'lucide-react';
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
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else if (err.code === 'auth/invalid-email') {
        setError('El formato del correo electrónico no es válido.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña es demasiado débil.');
      } else {
        setError('Error al procesar la solicitud. Por favor intenta de nuevo.');
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
    <div className="min-h-screen bg-apple-bg flex flex-col justify-center items-center px-4 py-8 animate-fade-in">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-apple-green to-apple-teal rounded-3xl mx-auto flex items-center justify-center shadow-apple mb-4 transform hover:scale-105 transition-transform duration-300">
            <span className="text-4xl">🍏</span>
          </div>
          <h1 className="apple-large-title text-gray-900 tracking-tight">NutriFamilia</h1>
          <p className="text-sm text-apple-gray-1 mt-1.5">
            Alimentación balanceada y salud para tu familia
          </p>
        </div>

        {/* Auth Card */}
        <div className="apple-glass rounded-apple-lg p-6 sm:p-8 shadow-apple border border-white/60">
          
          {/* Segmented Control Toggle */}
          <div className="flex bg-apple-gray-6 rounded-apple-sm p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-2.5 rounded-[10px] text-xs sm:text-sm font-semibold transition-all duration-200 ${
                !isRegister ? 'bg-white text-gray-900 shadow-apple' : 'text-apple-gray-1 hover:text-gray-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-2.5 rounded-[10px] text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isRegister ? 'bg-white text-gray-900 shadow-apple' : 'text-apple-gray-1 hover:text-gray-900'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50/90 border border-apple-red/20 rounded-apple-sm text-apple-red text-xs sm:text-sm font-medium animate-scale-in flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-apple-red flex-shrink-0" />
              <span>{error}</span>
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

            {/* Email Field */}
            <div>
              <label className="apple-section-title">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-apple-gray-2 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="apple-input pl-11 w-full"
                  autoComplete="email"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-apple-gray-2 hover:text-apple-gray-1 p-1 rounded-full transition-colors focus:outline-none"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-apple-blue" />
                  ) : (
                    <Eye className="w-5 h-5 text-apple-gray-2" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up Only) with Show/Hide Toggle */}
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-apple-gray-2 hover:text-apple-gray-1 p-1 rounded-full transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
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
              className="apple-btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 font-semibold shadow-apple disabled:opacity-50"
            >
              <span>{loading ? 'Procesando...' : (isRegister ? 'Registrarme' : 'Entrar')}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-2 text-apple-gray-2 backdrop-blur-sm">O</span>
            </div>
          </div>

          {/* Guest Mode */}
          <button
            type="button"
            onClick={handleGuest}
            className="w-full py-3 px-4 border border-apple-gray-4 rounded-apple-sm text-xs sm:text-sm font-medium text-apple-gray-1 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-apple-orange" />
            <span>Continuar como Invitado (Modo Local)</span>
          </button>
        </div>

        {/* Security / Privacy footer note */}
        <p className="text-center text-xs text-apple-gray-2 mt-6">
          🔒 Cada usuario cuenta con su despensa, recetas y planes totalmente privados y aislados.
        </p>
      </div>
    </div>
  );
}
