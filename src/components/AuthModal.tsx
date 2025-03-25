import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register' | 'reset';
}

export function AuthModal({ isOpen, onClose, mode: initialMode }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [rut, setRut] = useState('');
  const [curso, setCurso] = useState('');
  const [colegio, setColegio] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const formatRut = (value: string) => {
    let cleaned = value.replace(/[^\dkK]/g, '');
    
    if (cleaned.length > 0) {
      const dv = cleaned.slice(-1);
      cleaned = cleaned.slice(0, -1);
      
      if (cleaned.length > 3) {
        cleaned = cleaned.slice(0, -3) + '.' + cleaned.slice(-3);
      }
      if (cleaned.length > 7) {
        cleaned = cleaned.slice(0, -7) + '.' + cleaned.slice(-7);
      }
      
      cleaned = cleaned + '-' + dv;
    }
    
    return cleaned;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (!value.startsWith('+56') && cleaned.length > 0) {
      return '+56' + cleaned;
    }
    
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        // Validate RUT format
        if (!/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/.test(rut)) {
          throw new Error('Formato de RUT inválido. Debe ser XX.XXX.XXX-X');
        }

        // Validate phone format if provided
        if (telefono && !/^\+56[0-9]{9}$/.test(telefono)) {
          throw new Error('Formato de teléfono inválido. Debe ser +56XXXXXXXXX');
        }

        // Validate birth date
        const birthDate = new Date(fechaNacimiento);
        const today = new Date();
        const minDate = new Date('1900-01-01');

        if (birthDate > today || birthDate < minDate) {
          throw new Error('Fecha de nacimiento inválida');
        }

        // Register new user
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre,
              apellido_paterno: apellidoPaterno,
              apellido_materno: apellidoMaterno || null,
              rut,
              curso,
              colegio,
              fecha_nacimiento: fechaNacimiento,
              sexo,
              telefono: telefono || null
            },
            emailRedirectTo: `${window.location.origin}`,
          }
        });

        if (signUpError) throw signUpError;

        toast.success('¡Registro exitoso! Ya puedes iniciar sesión.');
        setMode('login');
      } else if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Email o contraseña incorrectos');
          }
          throw signInError;
        }

        toast.success('¡Bienvenido de vuelta!');
        onClose();
      } else if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/reset-password`
          }
        );

        if (resetError) throw resetError;

        toast.success('Se ha enviado un enlace para restablecer tu contraseña');
        setMode('login');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {mode === 'login' ? 'Iniciar Sesión' : 
             mode === 'register' ? 'Registrarse' : 
             'Restablecer Contraseña'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="apellidoPaterno" className="block text-sm font-medium text-gray-700">
                      Apellido Paterno
                    </label>
                    <input
                      type="text"
                      id="apellidoPaterno"
                      value={apellidoPaterno}
                      onChange={(e) => setApellidoPaterno(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="apellidoMaterno" className="block text-sm font-medium text-gray-700">
                      Apellido Materno
                    </label>
                    <input
                      type="text"
                      id="apellidoMaterno"
                      value={apellidoMaterno}
                      onChange={(e) => setApellidoMaterno(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="rut" className="block text-sm font-medium text-gray-700">
                      RUT
                    </label>
                    <input
                      type="text"
                      id="rut"
                      value={rut}
                      onChange={(e) => setRut(formatRut(e.target.value))}
                      placeholder="12.345.678-9"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="curso" className="block text-sm font-medium text-gray-700">
                      Curso
                    </label>
                    <select
                      id="curso"
                      value={curso}
                      onChange={(e) => setCurso(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="I">I Medio</option>
                      <option value="II">II Medio</option>
                      <option value="III">III Medio</option>
                      <option value="IV">IV Medio</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="colegio" className="block text-sm font-medium text-gray-700">
                      Colegio
                    </label>
                    <input
                      type="text"
                      id="colegio"
                      value={colegio}
                      onChange={(e) => setColegio(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      id="fechaNacimiento"
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">
                      Sexo
                    </label>
                    <select
                      id="sexo"
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(formatPhone(e.target.value))}
                    placeholder="+56912345678"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : 
               mode === 'login' ? 'Iniciar Sesión' : 
               mode === 'register' ? 'Registrarse' : 
               'Enviar Enlace'}
            </button>

            <div className="mt-4 text-center text-sm">
              {mode === 'login' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <div className="mt-2">
                    ¿No tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      Regístrate
                    </button>
                  </div>
                </>
              ) : mode === 'register' ? (
                <div>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    Inicia sesión
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Volver al inicio de sesión
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}