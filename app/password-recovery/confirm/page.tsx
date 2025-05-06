'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';


export default function PasswordRecoveryConfirm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<
    'initializing' | 'ready' | 'updating' | 'done'
  >('initializing');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  
  // 1) Al montar, parsea el fragmento y guarda los tokens de acceso y actualización
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    // Si no hay token o refresh_token, redirige al login
    if (!access_token || !refresh_token) {
      router.push('/auth/login');
      return;
    }

    setAccessToken(access_token);
    setRefreshToken(refresh_token);
    setStatus('ready');
  }, [router]);

  // 2) Envía la nueva contraseña usando el access_token y refresh_token para actualizar la contraseña
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('updating');

    if (!accessToken || !refreshToken) {
      alert('Token de acceso no disponible. Abre el enlace desde tu correo nuevamente.');
      setStatus('ready');
      return;
    }

    // Configura la sesión con el access_token y refresh_token para poder actualizar la contraseña
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      alert(`Error al establecer la sesión: ${error.message}`);
      setStatus('ready');
      return;
    }

    // Ahora podemos actualizar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      alert(`Error: ${updateError.message}`);
      setStatus('ready');
    } else {
      // Al actualizar la contraseña, cierra sesión para que el usuario inicie con la nueva contraseña
      setStatus('done');
      setTimeout(() => router.push('/auth/login'), 1500);
    }
  };

  if (status === 'initializing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando…</p>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center">
          <p className="text-green-600 font-medium">
            ¡Contraseña actualizada! Redirigiendo al login…
          </p>
        </div>
      </div>
    );
  }
  // Formulario para ingresar la nueva contraseña
  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
      <form
        onSubmit={handleUpdate}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border border-amber-100"
      >
        <h1 className="text-2xl font-bold text-green-800 text-center">
          Nueva contraseña
        </h1>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="Escribe tu nueva contraseña"
            className="w-full p-2 border border-amber-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={status === 'updating'}
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {status === 'updating' ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿Recordaste tu contraseña?{' '}
          <span
            onClick={() => router.push('/auth/login')}
            className="text-green-600 hover:underline cursor-pointer"
          >
            Iniciar sesión
          </span>
        </p>
      </form>
    </main>
  );
}
